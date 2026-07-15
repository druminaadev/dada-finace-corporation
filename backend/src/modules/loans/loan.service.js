import prisma from '../../config/database.js';
import AppError from '../../utils/appError.js';
import { paginate, paginationMeta } from '../../utils/pagination.js';
import { generateLoanNo } from '../../utils/idGenerator.js';
import { calcReducingEMI, calcFlatEMI, generateReducingSchedule, generateFlatSchedule } from '../../utils/emiCalculator.js';

// Valid state transitions
const TRANSITIONS = {
  DRAFT: ['NEW', 'CANCELLED'],
  NEW: ['PENDING_APPROVAL', 'CANCELLED'],
  PENDING_APPROVAL: ['APPROVED', 'REJECTED', 'NEW'],
  APPROVED: ['DISBURSEMENT_PENDING', 'REJECTED'],
  DISBURSEMENT_PENDING: ['DISBURSED'],
  DISBURSED: ['ACTIVE'],
  ACTIVE: ['OVERDUE', 'COMPLETED', 'WRITTEN_OFF'],
  OVERDUE: ['ACTIVE', 'COMPLETED', 'WRITTEN_OFF'],
  REJECTED: [],
  COMPLETED: ['CLOSED'],
  CLOSED: [],
  CANCELLED: [],
  WRITTEN_OFF: [],
};

class LoanService {
  async create(data, userId) {
    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) throw new AppError('Customer not found', 404);

    const loanNo = await generateLoanNo();
    const emiAmount = data.interestType === 'FLAT'
      ? calcFlatEMI(data.amount, data.interestRate, data.tenure)
      : calcReducingEMI(data.amount, data.interestRate, data.tenure);

    const totalInterest = data.interestType === 'FLAT'
      ? (parseFloat(data.amount) * parseFloat(data.interestRate) / 100 * data.tenure / 12)
      : (parseFloat(emiAmount) * data.tenure - parseFloat(data.amount));

    const totalAmount = parseFloat(data.amount) + totalInterest;

    return prisma.$transaction(async (tx) => {
      const loan = await tx.loan.create({
        data: {
          ...data,
          loanNo,
          emiAmount: parseFloat(emiAmount),
          totalAmount,
          status: 'DRAFT',
          createdBy: userId,
        },
      });
      await tx.loanStatusHistory.create({
        data: { loanId: loan.id, toStatus: 'DRAFT', changedBy: userId },
      });
      return tx.loan.findUnique({ where: { id: loan.id }, include: loanInclude });
    });
  }

  async getAll(query) {
    const { skip, take, page, limit } = paginate(query);
    const where = buildLoanWhere(query);
    const [loans, total] = await Promise.all([
      prisma.loan.findMany({ where, skip, take, include: loanListInclude, orderBy: { createdAt: 'desc' } }),
      prisma.loan.count({ where }),
    ]);
    return { loans, pagination: paginationMeta(total, page, limit) };
  }

  async getById(id) {
    const loan = await prisma.loan.findUnique({ where: { id }, include: loanInclude });
    if (!loan) throw new AppError('Loan not found', 404);
    return loan;
  }

  async update(id, data, userId) {
    const loan = await prisma.loan.findUnique({ where: { id } });
    if (!loan) throw new AppError('Loan not found', 404);
    if (!['DRAFT', 'NEW'].includes(loan.status)) throw new AppError('Loan cannot be edited in current status', 400);
    return prisma.loan.update({ where: { id }, data: { ...data, updatedBy: userId }, include: loanInclude });
  }

  async transition(id, toStatus, userId, meta = {}) {
    const loan = await prisma.loan.findUnique({ where: { id } });
    if (!loan) throw new AppError('Loan not found', 404);

    const allowed = TRANSITIONS[loan.status] || [];
    if (!allowed.includes(toStatus)) {
      throw new AppError(`Cannot transition from ${loan.status} to ${toStatus}`, 400);
    }

    const updateData = { status: toStatus, updatedBy: userId };
    if (toStatus === 'PENDING_APPROVAL') updateData.submittedAt = new Date();
    if (toStatus === 'APPROVED') { updateData.approvedBy = userId; updateData.approvedAt = new Date(); }
    if (toStatus === 'REJECTED') {
      if (!meta.reason) throw new AppError('Rejection reason is required', 400);
      updateData.rejectionReason = meta.reason;
      updateData.approvedBy = userId;
      updateData.approvedAt = new Date();
    }
    if (toStatus === 'DISBURSED') updateData.disbursedAt = meta.disbursedAt ? new Date(meta.disbursedAt) : new Date();
    if (toStatus === 'COMPLETED') updateData.closedAt = new Date();
    if (toStatus === 'CLOSED') updateData.closedAt = new Date();

    return prisma.$transaction(async (tx) => {
      const updated = await tx.loan.update({ where: { id }, data: updateData });
      await tx.loanStatusHistory.create({
        data: { loanId: id, fromStatus: loan.status, toStatus, note: meta.note || meta.reason, changedBy: userId, ipAddress: meta.ip },
      });
      return updated;
    });
  }

  async disburse(id, userId, disbursementData) {
    const loan = await prisma.loan.findUnique({ where: { id } });
    if (!loan) throw new AppError('Loan not found', 404);
    if (loan.status !== 'DISBURSEMENT_PENDING') throw new AppError('Loan must be in DISBURSEMENT_PENDING status', 400);

    const disbursedAt = disbursementData.disbursedAt ? new Date(disbursementData.disbursedAt) : new Date();
    const schedule = loan.interestType === 'FLAT'
      ? generateFlatSchedule({ principal: loan.amount, annualRate: loan.interestRate, tenureMonths: loan.tenure, startDate: disbursedAt })
      : generateReducingSchedule({ principal: loan.amount, annualRate: loan.interestRate, tenureMonths: loan.tenure, startDate: disbursedAt });

    return prisma.$transaction(async (tx) => {
      const updated = await tx.loan.update({
        where: { id },
        data: {
          status: 'DISBURSED',
          disbursedAt,
          disbursementMode: disbursementData.mode,
          receiverName: disbursementData.receiverName,
          receiverBank: disbursementData.receiverBank,
          receiverAccount: disbursementData.receiverAccount,
          receiverIfsc: disbursementData.receiverIfsc,
          updatedBy: userId,
        },
      });
      await tx.loanStatusHistory.create({
        data: { loanId: id, fromStatus: 'DISBURSEMENT_PENDING', toStatus: 'DISBURSED', changedBy: userId },
      });
      await tx.eMISchedule.deleteMany({ where: { loanId: id } });
      await tx.eMISchedule.createMany({
        data: schedule.map((e) => ({
          loanId: id,
          emiNumber: e.emiNumber,
          dueDate: e.dueDate,
          amount: parseFloat(e.amount),
          principal: parseFloat(e.principal),
          interest: parseFloat(e.interest),
          balance: parseFloat(e.closingBalance),
        })),
      });
      return tx.loan.findUnique({ where: { id }, include: loanInclude });
    });
  }

  async getStatusHistory(id) {
    const loan = await prisma.loan.findUnique({ where: { id } });
    if (!loan) throw new AppError('Loan not found', 404);
    return prisma.loanStatusHistory.findMany({
      where: { loanId: id },
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }
}

function buildLoanWhere(query) {
  const where = { deletedAt: null };
  if (query.status) where.status = query.status;
  if (query.customerId) where.customerId = query.customerId;
  if (query.branchId) where.createdBy = { in: [] }; // branch filter via join — simplified
  if (query.loanCategory) where.loanCategory = query.loanCategory;
  if (query.startDate && query.endDate) {
    where.createdAt = { gte: new Date(query.startDate), lte: new Date(query.endDate) };
  }
  if (query.search) {
    where.OR = [
      { loanNo: { contains: query.search, mode: 'insensitive' } },
      { customer: { name: { contains: query.search, mode: 'insensitive' } } },
      { customer: { phone: { contains: query.search } } },
    ];
  }
  return where;
}

const loanListInclude = {
  customer: { select: { id: true, appNo: true, name: true, phone: true } },
  creator: { select: { id: true, name: true } },
  _count: { select: { emiSchedules: true } },
};

const loanInclude = {
  customer: true,
  creator: { select: { id: true, name: true, email: true } },
  approver: { select: { id: true, name: true, email: true } },
  emiSchedules: { orderBy: { emiNumber: 'asc' } },
  guarantors: { where: { deletedAt: null } },
  nominees: { where: { deletedAt: null } },
  documents: { where: { deletedAt: null } },
  statusHistory: { orderBy: { createdAt: 'asc' }, include: { user: { select: { id: true, name: true } } } },
};

export default new LoanService();
