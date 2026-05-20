const prisma = require('../../config/database');
const AppError = require('../../utils/appError');
const EMICalculator = require('../../utils/emiCalculator');

class LoanService {
  async create(data, userId) {
    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) throw new AppError('Customer not found', 404);

    const emiAmount = EMICalculator.calculateEMI(data.amount, data.interestRate, data.tenure);
    const totalAmount = EMICalculator.calculateTotalAmount(data.amount, data.interestRate, data.tenure);
    const schedule = EMICalculator.generateSchedule(data.amount, data.interestRate, data.tenure, new Date());

    return prisma.$transaction(async (tx) => {
      const loan = await tx.loan.create({
        data: { ...data, emiAmount, totalAmount, status: 'PENDING', createdBy: userId },
      });

      await tx.eMISchedule.createMany({
        data: schedule.map((e) => ({
          loanId: loan.id, emiNumber: e.emiNumber, dueDate: e.dueDate,
          amount: e.amount, principal: e.principal, interest: e.interest,
        })),
      });

      return tx.loan.findUnique({
        where: { id: loan.id },
        include: {
          customer: true,
          creator: { select: { id: true, name: true, email: true } },
          emiSchedules: { orderBy: { emiNumber: 'asc' } },
        },
      });
    });
  }

  async getAll(query) {
    const { page = 1, limit = 10, status, customerId } = query;
    const skip = (page - 1) * limit;
    const where = {};
    if (status) where.status = status.toUpperCase();
    if (customerId) where.customerId = customerId;

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where, skip, take: parseInt(limit),
        include: {
          customer: { select: { id: true, name: true, phone: true, email: true } },
          creator: { select: { id: true, name: true, email: true } },
          approver: { select: { id: true, name: true, email: true } },
          _count: { select: { emiSchedules: true, guarantors: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.loan.count({ where }),
    ]);

    return { loans, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) } };
  }

  async getById(id) {
    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        customer: true,
        creator: { select: { id: true, name: true, email: true } },
        approver: { select: { id: true, name: true, email: true } },
        emiSchedules: { orderBy: { emiNumber: 'asc' } },
        guarantors: true,
        documents: true,
      },
    });
    if (!loan) throw new AppError('Loan not found', 404);
    return loan;
  }

  async update(id, data) {
    const loan = await prisma.loan.findUnique({ where: { id } });
    if (!loan) throw new AppError('Loan not found', 404);
    if (loan.status !== 'PENDING') throw new AppError('Only pending loans can be updated', 400);

    const updateData = { ...data };
    const shouldRegen = data.amount !== undefined || data.interestRate !== undefined || data.tenure !== undefined;

    if (shouldRegen) {
      const amount = data.amount ?? loan.amount;
      const interestRate = data.interestRate ?? loan.interestRate;
      const tenure = data.tenure ?? loan.tenure;
      updateData.emiAmount = EMICalculator.calculateEMI(amount, interestRate, tenure);
      updateData.totalAmount = EMICalculator.calculateTotalAmount(amount, interestRate, tenure);
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.loan.update({ where: { id }, data: updateData });

      if (shouldRegen) {
        const schedule = EMICalculator.generateSchedule(updated.amount, updated.interestRate, updated.tenure, updated.createdAt);
        await tx.eMISchedule.deleteMany({ where: { loanId: id } });
        await tx.eMISchedule.createMany({
          data: schedule.map((e) => ({
            loanId: id, emiNumber: e.emiNumber, dueDate: e.dueDate,
            amount: e.amount, principal: e.principal, interest: e.interest,
          })),
        });
      }

      return tx.loan.findUnique({ where: { id }, include: { customer: true, emiSchedules: { orderBy: { emiNumber: 'asc' } } } });
    });
  }

  // Stage 2: PENDING → APPROVED
  async approve(id, userId) {
    const loan = await prisma.loan.findUnique({ where: { id } });
    if (!loan) throw new AppError('Loan not found', 404);
    if (loan.status !== 'PENDING') throw new AppError('Only pending loans can be approved', 400);

    return prisma.loan.update({
      where: { id },
      data: { status: 'APPROVED', approvedBy: userId, approvedAt: new Date() },
      include: { customer: true, approver: { select: { id: true, name: true, email: true } } },
    });
  }

  // Stage 3: APPROVED → DISBURSED (maps to ACTIVE in schema)
  async disburse(id, userId, disbursedAt) {
    const loan = await prisma.loan.findUnique({ where: { id } });
    if (!loan) throw new AppError('Loan not found', 404);
    if (loan.status !== 'APPROVED') throw new AppError('Only approved loans can be disbursed', 400);

    const date = disbursedAt ? new Date(disbursedAt) : new Date();
    const schedule = EMICalculator.generateSchedule(loan.amount, loan.interestRate, loan.tenure, date);

    return prisma.$transaction(async (tx) => {
      const disbursed = await tx.loan.update({
        where: { id },
        data: { status: 'ACTIVE', disbursedAt: date },
        include: { customer: true },
      });

      await tx.eMISchedule.deleteMany({ where: { loanId: id } });
      await tx.eMISchedule.createMany({
        data: schedule.map((e) => ({
          loanId: id, emiNumber: e.emiNumber, dueDate: e.dueDate,
          amount: e.amount, principal: e.principal, interest: e.interest,
        })),
      });

      return disbursed;
    });
  }

  async reject(id, userId, rejectionReason) {
    const loan = await prisma.loan.findUnique({ where: { id } });
    if (!loan) throw new AppError('Loan not found', 404);
    if (loan.status !== 'PENDING') throw new AppError('Only pending loans can be rejected', 400);

    return prisma.$transaction(async (tx) => {
      const rejected = await tx.loan.update({
        where: { id },
        data: { status: 'REJECTED', approvedBy: userId, approvedAt: new Date(), rejectionReason },
        include: { customer: true, approver: { select: { id: true, name: true, email: true } } },
      });
      await tx.eMISchedule.deleteMany({ where: { loanId: id } });
      return rejected;
    });
  }

  async delete(id) {
    const loan = await prisma.loan.findUnique({ where: { id } });
    if (!loan) throw new AppError('Loan not found', 404);
    if (loan.status === 'APPROVED' || loan.status === 'ACTIVE') {
      throw new AppError('Approved or disbursed loans cannot be deleted', 400);
    }
    await prisma.loan.delete({ where: { id } });
  }
}

module.exports = new LoanService();
