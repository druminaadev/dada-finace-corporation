import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from './loan.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

const router = Router();
router.use(authenticate);

const createSchema = z.object({
  customerId: z.string().uuid(),
  loanTypeId: z.string().uuid().optional(),
  loanCategory: z.enum(['GOLD', 'PERSONAL', 'VEHICLE', 'BUSINESS', 'EDUCATION', 'HOME', 'AGRICULTURE']).default('PERSONAL'),
  interestType: z.enum(['FLAT', 'REDUCING']).default('REDUCING'),
  amount: z.number().positive(),
  interestRate: z.number().positive().max(100),
  tenure: z.number().int().positive(),
  processingFee: z.number().min(0).default(0),
  insuranceAmount: z.number().min(0).default(0),
  purpose: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

const rejectSchema = z.object({ reason: z.string().min(5).max(500) });
const disburseSchema = z.object({
  mode: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'NEFT', 'RTGS', 'IMPS']),
  disbursedAt: z.string().datetime().optional(),
  receiverName: z.string().optional(),
  receiverBank: z.string().optional(),
  receiverAccount: z.string().optional(),
  receiverIfsc: z.string().optional(),
});

router.post('/', authorize('ADMIN', 'MANAGER', 'EMPLOYEE'), validate(createSchema), ctrl.create);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.put('/:id', authorize('ADMIN', 'MANAGER', 'EMPLOYEE'), validate(createSchema.partial()), ctrl.update);
router.post('/:id/submit', ctrl.submit);
router.post('/:id/approve', authorize('ADMIN', 'MANAGER'), ctrl.approve);
router.post('/:id/reject', authorize('ADMIN', 'MANAGER'), validate(rejectSchema), ctrl.reject);
router.post('/:id/disbursement-pending', authorize('ADMIN', 'MANAGER'), ctrl.markDisbursementPending);
router.post('/:id/disburse', authorize('ADMIN', 'MANAGER'), validate(disburseSchema), ctrl.disburse);
router.post('/:id/cancel', authorize('ADMIN', 'MANAGER'), ctrl.cancel);
router.get('/:id/status-history', ctrl.getStatusHistory);

export default router;
