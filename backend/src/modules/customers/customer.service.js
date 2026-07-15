import prisma from '../../config/database.js';
import AppError from '../../utils/appError.js';
import { paginate, paginationMeta } from '../../utils/pagination.js';
import { generateCustomerNo } from '../../utils/idGenerator.js';

class CustomerService {
  async create(data, userId) {
    // Duplicate detection
    const existing = await prisma.customer.findFirst({
      where: {
        OR: [
          { phone: data.phone },
          ...(data.email ? [{ email: data.email }] : []),
          ...(data.aadhaar ? [{ aadhaar: data.aadhaar }] : []),
          ...(data.pan ? [{ pan: data.pan }] : []),
        ],
      },
      select: { id: true, appNo: true, name: true, phone: true },
    });
    if (existing) {
      throw new AppError(
        `Duplicate customer detected: ${existing.name} (${existing.appNo})`,
        409,
        [{ field: 'phone', message: 'Customer with this phone/email/Aadhaar/PAN already exists', existingId: existing.id }]
      );
    }

    const appNo = await generateCustomerNo();
    return prisma.customer.create({
      data: { ...data, appNo, createdBy: userId },
      select: customerSelect,
    });
  }

  async findOrCreate(data, userId) {
    const existing = await prisma.customer.findFirst({
      where: { OR: [{ phone: data.phone }, ...(data.email ? [{ email: data.email }] : [])] },
      select: customerSelect,
    });
    if (existing) return { customer: existing, created: false };
    const customer = await this.create(data, userId);
    return { customer, created: true };
  }

  async getAll(query) {
    const { skip, take, page, limit } = paginate(query);
    const where = buildWhere(query);
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take,
        select: { ...customerSelect, _count: { select: { loans: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);
    return { customers, pagination: paginationMeta(total, page, limit) };
  }

  async getById(id) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        loans: { select: { id: true, loanNo: true, amount: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' } },
        nominees: { where: { deletedAt: null } },
        guarantors: { where: { deletedAt: null } },
        documents: { where: { deletedAt: null } },
      },
    });
    if (!customer) throw new AppError('Customer not found', 404);
    return customer;
  }

  async update(id, data, userId) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new AppError('Customer not found', 404);
    return prisma.customer.update({
      where: { id },
      data: { ...data, updatedBy: userId },
      select: customerSelect,
    });
  }

  async deactivate(id, userId) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new AppError('Customer not found', 404);
    const activeLoans = await prisma.loan.count({ where: { customerId: id, status: { in: ['ACTIVE', 'APPROVED', 'DISBURSED'] } } });
    if (activeLoans > 0) throw new AppError('Cannot deactivate customer with active loans', 400);
    return prisma.customer.update({ where: { id }, data: { isActive: false, updatedBy: userId } });
  }

  async getLoanHistory(customerId) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new AppError('Customer not found', 404);
    return prisma.loan.findMany({
      where: { customerId },
      include: { _count: { select: { emiSchedules: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}

function buildWhere(query) {
  const where = { deletedAt: null };
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { phone: { contains: query.search } },
      { appNo: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  if (query.isActive !== undefined) where.isActive = query.isActive === 'true';
  if (query.branchId) where.branchId = query.branchId;
  return where;
}

const customerSelect = {
  id: true, appNo: true, name: true, phone: true, altPhone: true,
  email: true, dob: true, gender: true, address: true, pincode: true,
  occupation: true, income: true, kycVerified: true, isActive: true,
  branchId: true, createdAt: true, updatedAt: true,
};

export default new CustomerService();
