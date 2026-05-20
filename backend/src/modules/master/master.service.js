const prisma = require('../../config/database');
const AppError = require('../../utils/appError');

// Generic CRUD factory for simple master entities
function masterService(model) {
  return {
    async getAll() {
      return prisma[model].findMany({ orderBy: { createdAt: 'desc' } });
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
    async delete(id) {
      const record = await prisma[model].findUnique({ where: { id } });
      if (!record) throw new AppError(`${model} not found`, 404);
      await prisma[model].delete({ where: { id } });
    },
  };
}

module.exports = {
  stateService: masterService('state'),
  cityService: masterService('city'),
  areaService: masterService('area'),
  branchService: masterService('branch'),
  loanTypeService: masterService('loanType'),
  bankService: masterService('bank'),
};
