import prisma from '../../config/database.js';
import AppError from '../../utils/appError.js';
import { paginate, paginationMeta } from '../../utils/pagination.js';
import { generateReceiptNo } from '../../utils/idGenerator.js';
import { allocatePayment } from '../../utils/emiCalculator.js';
import Decimal from 'decimal.js';

class EMIService {
  async getByLoan(loanId) {
    const loan = await prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) throw new AppError('Loan not found', 404);
    return prisma.eMISchedule.findMany({
      where: { loanId },
      include: { payments: { where: { isReversed: false } } },
      orderBy: { emiNumber: 'asc' },
    });
  }

  async getCalendar(query) {
    const where = {};
    if (query.loanId) where.loanId = query.loanId;
    if (query.month && query.year) {
      const start = new Date(query.year, query.month - 1, 1);
      const end = new Date(query.year, query.month, 0, 23, 59, 59, 999);
      where.dueDate = { gte: start, lte: end };
    }
    return prisma.eMISchedule.findMany({
      where,
      include: { loan: { include: { customer: { select: { id: true, name: true, phone: true } } } } },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getUpcoming(days = 7) {
    const today = new Date();
    const future = new Date(today.getTime() + parseInt(days) * 86400000);
    return prisma.eMISchedule.findMany({
      where: { status: { in: ['PENDING', 'PARTIAL'] }, dueDate: { gte: today, lte: future } },
      include: { loan: { include: { customer: { select: { id: true, name: true, phone: true, email: true } } } } },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getOverdue(query) {
    const { skip, take, page, limit } = paginate(query);
    const where = { status: { in: ['PENDING', 'PARTIAL'] }, dueDate: { lt: new Date() } };
    const [emis, total] = await Promise.all([
      prisma.eMISchedule.findMany({
        where, skip, take,
        include: { loan: { include: { customer: { select: { id: true, name: true, phone: true } } } } },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.eMISchedule.count({ where }),
    ]);
    return { emis, pagination: paginationMeta(total, page, limit) };
  }

  async getTodayCollections() {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    return prisma.eMISchedule.findMany({
      where: { status: { in: ['PENDING', 'PARTIAL'] }, dueDate: { gte: start, lte: end } },
      include: { loan: { include: { customer: { select: { id: true, name: true, phone: true } } } } },
      orderBy: { dueDate: 'asc' },
    });
  }

  async collectPayment(emiId, paymentData, userId) {
    const emi = await prisma.eMISchedule.findUnique({
      where: { id: emiId },
      include: { loan: true, payments: { where: { isReversed: false } } },
    });
    if (!emi) throw new AppError('EMI not found', 404);
    if (emi.status === 'PAID' || emi.status === 'WAIVED') throw new AppError('EMI already settled', 400);

    const alreadyPaid = emi.payments.reduce((s, p) => s + p.amount, 0);
    const outstanding = {
      penalty: emi.penaltyFee - 0,
      charges: 0,
      interest: emi.interest,
      principal: emi.principal,
    };

    const allocation = allocatePayment(paymentData.amount, outstanding);
    const totalPaid = new Decimal(alreadyPaid).plus(paymentData.amount);
    const totalDue = new Decimal(emi.amount).plus(emi.lateFee).plus(emi.penaltyFee);
    const newStatus = totalPaid.gte(totalDue) ? 'PAID' : 'PARTIAL';

    const receiptNo = await generateReceiptNo();

    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          emiId,
          amount: paymentData.amount,
          paymentMode: paymentData.paymentMode,
          transactionId: paymentData.transactionId || null,
          receiptNo,
          collectedBy: userId,
          remarks: paymentData.remarks || null,
        },
      });

      const updatedEmi = await tx.eMISchedule.update({
        where: { id: emiId },
        data: {
          status: newStatus,
          paidDate: newStatus === 'PAID' ? new Date() : null,
          paidAmount: totalPaid.toNumber(),
        },
      });

      // Check if all EMIs paid → close loan
      if (newStatus === 'PAID') {
        const unpaid = await tx.eMISchedule.count({
          where: { loanId: emi.loanId, status: { notIn: ['PAID', 'WAIVED'] }, id: { not: emiId } },
        });
        if (unpaid === 0) {
          await tx.loan.update({ where: { id: emi.loanId }, data: { status: 'COMPLETED', closedAt: new Date() } });
          await tx.loanStatusHistory.create({
            data: { loanId: emi.loanId, fromStatus: 'ACTIVE', toStatus: 'COMPLETED', changedBy: userId, note: 'All EMIs paid' },
          });
        }
      }

      return { payment, emi: updatedEmi, allocation, receiptNo };
    });
  }

  async reversePayment(paymentId, userId, reason) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId }, include: { emi: true } });
    if (!payment) throw new AppError('Payment not found', 404);
    if (payment.isReversed) throw new AppError('Payment already reversed', 400);
    if (!reason) throw new AppError('Reversal reason is required', 400);

    return prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: { isReversed: true, reversedAt: new Date(), reversedBy: userId, reversalReason: reason },
      });

      // Recalculate EMI status
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

      return { reversed: true, paymentId };
    });
  }

  async waiveEMI(emiId, userId, note) {
    const emi = await prisma.eMISchedule.findUnique({ where: { id: emiId } });
    if (!emi) throw new AppError('EMI not found', 404);
    if (emi.status === 'PAID') throw new AppError('Cannot waive a paid EMI', 400);
    return prisma.eMISchedule.update({
      where: { id: emiId },
      data: { status: 'WAIVED', waivedBy: userId, waivedAt: new Date(), waivedNote: note, waivedAmount: emi.amount },
    });
  }
}

export default new EMIService();
