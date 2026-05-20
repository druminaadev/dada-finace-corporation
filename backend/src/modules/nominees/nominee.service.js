const prisma = require('../../config/database');
const AppError = require('../../utils/appError');

class NomineeService {
  async create(data) {
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const nominee = await prisma.nominee.create({
      data,
      include: {
        customer: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
    });

    return nominee;
  }

  async getByCustomerId(customerId) {
    const nominees = await prisma.nominee.findMany({
      where: { customerId },
      include: {
        customer: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
    });

    return nominees;
  }

  async update(id, data) {
    const nominee = await prisma.nominee.update({
      where: { id },
      data,
      include: {
        customer: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
    });

    return nominee;
  }

  async delete(id) {
    await prisma.nominee.delete({
      where: { id },
    });
  }
}

module.exports = new NomineeService();
