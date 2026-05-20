const prisma = require('../../config/database');

class ReportService {
  async getDashboard() {
    const [
      totalCustomers,
      activeCustomers,
      totalLoans,
      pendingLoans,
      approvedLoans,
      activeLoans,
      closedLoans,
      totalLoanAmount,
      totalCollected,
      overdueEMIs,
      upcomingEMIs,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.loan.count(),
      prisma.loan.count({ where: { status: 'PENDING' } }),
      prisma.loan.count({ where: { status: 'APPROVED' } }),
      prisma.loan.count({ where: { status: 'ACTIVE' } }),
      prisma.loan.count({ where: { status: 'CLOSED' } }),
      prisma.loan.aggregate({
        _sum: { amount: true },
        where: { status: { in: ['APPROVED', 'ACTIVE', 'CLOSED'] } },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
      }),
      prisma.eMISchedule.count({
        where: {
          status: 'PENDING',
          dueDate: { lt: new Date() },
        },
      }),
      prisma.eMISchedule.count({
        where: {
          status: 'PENDING',
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      customers: {
        total: totalCustomers,
        active: activeCustomers,
      },
      loans: {
        total: totalLoans,
        pending: pendingLoans,
        approved: approvedLoans,
        active: activeLoans,
        closed: closedLoans,
      },
      financials: {
        totalDisbursed: totalLoanAmount._sum.amount || 0,
        totalCollected: totalCollected._sum.amount || 0,
        outstanding:
          (totalLoanAmount._sum.amount || 0) - (totalCollected._sum.amount || 0),
      },
      emis: {
        overdue: overdueEMIs,
        upcoming: upcomingEMIs,
      },
    };
  }

  async getLoanReport(query) {
    const { startDate, endDate, status } = query;
    const where = {};

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (status) {
      where.status = status;
    }

    const loans = await prisma.loan.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, phone: true, email: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
        approver: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { emiSchedules: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const summary = await prisma.loan.aggregate({
      where,
      _sum: { amount: true, totalAmount: true },
      _count: true,
    });

    return {
      loans,
      summary: {
        totalLoans: summary._count,
        totalAmount: summary._sum.amount || 0,
        totalRepayable: summary._sum.totalAmount || 0,
      },
    };
  }

  async getCollectionReport(query) {
    const { startDate, endDate, paymentMode } = query;
    const where = {};

    if (startDate && endDate) {
      where.paidAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (paymentMode) {
      where.paymentMode = paymentMode;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        emi: {
          include: {
            loan: {
              include: {
                customer: {
                  select: { id: true, name: true, phone: true },
                },
              },
            },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    const summary = await prisma.payment.aggregate({
      where,
      _sum: { amount: true },
      _count: true,
    });

    const byPaymentMode = await prisma.payment.groupBy({
      by: ['paymentMode'],
      where,
      _sum: { amount: true },
      _count: true,
    });

    return {
      payments,
      summary: {
        totalPayments: summary._count,
        totalAmount: summary._sum.amount || 0,
        byPaymentMode,
      },
    };
  }

  async getOverdueReport() {
    const overdueEMIs = await prisma.eMISchedule.findMany({
      where: {
        status: { in: ['PENDING', 'PARTIAL'] },
        dueDate: { lt: new Date() },
      },
      include: {
        loan: {
          include: {
            customer: {
              select: { id: true, name: true, phone: true, email: true },
            },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    const summary = await prisma.eMISchedule.aggregate({
      where: {
        status: { in: ['PENDING', 'PARTIAL'] },
        dueDate: { lt: new Date() },
      },
      _sum: { amount: true },
      _count: true,
    });

    const byCustomer = await prisma.$queryRaw`
      SELECT 
        c.id,
        c.name,
        c.phone,
        COUNT(e.id) as overdue_count,
        SUM(e.amount) as overdue_amount
      FROM customers c
      INNER JOIN loans l ON l."customerId" = c.id
      INNER JOIN emi_schedules e ON e."loanId" = l.id
      WHERE e.status IN ('PENDING', 'PARTIAL')
        AND e."dueDate" < NOW()
      GROUP BY c.id, c.name, c.phone
      ORDER BY overdue_amount DESC
    `;

    return {
      overdueEMIs,
      summary: {
        totalOverdue: summary._count,
        totalAmount: summary._sum.amount || 0,
      },
      byCustomer,
    };
  }
}

module.exports = new ReportService();
