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
  phone: z.string().regex(/^\d{10}$/),
  email: z.string().email().optional(),
  address: z.string().max(500).optional(),
  relationship: z.string().max(50).optional(),
  occupation: z.string().max(100).optional(),
  income: z.number().positive().optional(),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/).optional(),
});

router.get('/loan/:loanId', asyncHandler(async (req, res) => {
  const guarantors = await prisma.guarantor.findMany({ where: { loanId: req.params.loanId, deletedAt: null } });
  ApiResponse.success(res, guarantors, 'Guarantors fetched');
}));

router.post('/', authorize('ADMIN', 'MANAGER', 'EMPLOYEE'), validate(schema), asyncHandler(async (req, res) => {
  if (!req.body.loanId && !req.body.customerId) throw new AppError('loanId or customerId required', 400);
  const guarantor = await prisma.guarantor.create({ data: { ...req.body, createdBy: req.user.id } });
  ApiResponse.success(res, guarantor, 'Guarantor added', 201);
}));

router.put('/:id', authorize('ADMIN', 'MANAGER', 'EMPLOYEE'), validate(schema.partial()), asyncHandler(async (req, res) => {
  const g = await prisma.guarantor.findUnique({ where: { id: req.params.id } });
  if (!g || g.deletedAt) throw new AppError('Guarantor not found', 404);
  const updated = await prisma.guarantor.update({ where: { id: req.params.id }, data: req.body });
  ApiResponse.success(res, updated, 'Guarantor updated');
}));

router.delete('/:id', authorize('ADMIN', 'MANAGER'), asyncHandler(async (req, res) => {
  const g = await prisma.guarantor.findUnique({ where: { id: req.params.id } });
  if (!g || g.deletedAt) throw new AppError('Guarantor not found', 404);
  await prisma.guarantor.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
  ApiResponse.success(res, null, 'Guarantor removed');
}));

export default router;
