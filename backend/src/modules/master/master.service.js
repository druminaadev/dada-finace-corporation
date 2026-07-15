import prisma from '../../config/database.js';
import AppError from '../../utils/appError.js';

function masterService(model) {
  return {
    async getAll(query = {}) {
      const where = {};
      if (query.isActive !== undefined) where.isActive = query.isActive === 'true';
      return prisma[model].findMany({ where, orderBy: { createdAt: 'desc' } });
    },
    async getById(id) {
      const record = await prisma[model].findUnique({ where: { id } });
      if (!record) throw new AppError(`${model} not found`, 404);
      return record;
    },
    async create(data) {
      return prisma[model].create({ data });
    },
    async update(id, data) {
      const record = await prisma[model].findUnique({ where: { id } });
      if (!record) throw new AppError(`${model} not found`, 404);
      return prisma[model].update({ where: { id }, data });
    },
    async toggleActive(id) {
      const record = await prisma[model].findUnique({ where: { id } });
      if (!record) throw new AppError(`${model} not found`, 404);
      return prisma[model].update({ where: { id }, data: { isActive: !record.isActive } });
    },
  };
}

export const stateService = masterService('state');
export const cityService = masterService('city');
export const areaService = masterService('area');
export const branchService = masterService('branch');
export const loanTypeService = masterService('loanType');
export const bankService = masterService('bank');
