import { Router } from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();
router.use(authenticate);

const ROLES = ['ADMIN', 'MANAGER', 'EMPLOYEE', 'USER'];
const PERMISSIONS = [
  'customer.create', 'customer.read', 'customer.update',
  'loan.create', 'loan.approve', 'loan.reject', 'loan.disburse',
  'emi.collect', 'payment.reverse',
  'report.export', 'employee.manage', 'settings.manage',
];

router.get('/', asyncHandler(async (_req, res) => {
  ApiResponse.success(res, ROLES.map((r) => ({ name: r })), 'Roles fetched');
}));

router.get('/permissions', asyncHandler(async (_req, res) => {
  ApiResponse.success(res, PERMISSIONS.map((p) => ({ name: p })), 'Permissions fetched');
}));

export default router;
