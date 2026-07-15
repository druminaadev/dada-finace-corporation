import prisma from '../../config/database.js';
import AppError from '../../utils/appError.js';
import { generateReceiptNo } from '../../utils/idGenerator.js';
import { allocatePayment } from '../../utils/emiCalculator.js';
import { paginate, paginationMeta } from '../../utils/pagination.js';
import Decimal from 'decimal.js';

class CollectionService {
  /** Today's due EMIs */
  async getTodayDues(query) {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    const where = { status: { in: ['PENDING', 'PARTIAL'] }, dueDate: { gte: start, lte: end } };
    if (query.branchId) where.loan = { customer: { branchId: query.branchId } };

    const { skip, take, page, limit } = paginate(query);
    const [emis, total] = await Promise.all([
      prisma.eMISchedule.findMany({ where, skip, take, include: emiInclude, orderBy: { dueDate: 'asc' } }),
      prisma.eMISchedule.count({ where }),
    ]);
    return { emis, pagination: paginationMeta(total, page, limit) };
  }

  /** Upcoming EMIs within N days */
  async getUpcoming(query) {
    const days = parseInt(query.days, 10) || 7;
    const today = new Date();
    const future = new Date(today.getTime() + days * 86400000);
    const where = { status: { in: ['PENDING', 'PARTIAL'] }, dueDate: { gte: today, lte: future } };
    const { skip, take, page, limit } = paginate(query);
    const [emis, total] = await Promise.all([
      prisma.eMISchedule.findMany({ where, skip, take, include: emiInclude, orderBy: { dueDate: 'asc' } }),
      prisma.eMISchedule.count({ where }),
    ]);
    return { emis, pagination: paginationMeta(total, page, limit) };
  }

  /** Overdue EMIs */
  async getOverdue(query) {
    const where = { status: { in: ['PENDING', 'PARTIAL'] }, dueDate: { lt: new Date() } };
    const { skip, take, page, limit } = paginate(query);
    const [emis, total] = await Promise.all([
      prisma.eMISchedule.findMany({ where, skip, take, include: emiInclude, orderBy: { dueDate: 'asc' } }),
      prisma.eMISchedule.count({ where }),
    ]);
    return { emis, pagination: paginationMeta(total, page, limit) };
  }

  /** Customer-wise dues */
  async getCustomerDues(customerId) {
    const loans = await prisma.loan.findMany({
      where: { customerId, status: { in: ['ACTIVE'] }, deletedAt: null },
      include: {
        emiSchedules: {
          where: { status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
          orderBy: { dueDate: 'asc' },
        },
      },
    });
    return loans;
  }

  /**
   * Collect EMI payment with idempotency.
   * @param {string} emiId
   * @param {object} data - { amount, paymentMode, transactionId, remarks, idempotencyKey }
   * @param {string} userId
   */
  async collectPayment(emiId, data, userId) {
    // Idempotency check
    if (data.idempotencyKey) {
      const existing = await prisma.payment.findFirst({
        where: { emi: { id: emiId }, transactionId: data.idempotencyKey, isReversed: false },
      });
      if (existing) return { payment: existing, idempotent: true };
    }

    const emi = await prisma.eMISchedule.findUnique({
      where: { id: emiId },
      include: { loan: true, payments: { where: { isReversed: false } } },
    });
    if (!emi) throw new AppError('EMI not found', 404);
    if (emi.status === 'PAID' || emi.status === 'WAIVED') throw new AppError('EMI already settled', 400);

    const alreadyPaid = emi.payments.reduce((s, p) => s + p.amount, 0);
    const outstanding = {
      penalty: emi.penaltyFee,
      charges: 0,
      interest: emi.interest,
      principal: emi.principal,
    };
    const allocation = allocatePayment(data.amount, outstanding);
    const totalPaid = new Decimal(alreadyPaid).plus(data.amount);
    const totalDue = new Decimal(emi.amount).plus(emi.lateFee).plus(emi.penaltyFee);
    const newStatus = totalPaid.gte(totalDue) ? 'PAID' : 'PARTIAL';
    const receiptNo = await generateReceiptNo();

    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          emiId,
          amount: data.amount,
          paymentMode: data.paymentMode,
          transactionId: data.transactionId || data.idempotencyKey || null,
          receiptNo,
          collectedBy: userId,
          remarks: data.remarks || null,
        },
      });

      await tx.eMISchedule.update({
        where: { id: emiId },
        data: {
          status: newStatus,
          paidDate: newStatus === 'PAID' ? new Date() : null,
          paidAmount: totalPaid.toNumber(),
        },
      });

      if (newStatus === 'PAID') {
        const unpaid = await tx.eMISchedule.count({
          where: { loanId: emi.loanId, status: { notIn: ['PAID', 'WAIVED'] }, id: { not: emiId } },
        });
        if (unpaid === 0) {
          await tx.loan.update({ where: { id: emi.loanId }, data: { status: 'CLOSED', closedAt: new Date() } });
          await tx.loanStatusHistory.create({
            data: { loanId: emi.loanId, fromStatus: 'ACTIVE', toStatus: 'CLOSED', changedBy: userId, note: 'All EMIs paid — loan closed' },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          userId,
          loanId: emi.loanId,
          action: 'EMI_COLLECTED',
          entity: 'Payment',
          entityId: payment.id,
          newValues: { amount: data.amount, paymentMode: data.paymentMode, receiptNo, allocation },
        },
      });

      return { payment, emi: { id: emiId, status: newStatus, paidAmount: totalPaid.toNumber() }, allocation, receiptNo };
    });
  }

  /** Advance collection — pay future EMIs */
  async collectAdvance(loanId, data, userId) {
    const pendingEmis = await prisma.eMISchedule.findMany({
      where: { loanId, status: { in: ['PENDING', 'PARTIAL'] } },
      orderBy: { emiNumber: 'asc' },
      take: data.emiCount || 1,
    });
    if (!pendingEmis.length) throw new AppError('No pending EMIs found', 400);

    const results = [];
    for (const emi of pendingEmis) {
      const result = await this.collectPayment(emi.id, { ...data, remarks: `Advance payment - ${data.remarks || ''}` }, userId);
      results.push(result);
    }
    return results;
  }

  /** Reverse a payment */
  async reversePayment(paymentId, userId, reason) {
    if (!reason) throw new AppError('Reversal reason is required', 400);
    const payment = await prisma.payment.findUnique({ where: { id: paymentId }, include: { emi: true } });
    if (!payment) throw new AppError('Payment not found', 404);
    if (payment.isReversed) throw new AppError('Payment already reversed', 400);

    return prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: { isReversed: true, reversedAt: new Date(), reversedBy: userId, reversalReason: reason },
      });

      const remaining = await tx.payment.aggregate({
        where: { emiId: payment.emiId, isReversed: false },
        _sum: { amount: true },
      });
      const totalPaid = remaining._sum.amount || 0;
      const emi = payment.emi;
      const totalDue = emi.amount + emi.lateFee + emi.penaltyFee;
      const newStatus = totalPaid === 0 ? 'PENDING' : totalPaid >= totalDue ? 'PAID' : 'PARTIAL';

      await tx.eMISchedule.update({
        where: { id: payment.emiId },
        data: { status: newStatus, paidAmount: totalPaid, paidDate: newStatus === 'PAID' ? emi.paidDate : null },
      });

      await tx.auditLog.create({
        data: {
          userId,
          loanId: emi.loanId,
          action: 'PAYMENT_REVERSED',
          entity: 'Payment',
          entityId: paymentId,
          newValues: { reason, reversedBy: userId },
        },
      });

      return { reversed: true, paymentId, newEmiStatus: newStatus };
    });
  }

  /** Get payment history for a loan */
  async getLoanPayments(loanId, query) {
    const { skip, take, page, limit } = paginate(query);
    const where = { emi: { loanId } };
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({ where, skip, take, include: { emi: { select: { emiNumber: true, dueDate: true } } }, orderBy: { paidAt: 'desc' } }),
      prisma.payment.count({ where }),
    ]);
    return { payments, pagination: paginationMeta(total, page, limit) };
  }

  /** Get single payment / receipt */
  async getPayment(paymentId) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        emi: {
          include: {
            loan: { include: { customer: { select: { id: true, name: true, phone: true, appNo: true } } } },
          },
        },
      },
    });
    if (!payment) throw new AppError('Payment not found', 404);
    return payment;
  }
}

const emiInclude = {
  loan: {
    select: {
      id: true, loanNo: true, amount: true, status: true,
      customer: { select: { id: true, appNo: true, name: true, phone: true } },
    },
  },
  payments: { where: { isReversed: false }, select: { id: true, amount: true, paidAt: true, paymentMode: true } },
};

export default new CollectionService();
