const prisma = require('../../config/database');
const AppError = require('../../utils/appError');

class GuarantorService {
  async create(data) {
    const loan = await prisma.loan.findUnique({
      where: { id: data.loanId },
    });

    if (!loan) {
      throw new AppError('Loan not found', 404);
    }

    const guarantor = await prisma.guarantor.create({
      data,
      include: {
        loan: {
          include: {
            customer: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
      },
    });

    return guarantor;
  }

  async getByLoanId(loanId) {
    const guarantors = await prisma.guarantor.findMany({
      where: { loanId },
      include: {
        loan: {
          include: {
            customer: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
      },
    });

    return guarantors;
  }

  async update(id, data) {
    const guarantor = await prisma.guarantor.update({
      where: { id },
      data,
      include: {
        loan: {
          include: {
            customer: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
      },
    });

    return guarantor;
  }

  async delete(id) {
    await prisma.guarantor.delete({
      where: { id },
    });
  }
}

module.exports = new GuarantorService();
