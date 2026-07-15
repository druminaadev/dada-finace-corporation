import { Router } from 'express';
import { z } from 'zod';
import renewalService from './renewal.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

const router = Router();
router.use(authenticate);

const renewalSchema = z.object({
  amount: z.number().positive(),
  interestRate: z.number().positive(),
  tenure: z.number().int().positive(),
  interestType: z.enum(['FLAT', 'REDUCING']).optional(),
  loanTypeId: z.string().uuid().optional(),
  loanCategory: z.enum(['GOLD', 'PERSONAL', 'VEHICLE', 'BUSINESS', 'EDUCATION', 'HOME', 'AGRICULTURE']).optional(),
  processingFee: z.number().min(0).optional(),
  insuranceAmount: z.number().min(0).optional(),
  purpose: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

// Check eligibility
router.get('/eligibility/:loanId', asyncHandler(async (req, res) => {
  ApiResponse.success(res, await renewalService.checkEligibility(req.params.loanId), 'Eligibility checked');
}));

// Create renewal
router.post('/:loanId', authorize('ADMIN', 'MANAGER', 'EMPLOYEE'), validate(renewalSchema), asyncHandler(async (req, res) => {
  ApiResponse.success(res, await renewalService.createRenewal(req.params.loanId, req.body, req.user.id), 'Renewal loan created', 201);
}));

// List renewals for a loan
router.get('/loan/:loanId', asyncHandler(async (req, res) => {
  ApiResponse.success(res, await renewalService.listRenewals(req.params.loanId), 'Renewals fetched');
}));

// List all renewals
router.get('/', authorize('ADMIN', 'MANAGER'), asyncHandler(async (req, res) => {
  ApiResponse.success(res, await renewalService.listAll(req.query), 'All renewals fetched');
}));

export default router;
