import { Router } from 'express';
import { z } from 'zod';
import collectionController from './collection.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

const router = Router();
router.use(authenticate);

const collectSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  paymentMode: z.enum(['CASH', 'PAYTM', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'NEFT', 'RTGS', 'IMPS', 'DD']),
  transactionId: z.string().optional(),
  idempotencyKey: z.string().optional(),
  remarks: z.string().max(500).optional(),
});

const reverseSchema = z.object({
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

const advanceSchema = collectSchema.extend({
  emiCount: z.number().int().min(1).max(12).optional(),
});

// Today's dues
router.get('/today', collectionController.getTodayDues);

// Upcoming EMIs
router.get('/upcoming', collectionController.getUpcoming);

// Overdue EMIs
router.get('/overdue', collectionController.getOverdue);

// Customer dues
router.get('/customer/:customerId/dues', collectionController.getCustomerDues);

// Loan payment history
router.get('/loan/:loanId/payments', collectionController.getLoanPayments);

// Advance collection for a loan
router.post('/loan/:loanId/advance', authorize('ADMIN', 'MANAGER', 'EMPLOYEE'), validate(advanceSchema), collectionController.collectAdvance);

// Collect EMI payment
router.post('/emi/:emiId/collect', authorize('ADMIN', 'MANAGER', 'EMPLOYEE'), validate(collectSchema), collectionController.collectPayment);

// Get single payment / receipt
router.get('/payment/:paymentId', collectionController.getPayment);

// Reverse payment
router.post('/payment/:paymentId/reverse', authorize('ADMIN', 'MANAGER'), validate(reverseSchema), collectionController.reversePayment);

export default router;
