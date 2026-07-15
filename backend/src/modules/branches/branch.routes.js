import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../config/database.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import AppError from '../../utils/appError.js';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

const router = Router();
router.use(authenticate);

const schema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(20),
  address: z.string().max(500).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  managerId: z.string().uuid().optional(),
});

router.get('/', asyncHandler(async (req, res) => {
  const branches = await prisma.branch.findMany({ where: { isActive: req.query.isActive !== 'false' }, orderBy: { name: 'asc' } });
  ApiResponse.success(res, branches, 'Branches fetched');
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const branch = await prisma.branch.findUnique({ where: { id: req.params.id } });
  if (!branch) throw new AppError('Branch not found', 404);
  ApiResponse.success(res, branch, 'Branch fetched');
}));

router.post('/', authorize('ADMIN'), validate(schema), asyncHandler(async (req, res) => {
  const branch = await prisma.branch.create({ data: req.body });
  ApiResponse.success(res, branch, 'Branch created', 201);
}));

router.put('/:id', authorize('ADMIN'), validate(schema.partial()), asyncHandler(async (req, res) => {
  const branch = await prisma.branch.update({ where: { id: req.params.id }, data: req.body });
  ApiResponse.success(res, branch, 'Branch updated');
}));

router.patch('/:id/toggle', authorize('ADMIN'), asyncHandler(async (req, res) => {
  const branch = await prisma.branch.findUnique({ where: { id: req.params.id } });
  if (!branch) throw new AppError('Branch not found', 404);
  const updated = await prisma.branch.update({ where: { id: req.params.id }, data: { isActive: !branch.isActive } });
  ApiResponse.success(res, updated, 'Branch status toggled');
}));

export default router;
