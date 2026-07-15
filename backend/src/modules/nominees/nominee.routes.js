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
  loanId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  slot: z.number().int().min(1).max(2).default(1),
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^\d{10}$/).optional(),
  relationship: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  dob: z.string().datetime().optional(),
  sharePercent: z.number().min(0).max(100).default(100),
});

router.get('/loan/:loanId', asyncHandler(async (req, res) => {
  const nominees = await prisma.nominee.findMany({ where: { loanId: req.params.loanId, deletedAt: null } });
  ApiResponse.success(res, nominees, 'Nominees fetched');
}));

router.post('/', authorize('ADMIN', 'MANAGER', 'EMPLOYEE'), validate(schema), asyncHandler(async (req, res) => {
  if (!req.body.loanId && !req.body.customerId) throw new AppError('loanId or customerId required', 400);
  const nominee = await prisma.nominee.create({ data: { ...req.body, createdBy: req.user.id } });
  ApiResponse.success(res, nominee, 'Nominee added', 201);
}));

router.put('/:id', authorize('ADMIN', 'MANAGER', 'EMPLOYEE'), validate(schema.partial()), asyncHandler(async (req, res) => {
  const n = await prisma.nominee.findUnique({ where: { id: req.params.id } });
  if (!n || n.deletedAt) throw new AppError('Nominee not found', 404);
  const updated = await prisma.nominee.update({ where: { id: req.params.id }, data: req.body });
  ApiResponse.success(res, updated, 'Nominee updated');
}));

router.delete('/:id', authorize('ADMIN', 'MANAGER'), asyncHandler(async (req, res) => {
  const n = await prisma.nominee.findUnique({ where: { id: req.params.id } });
  if (!n || n.deletedAt) throw new AppError('Nominee not found', 404);
  await prisma.nominee.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
  ApiResponse.success(res, null, 'Nominee removed');
}));

export default router;
