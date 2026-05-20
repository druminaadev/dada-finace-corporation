const prisma = require('../../config/database');
const AppError = require('../../utils/appError');

class EMIService {
  async getCalendar(query) {
    const { month, year, loanId } = query;
    const where = {};

    if (loanId) where.loanId = loanId;

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      endDate.setHours(23, 59, 59, 999);
      where.dueDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    const emis = await prisma.eMISchedule.findMany({
      where,
      include: {
        loan: {
          include: {
            customer: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    return emis;
  }

  async getUpcoming(days = 7) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + parseInt(days));

    const emis = await prisma.eMISchedule.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          gte: today,
          lte: futureDate,
        },
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

    return emis;
  }

  async getOverdue() {
    const today = new Date();

    const emis = await prisma.eMISchedule.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: today,
        },
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

    return emis;
  }

  async getByLoanId(loanId) {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan) {
      throw new AppError('Loan not found', 404);
    }

    const emis = await prisma.eMISchedule.findMany({
      where: { loanId },
      include: {
        payments: true,
      },
      orderBy: { emiNumber: 'asc' },
    });

    return emis;
  }

  async payEMI(emiId, paymentData) {
    const emi = await prisma.eMISchedule.findUnique({
      where: { id: emiId },
      include: { loan: true },
    });

    if (!emi) {
      throw new AppError('EMI not found', 404);
    }

    if (emi.status === 'PAID') {
      throw new AppError('EMI already paid', 400);
    }

    const today = new Date();
    const lateFee = today > emi.dueDate ? 100 : 0;

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          emiId,
          amount: paymentData.amount,
          paymentMode: paymentData.paymentMode,
          transactionId: paymentData.transactionId,
          remarks: paymentData.remarks,
        },
      });

      const totalPaid = await tx.payment.aggregate({
        where: { emiId },
        _sum: { amount: true },
      });

      const totalAmount = emi.amount + lateFee;
      const status = totalPaid._sum.amount >= totalAmount ? 'PAID' : 'PARTIAL';

      const updatedEMI = await tx.eMISchedule.update({
        where: { id: emiId },
        data: {
          status,
          paidDate: status === 'PAID' ? new Date() : null,
          paidAmount: totalPaid._sum.amount,
          lateFee,
        },
        include: {
          loan: {
            include: {
              customer: true,
            },
          },
          payments: true,
        },
      });

      if (status === 'PAID') {
        const allEMIs = await tx.eMISchedule.findMany({
          where: { loanId: emi.loanId },
        });

        const allPaid = allEMIs.every((e) => e.status === 'PAID' || e.id === emiId);

        if (allPaid) {
          await tx.loan.update({
            where: { id: emi.loanId },
            data: { status: 'CLOSED' },
          });
        } else {
          await tx.loan.update({
            where: { id: emi.loanId },
            data: { status: 'ACTIVE' },
          });
        }
      }

      return { payment, emi: updatedEMI };
    });

    return result;
  }

  async getPaymentHistory(emiId) {
    const emi = await prisma.eMISchedule.findUnique({
      where: { id: emiId },
      include: {
        payments: {
          orderBy: { paidAt: 'desc' },
        },
        loan: {
          include: {
            customer: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
      },
    });

    if (!emi) {
      throw new AppError('EMI not found', 404);
    }

    return emi;
  }
}

module.exports = new EMIService();
