import prisma from '../../config/database.js';
import AppError from '../../utils/appError.js';
import { generateLoanNo } from '../../utils/idGenerator.js';
import { calcFlatEMI, calcReducingEMI, calcTotalAmount, generateFlatSchedule, generateReducingSchedule } from '../../utils/emiCalculator.js';
import { paginate, paginationMeta } from '../../utils/pagination.js';

const RENEWABLE_STATUSES = ['CLOSED'];

class RenewalService {
  /** Check if a loan is eligible for renewal */
  async checkEligibility(loanId) {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { customer: { select: { id: true, name: true, phone: true, kycVerified: true } } },
    });
    if (!loan) throw new AppError('Loan not found', 404);

    const eligible = RENEWABLE_STATUSES.includes(loan.status);
    const reasons = [];
    if (!eligible) reasons.push(`Loan status is ${loan.status}; must be CLOSED`);
    if (!loan.customer.kycVerified) reasons.push('Customer KYC not verified');

    return { eligible: eligible && loan.customer.kycVerified, loan, reasons };
  }

  /**
   * Create a renewal loan.
   * Reuses customer, links to previous loan, runs fresh approval.
   */
  async createRenewal(loanId, data, userId) {
    const { eligible, loan, reasons } = await this.checkEligibility(loanId);
    if (!eligible) throw new AppError(`Loan not eligible for renewal: ${reasons.join('; ')}`, 400);

    // Check no active renewal already exists
    const existingRenewal = await prisma.loan.findFirst({
      where: { previousLoanId: loanId, status: { notIn: ['CANCELLED', 'REJECTED'] } },
    });
    if (existingRenewal) throw new AppError('A renewal already exists for this loan', 409);

    const loanNo = await generateLoanNo();
    const interestType = data.interestType || loan.interestType;
    const emiAmount = interestType === 'FLAT'
      ? calcFlatEMI(data.amount, data.interestRate, data.tenure)
      : calcReducingEMI(data.amount, data.interestRate, data.tenure);
    const totalAmount = calcTotalAmount(data.amount, data.interestRate, data.tenure, interestType);

    return prisma.$transaction(async (tx) => {
      const newLoan = await tx.loan.create({
        data: {
          loanNo,
          customerId: loan.customerId,
          loanTypeId: data.loanTypeId || loan.loanTypeId,
          loanCategory: data.loanCategory || loan.loanCategory,
          interestType,
          amount: data.amount,
          interestRate: data.interestRate,
          tenure: data.tenure,
          emiAmount: parseFloat(emiAmount),
          totalAmount: parseFloat(totalAmount),
          processingFee: data.processingFee || 0,
          insuranceAmount: data.insuranceAmount || 0,
          purpose: data.purpose || loan.purpose,
          notes: data.notes || `Renewal of ${loan.loanNo}`,
          status: 'DRAFT',
          previousLoanId: loanId,
          createdBy: userId,
        },
      });

      await tx.loanStatusHistory.create({
        data: { loanId: newLoan.id, toStatus: 'DRAFT', changedBy: userId, note: `Renewal of loan ${loan.loanNo}` },
      });

      await tx.auditLog.create({
        data: {
          userId,
          loanId: newLoan.id,
          action: 'LOAN_RENEWAL_CREATED',
          entity: 'Loan',
          entityId: newLoan.id,
          newValues: { previousLoanId: loanId, previousLoanNo: loan.loanNo },
        },
      });

      return newLoan;
    });
  }

  /** List renewals for a loan */
  async listRenewals(loanId) {
    return prisma.loan.findMany({
      where: { previousLoanId: loanId },
      select: { id: true, loanNo: true, status: true, amount: true, createdAt: true, creator: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** List all renewals (admin) */
  async listAll(query) {
    const { skip, take, page, limit } = paginate(query);
    const where = { previousLoanId: { not: null } };
    if (query.status) where.status = query.status;
    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where, skip, take,
        select: {
          id: true, loanNo: true, status: true, amount: true, createdAt: true,
          previousLoanId: true,
          customer: { select: { id: true, name: true, phone: true } },
          creator: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.loan.count({ where }),
    ]);
    return { loans, pagination: paginationMeta(total, page, limit) };
  }
}

export default new RenewalService();
