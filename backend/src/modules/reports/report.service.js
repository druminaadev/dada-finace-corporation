import prisma from '../../config/database.js';
import { paginate, paginationMeta } from '../../utils/pagination.js';

const MAX_LIMIT = 500;

class ReportService {
  async getDashboard() {
    const [
      totalCustomers, activeCustomers,
      totalLoans, pendingLoans, approvedLoans, activeLoans, closedLoans,
      totalLoanAmount, totalCollected, overdueEMIs, upcomingEMIs,
    ] = await Promise.all([
      prisma.customer.count({ where: { deletedAt: null } }),
      prisma.customer.count({ where: { isActive: true, deletedAt: null } }),
      prisma.loan.count({ where: { deletedAt: null } }),
      prisma.loan.count({ where: { status: 'PENDING_VERIFICATION' } }),
      prisma.loan.count({ where: { status: 'APPROVED' } }),
      prisma.loan.count({ where: { status: { in: ['ACTIVE'] } } }),
      prisma.loan.count({ where: { status: { in: ['CLOSED'] } } }),
      prisma.loan.aggregate({ _sum: { amount: true }, where: { status: { in: ['APPROVED', 'ACTIVE', 'CLOSED'] } } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { isReversed: false } }),
      prisma.eMISchedule.count({ where: { status: { in: ['PENDING', 'PARTIAL'] }, dueDate: { lt: new Date() } } }),
      prisma.eMISchedule.count({ where: { status: { in: ['PENDING', 'PARTIAL'] }, dueDate: { gte: new Date(), lte: new Date(Date.now() + 7 * 86400000) } } }),
    ]);

    return {
      customers: { total: totalCustomers, active: activeCustomers },
      loans: { total: totalLoans, pending: pendingLoans, approved: approvedLoans, active: activeLoans, closed: closedLoans },
      financials: {
        totalDisbursed: totalLoanAmount._sum.amount || 0,
        totalCollected: totalCollected._sum.amount || 0,
        outstanding: (totalLoanAmount._sum.amount || 0) - (totalCollected._sum.amount || 0),
      },
      emis: { overdue: overdueEMIs, upcoming: upcomingEMIs },
    };
  }

  async getLoanReport(query) {
    const { skip, take, page, limit } = paginate({ ...query, limit: Math.min(parseInt(query.limit, 10) || 50, MAX_LIMIT) });
    const where = buildLoanWhere(query);
    const [loans, total, summary] = await Promise.all([
      prisma.loan.findMany({ where, skip, take, select: loanReportSelect, orderBy: { createdAt: 'desc' } }),
      prisma.loan.count({ where }),
      prisma.loan.aggregate({ where, _sum: { amount: true, totalAmount: true }, _count: true }),
    ]);
    return {
      loans,
      pagination: paginationMeta(total, page, limit),
      summary: { totalLoans: summary._count, totalAmount: summary._sum.amount || 0, totalRepayable: summary._sum.totalAmount || 0 },
    };
  }

  async getCollectionReport(query) {
    const { skip, take, page, limit } = paginate({ ...query, limit: Math.min(parseInt(query.limit, 10) || 50, MAX_LIMIT) });
    const where = { isReversed: false };
    if (query.startDate && query.endDate) where.paidAt = { gte: new Date(query.startDate), lte: new Date(query.endDate) };
    if (query.paymentMode) where.paymentMode = query.paymentMode;
    const [payments, total, summary] = await Promise.all([
      prisma.payment.findMany({ where, skip, take, select: paymentReportSelect, orderBy: { paidAt: 'desc' } }),
      prisma.payment.count({ where }),
      prisma.payment.aggregate({ where, _sum: { amount: true }, _count: true }),
    ]);
    return {
      payments,
      pagination: paginationMeta(total, page, limit),
      summary: { totalPayments: summary._count, totalAmount: summary._sum.amount || 0 },
    };
  }

  async getOverdueReport(query = {}) {
    const { skip, take, page, limit } = paginate({ ...query, limit: Math.min(parseInt(query.limit, 10) || 100, MAX_LIMIT) });
    const where = { status: { in: ['PENDING', 'PARTIAL'] }, dueDate: { lt: new Date() } };
    const [overdueEMIs, total, summary] = await Promise.all([
      prisma.eMISchedule.findMany({ where, skip, take, select: overdueSelect, orderBy: { dueDate: 'asc' } }),
      prisma.eMISchedule.count({ where }),
      prisma.eMISchedule.aggregate({ where, _sum: { amount: true }, _count: true }),
    ]);
    return {
      overdueEMIs,
      pagination: paginationMeta(total, page, limit),
      summary: { totalOverdue: summary._count, totalAmount: summary._sum.amount || 0 },
    };
  }

  async getDisbursementReport(query) {
    const where = { status: { in: ['ACTIVE', 'CLOSED'] }, deletedAt: null };
    if (query.startDate && query.endDate) where.disbursedAt = { gte: new Date(query.startDate), lte: new Date(query.endDate) };
    const { skip, take, page, limit } = paginate(query);
    const [loans, total] = await Promise.all([
      prisma.loan.findMany({ where, skip, take, select: loanReportSelect, orderBy: { disbursedAt: 'desc' } }),
      prisma.loan.count({ where }),
    ]);
    return { loans, pagination: paginationMeta(total, page, limit) };
  }

  async getAgingReport() {
    const now = new Date();
    const buckets = [
      { label: '1-30 days', min: 1, max: 30 },
      { label: '31-60 days', min: 31, max: 60 },
      { label: '61-90 days', min: 61, max: 90 },
      { label: '91-180 days', min: 91, max: 180 },
      { label: '180+ days', min: 181, max: 99999 },
    ];

    const results = await Promise.all(
      buckets.map(async (b) => {
        const minDate = new Date(now.getTime() - b.max * 86400000);
        const maxDate = new Date(now.getTime() - b.min * 86400000);
        const where = { status: { in: ['PENDING', 'PARTIAL'] }, dueDate: { gte: minDate, lte: maxDate } };
        const agg = await prisma.eMISchedule.aggregate({ where, _sum: { amount: true }, _count: true });
        return { bucket: b.label, count: agg._count, totalAmount: agg._sum.amount || 0 };
      })
    );

    return { aging: results };
  }

  async getBranchPerformance(query) {
    const where = { deletedAt: null };
    if (query.startDate && query.endDate) where.createdAt = { gte: new Date(query.startDate), lte: new Date(query.endDate) };

    const loans = await prisma.loan.groupBy({
      by: ['status'],
      where,
      _count: true,
      _sum: { amount: true },
    });

    return { performance: loans };
  }

  async getEmployeePerformance(query) {
    const where = { deletedAt: null };
    if (query.startDate && query.endDate) where.createdAt = { gte: new Date(query.startDate), lte: new Date(query.endDate) };

    const loans = await prisma.loan.groupBy({
      by: ['createdBy'],
      where,
      _count: true,
      _sum: { amount: true },
    });

    const userIds = loans.map((l) => l.createdBy);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, role: true },
    });
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    return {
      performance: loans.map((l) => ({
        employee: userMap[l.createdBy] || { id: l.createdBy },
        loanCount: l._count,
        totalAmount: l._sum.amount || 0,
      })),
    };
  }

  async getCashReconciliation(query) {
    const where = { isReversed: false };
    if (query.date) {
      const d = new Date(query.date);
      const start = new Date(d); start.setHours(0, 0, 0, 0);
      const end = new Date(d); end.setHours(23, 59, 59, 999);
      where.paidAt = { gte: start, lte: end };
    }

    const byMode = await prisma.payment.groupBy({
      by: ['paymentMode'],
      where,
      _sum: { amount: true },
      _count: true,
    });

    const total = byMode.reduce((s, m) => s + (m._sum.amount || 0), 0);
    return { byMode, total };
  }
}

function buildLoanWhere(query) {
  const where = { deletedAt: null };
  if (query.startDate && query.endDate) where.createdAt = { gte: new Date(query.startDate), lte: new Date(query.endDate) };
  if (query.status) where.status = query.status;
  if (query.loanCategory) where.loanCategory = query.loanCategory;
  return where;
}

const loanReportSelect = {
  id: true, loanNo: true, amount: true, interestRate: true, tenure: true,
  emiAmount: true, totalAmount: true, status: true, loanCategory: true, interestType: true,
  createdAt: true, approvedAt: true, disbursedAt: true,
  customer: { select: { id: true, appNo: true, name: true, phone: true } },
  creator: { select: { id: true, name: true } },
};

const paymentReportSelect = {
  id: true, amount: true, paymentMode: true, receiptNo: true, transactionId: true, paidAt: true,
  emi: { select: { emiNumber: true, dueDate: true, loan: { select: { loanNo: true, customer: { select: { name: true, phone: true } } } } } },
};

const overdueSelect = {
  id: true, emiNumber: true, dueDate: true, amount: true, paidAmount: true, status: true, lateFee: true,
  loan: { select: { id: true, loanNo: true, customer: { select: { id: true, name: true, phone: true } } } },
};

export default new ReportService();
