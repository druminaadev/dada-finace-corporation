import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../config/database.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import AppError from '../../utils/appError.js';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { generateDraftNo } from '../../utils/idGenerator.js';

const router = Router();
router.use(authenticate);

// Stage schemas
const stage1Schema = z.object({ customerData: z.object({ name: z.string().min(2), phone: z.string().regex(/^\d{10}$/) }).passthrough() });
const stage2Schema = z.object({ loanData: z.object({ amount: z.number().positive(), interestRate: z.number().positive(), tenure: z.number().int().positive(), loanCategory: z.string(), interestType: z.string() }).passthrough() });
const stage3Schema = z.object({ nominees: z.array(z.object({ name: z.string(), relationship: z.string() }).passthrough()).optional(), guarantors: z.array(z.object({ name: z.string(), phone: z.string() }).passthrough()).optional() });
const stage4Schema = z.object({ documents: z.array(z.object({ documentType: z.string(), fileName: z.string() }).passthrough()).optional() });

// Create draft
router.post('/', authorize('ADMIN', 'MANAGER', 'EMPLOYEE'), asyncHandler(async (req, res) => {
  const draftNo = await generateDraftNo();
  const draft = await prisma.loanDraft.create({
    data: {
      draftNo,
      createdBy: req.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  ApiResponse.success(res, draft, 'Draft created', 201);
}));

// Get draft
router.get('/:id', asyncHandler(async (req, res) => {
  const draft = await prisma.loanDraft.findUnique({ where: { id: req.params.id }, include: { customer: true, documents: true } });
  if (!draft || draft.deletedAt) throw new AppError('Draft not found', 404);
  ApiResponse.success(res, draft, 'Draft fetched');
}));

// List drafts
router.get('/', asyncHandler(async (req, res) => {
  const where = { deletedAt: null, createdBy: req.user.role === 'ADMIN' ? undefined : req.user.id };
  const drafts = await prisma.loanDraft.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 });
  ApiResponse.success(res, drafts, 'Drafts fetched');
}));

// Stage 1: Customer details
router.put('/:id/stage/1', validate(stage1Schema), asyncHandler(async (req, res) => {
  const draft = await getDraft(req.params.id);
  const updated = await prisma.loanDraft.update({
    where: { id: req.params.id },
    data: { stage1Data: req.body.customerData, stage1Done: true, currentStage: Math.max(draft.currentStage, 2) },
  });
  ApiResponse.success(res, updated, 'Stage 1 saved');
}));

// Stage 2: Loan details
router.put('/:id/stage/2', validate(stage2Schema), asyncHandler(async (req, res) => {
  const draft = await getDraft(req.params.id);
  if (!draft.stage1Done) throw new AppError('Complete stage 1 first', 400);
  const updated = await prisma.loanDraft.update({
    where: { id: req.params.id },
    data: { stage2Data: req.body.loanData, stage2Done: true, currentStage: Math.max(draft.currentStage, 3) },
  });
  ApiResponse.success(res, updated, 'Stage 2 saved');
}));

// Stage 3: Nominees & Guarantors
router.put('/:id/stage/3', validate(stage3Schema), asyncHandler(async (req, res) => {
  const draft = await getDraft(req.params.id);
  if (!draft.stage2Done) throw new AppError('Complete stage 2 first', 400);
  const updated = await prisma.loanDraft.update({
    where: { id: req.params.id },
    data: { stage3Data: { nominees: req.body.nominees || [], guarantors: req.body.guarantors || [] }, stage3Done: true, currentStage: Math.max(draft.currentStage, 4) },
  });
  ApiResponse.success(res, updated, 'Stage 3 saved');
}));

// Stage 4: Documents
router.put('/:id/stage/4', validate(stage4Schema), asyncHandler(async (req, res) => {
  const draft = await getDraft(req.params.id);
  if (!draft.stage3Done) throw new AppError('Complete stage 3 first', 400);
  const updated = await prisma.loanDraft.update({
    where: { id: req.params.id },
    data: { stage4Data: { documents: req.body.documents || [] }, stage4Done: true, currentStage: Math.max(draft.currentStage, 5) },
  });
  ApiResponse.success(res, updated, 'Stage 4 saved');
}));

// Stage 5: Final submit
router.post('/:id/submit', asyncHandler(async (req, res) => {
  const draft = await getDraft(req.params.id);
  if (!draft.stage1Done || !draft.stage2Done) throw new AppError('Complete all required stages first', 400);
  if (draft.status === 'SUBMITTED') throw new AppError('Draft already submitted', 400);

  const { generateLoanNo, generateCustomerNo } = await import('../../utils/idGenerator.js');
  const { calcReducingEMI, calcFlatEMI } = await import('../../utils/emiCalculator.js');

  const customerData = draft.stage1Data;
  const loanData = draft.stage2Data;

  // Find or create customer
  let customer = await prisma.customer.findFirst({ where: { phone: customerData.phone } });
  if (!customer) {
    const appNo = await generateCustomerNo();
    customer = await prisma.customer.create({ data: { ...customerData, appNo, createdBy: req.user.id } });
  }

  const loanNo = await generateLoanNo();
  const emiAmount = loanData.interestType === 'FLAT'
    ? calcFlatEMI(loanData.amount, loanData.interestRate, loanData.tenure)
    : calcReducingEMI(loanData.amount, loanData.interestRate, loanData.tenure);

  const result = await prisma.$transaction(async (tx) => {
    const loan = await tx.loan.create({
      data: {
        loanNo,
        customerId: customer.id,
        loanCategory: loanData.loanCategory || 'PERSONAL',
        interestType: loanData.interestType || 'REDUCING',
        amount: loanData.amount,
        interestRate: loanData.interestRate,
        tenure: loanData.tenure,
        emiAmount: parseFloat(emiAmount),
        totalAmount: parseFloat(emiAmount) * loanData.tenure,
        status: 'NEW',
        createdBy: req.user.id,
      },
    });
    await tx.loanStatusHistory.create({ data: { loanId: loan.id, toStatus: 'NEW', changedBy: req.user.id } });
    await tx.loanDraft.update({
      where: { id: draft.id },
      data: { status: 'SUBMITTED', submittedAt: new Date(), loanId: loan.id, stage5Done: true },
    });
    return loan;
  });

  ApiResponse.success(res, result, 'Loan application submitted', 201);
}));

// Cancel draft
router.delete('/:id', asyncHandler(async (req, res) => {
  const draft = await getDraft(req.params.id);
  if (draft.status === 'SUBMITTED') throw new AppError('Cannot cancel a submitted draft', 400);
  await prisma.loanDraft.update({ where: { id: req.params.id }, data: { status: 'CANCELLED', deletedAt: new Date() } });
  ApiResponse.success(res, null, 'Draft cancelled');
}));

async function getDraft(id) {
  const draft = await prisma.loanDraft.findUnique({ where: { id } });
  if (!draft || draft.deletedAt) throw new AppError('Draft not found', 404);
  if (draft.status === 'EXPIRED') throw new AppError('Draft has expired', 400);
  return draft;
}

export default router;
