const prisma = require('../../config/database');
const AppError = require('../../utils/appError');
const fs = require('fs').promises;
const path = require('path');

class CustomerService {
  async create(data, userId) {
    // Validate that at least phone or mobile is provided
    if (!data.phone && !data.mobile) {
      throw new AppError('Either phone or mobile number is required', 400);
    }

    // Handle photo base64
    let photoPath = null;
    if (data.photoBase64) {
      const base64Data = data.photoBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `customer_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const uploadDir = path.join(__dirname, '../../../uploads/customers');

      await fs.mkdir(uploadDir, { recursive: true });
      photoPath = `/uploads/customers/${fileName}`;
      await fs.writeFile(path.join(uploadDir, fileName), buffer);

      delete data.photoBase64;
    }

    // Normalize aadhaar field (frontend sends 'aadhar', db expects 'aadhaar')
    if (data.aadhar && !data.aadhaar) {
      data.aadhaar = data.aadhar;
      delete data.aadhar;
    }

    // Normalize phone field (frontend sends 'mobile', db expects 'phone')
    if (data.mobile && !data.phone) {
      data.phone = data.mobile;
    }
    delete data.mobile; // Remove mobile field regardless


    // Generate appNo
    const count = await prisma.customer.count();
    const appNo = `CUST${String(count + 1).padStart(6, '0')}`;

    const customer = await prisma.customer.create({
      data: {
        ...data,
        appNo,
        photoPath,
        createdBy: userId,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    return customer;
  }

  async getAll(query) {
    const { page = 1, limit = 10, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { aadhaar: { contains: search } },
        { appNo: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          creator: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { loans: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      customers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        loans: {
          include: {
            _count: {
              select: { emiSchedules: true },
            },
          },
        },
        nominees: true,
        documents: true,
      },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    return customer;
  }

  async update(id, data) {
    const customer = await prisma.customer.update({
      where: { id },
      data,
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    return customer;
  }

  async delete(id) {
    await prisma.customer.delete({
      where: { id },
    });
  }
}

module.exports = new CustomerService();
