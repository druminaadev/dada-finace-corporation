import { Router } from 'express';
import prisma from '../../config/database.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { paginate, paginationMeta } from '../../utils/pagination.js';

const router = Router();
router.use(authenticate, authorize('ADMIN', 'MANAGER'));

router.get('/', asyncHandler(async (req, res) => {
  const { skip, take, page, limit } = paginate(req.query);
  const where = {};
  if (req.query.userId) where.userId = req.query.userId;
  if (req.query.entity) where.entity = req.query.entity;
  if (req.query.action) where.action = req.query.action;
  if (req.query.loanId) where.loanId = req.query.loanId;
  if (req.query.startDate && req.query.endDate) {
    where.createdAt = { gte: new Date(req.query.startDate), lte: new Date(req.query.endDate) };
  }
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({ where, skip, take, include: { user: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.auditLog.count({ where }),
  ]);
  ApiResponse.paginated(res, logs, paginationMeta(total, page, limit), 'Audit logs fetched');
}));

export default router;
