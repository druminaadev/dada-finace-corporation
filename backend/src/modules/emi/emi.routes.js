import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from './emi.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { idempotency } from '../../middlewares/idempotency.js';

const router = Router();
router.use(authenticate);

const collectSchema = z.object({
  amount: z.number().positive(),
  paymentMode: z.enum(['CASH', 'PAYTM', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'NEFT', 'RTGS', 'IMPS', 'DD']),
  transactionId: z.string().max(100).optional(),
  remarks: z.string().max(500).optional(),
});

const reverseSchema = z.object({ reason: z.string().min(5).max(500) });
const waiveSchema = z.object({ note: z.string().min(5).max(500) });

router.get('/calendar', ctrl.getCalendar);
router.get('/upcoming', ctrl.getUpcoming);
router.get('/overdue', ctrl.getOverdue);
router.get('/today', ctrl.getTodayCollections);
router.get('/loan/:loanId', ctrl.getByLoan);
router.post('/:id/collect', authorize('ADMIN', 'MANAGER', 'EMPLOYEE'), idempotency('emi-collect'), validate(collectSchema), ctrl.collectPayment);
router.post('/payments/:paymentId/reverse', authorize('ADMIN', 'MANAGER'), validate(reverseSchema), ctrl.reversePayment);
router.post('/:id/waive', authorize('ADMIN', 'MANAGER'), validate(waiveSchema), ctrl.waiveEMI);

export default router;
