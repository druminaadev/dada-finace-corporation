import { Router } from 'express';
import prisma from '../../config/database.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import AppError from '../../utils/appError.js';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { paginate, paginationMeta } from '../../utils/pagination.js';

const router = Router();
router.use(authenticate);

const userSelect = {
  id: true, name: true, email: true, phone: true, role: true,
  branchId: true, employeeCode: true, isActive: true, lastLoginAt: true, createdAt: true,
};

router.get('/', authorize('ADMIN', 'MANAGER'), asyncHandler(async (req, res) => {
  const { skip, take, page, limit } = paginate(req.query);
  const where = { deletedAt: null };
  if (req.query.role) where.role = req.query.role;
  if (req.query.branchId) where.branchId = req.query.branchId;
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take, select: userSelect, orderBy: { createdAt: 'desc' } }),
    prisma.user.count({ where }),
  ]);
  ApiResponse.paginated(res, users, paginationMeta(total, page, limit), 'Users fetched');
}));

router.get('/me', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: userSelect });
  ApiResponse.success(res, user, 'Profile fetched');
}));

router.get('/:id', authorize('ADMIN', 'MANAGER'), asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: userSelect });
  if (!user) throw new AppError('User not found', 404);
  ApiResponse.success(res, user, 'User fetched');
}));

router.patch('/:id/toggle', authorize('ADMIN'), asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new AppError('User not found', 404);
  if (user.id === req.user.id) throw new AppError('Cannot deactivate your own account', 400);
  const updated = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: !user.isActive }, select: userSelect });
  ApiResponse.success(res, updated, 'User status toggled');
}));

export default router;
