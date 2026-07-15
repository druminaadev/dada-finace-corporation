import { Router } from 'express';
import { z } from 'zod';
import argon2 from 'argon2';
import prisma from '../../config/database.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import AppError from '../../utils/appError.js';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { paginate, paginationMeta } from '../../utils/pagination.js';

const router = Router();
router.use(authenticate);

const createSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().regex(/^\d{10}$/).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE', 'USER']).default('EMPLOYEE'),
  branchId: z.string().uuid().optional(),
  employeeCode: z.string().max(20).optional(),
});

router.get('/', asyncHandler(async (req, res) => {
  const { skip, take, page, limit } = paginate(req.query);
  const where = { deletedAt: null };
  if (req.query.branchId) where.branchId = req.query.branchId;
  if (req.query.role) where.role = req.query.role;
  if (req.query.search) {
    where.OR = [
      { name: { contains: req.query.search, mode: 'insensitive' } },
      { email: { contains: req.query.search, mode: 'insensitive' } },
    ];
  }
  const [employees, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take, select: empSelect, orderBy: { createdAt: 'desc' } }),
    prisma.user.count({ where }),
  ]);
  ApiResponse.paginated(res, employees, paginationMeta(total, page, limit), 'Employees fetched');
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const emp = await prisma.user.findUnique({ where: { id: req.params.id }, select: empSelect });
  if (!emp) throw new AppError('Employee not found', 404);
  ApiResponse.success(res, emp, 'Employee fetched');
}));

router.post('/', authorize('ADMIN', 'MANAGER'), validate(createSchema), asyncHandler(async (req, res) => {
  const existing = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (existing) throw new AppError('Email already registered', 409);
  const hashed = await argon2.hash(req.body.password);
  const emp = await prisma.user.create({
    data: { ...req.body, password: hashed },
    select: empSelect,
  });
  ApiResponse.success(res, emp, 'Employee created', 201);
}));

router.put('/:id', authorize('ADMIN', 'MANAGER'), validate(createSchema.omit({ password: true }).partial()), asyncHandler(async (req, res) => {
  const emp = await prisma.user.update({ where: { id: req.params.id }, data: req.body, select: empSelect });
  ApiResponse.success(res, emp, 'Employee updated');
}));

router.patch('/:id/toggle', authorize('ADMIN'), asyncHandler(async (req, res) => {
  const emp = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!emp) throw new AppError('Employee not found', 404);
  const updated = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: !emp.isActive }, select: empSelect });
  ApiResponse.success(res, updated, 'Employee status toggled');
}));

const empSelect = {
  id: true, name: true, email: true, phone: true, role: true,
  branchId: true, employeeCode: true, isActive: true, lastLoginAt: true, createdAt: true,
};

export default router;
