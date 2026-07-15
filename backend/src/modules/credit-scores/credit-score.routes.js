import { Router } from 'express';
import { z } from 'zod';
import creditScoreService from './credit-score.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

const router = Router();
router.use(authenticate, authorize('ADMIN', 'MANAGER', 'EMPLOYEE'));

const requestSchema = z.object({
  consentGiven: z.literal(true, { errorMap: () => ({ message: 'Customer consent must be explicitly true' }) }),
});

// Request a credit score check
router.post('/customer/:customerId/request', validate(requestSchema), asyncHandler(async (req, res) => {
  const result = await creditScoreService.requestScore(req.params.customerId, req.user.id, req.body.consentGiven);
  ApiResponse.success(res, result, 'Credit score fetched', 201);
}));

// Score history for a customer
router.get('/customer/:customerId/history', asyncHandler(async (req, res) => {
  ApiResponse.success(res, await creditScoreService.getHistory(req.params.customerId), 'Score history fetched');
}));

// Latest score for a customer
router.get('/customer/:customerId/latest', asyncHandler(async (req, res) => {
  ApiResponse.success(res, await creditScoreService.getLatest(req.params.customerId), 'Latest score fetched');
}));

export default router;
