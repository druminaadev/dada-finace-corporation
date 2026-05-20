const express = require('express');
const Joi = require('joi');
const ctrl = require('./loan-application.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const upload = require('../../middlewares/upload');

const router = express.Router();

// ─── Validators ──────────────────────────────────────────────────────────────

const sendOtpSchema = Joi.object({ aadhaar: Joi.string().length(12).pattern(/^\d+$/).required() });
const verifyOtpSchema = Joi.object({
  aadhaar: Joi.string().length(12).pattern(/^\d+$/).required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
});
const statusSchema = Joi.object({
  status: Joi.string().valid('PENDING_VERIFICATION', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ACTIVE', 'CLOSED').required(),
  note: Joi.string().optional().allow(''),
});

// ─── Public OTP routes (no auth needed for OTP send/verify) ─────────────────
router.post('/otp/send', validate(sendOtpSchema), ctrl.sendOtp);
router.post('/otp/verify', validate(verifyOtpSchema), ctrl.verifyOtp);

// ─── Protected routes ────────────────────────────────────────────────────────
router.use(authenticate);

// Draft CRUD
router.post('/drafts', ctrl.createDraft);
router.get('/drafts', ctrl.getAllDrafts);
router.get('/drafts/:id', ctrl.getDraft);

// Stage saves — PATCH /drafts/:id/stage/1 through /5
router.patch('/drafts/:id/stage/:stage', ctrl.saveStage);

// Document upload for a draft stage
router.post(
  '/drafts/:id/documents',
  upload.array('files', 10),
  asyncDocumentHandler
);

// Final submission
router.post('/drafts/:id/submit', ctrl.submitDraft);

// Loan status management
router.patch('/loans/:loanId/status', authorize('ADMIN', 'EMPLOYEE'), validate(statusSchema), ctrl.updateStatus);

// ─── Document upload handler ─────────────────────────────────────────────────
const prisma = require('../../config/database');
const ApiResponse = require('../../utils/apiResponse');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const path = require('path');

function asyncDocumentHandler(req, res, next) {
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      throw new AppError('No files uploaded', 400);
    }

    const { category, entityType, entityId } = req.body;
    const draftId = req.params.id;

    const draft = await prisma.loanDraft.findFirst({
      where: { id: draftId, createdBy: req.user.id },
    });
    if (!draft) throw new AppError('Draft not found', 404);

    const saved = await prisma.document.createMany({
      data: req.files.map(f => ({
        entityType: entityType || 'DRAFT',
        entityId: entityId || draftId,
        documentType: mapCategory(category),
        category: category || 'OTHER',
        fileName: f.originalname,
        filePath: f.path,
        fileSize: f.size,
        mimeType: f.mimetype,
      })),
    });

    ApiResponse.success(res, {
      uploaded: req.files.length,
      files: req.files.map(f => ({
        originalName: f.originalname,
        fileName: f.filename,
        size: f.size,
        mimeType: f.mimetype,
        url: `/uploads/${path.basename(path.dirname(f.path))}/${f.filename}`,
      })),
    }, 'Documents uploaded successfully');
  })(req, res, next);
}

function mapCategory(category) {
  const map = {
    aadhaar: 'AADHAAR', pan: 'PAN', photo: 'PHOTO',
    income_proof: 'INCOME_PROOF', address_proof: 'ADDRESS_PROOF',
    bank_statement: 'BANK_STATEMENT', rc_book: 'RC_BOOK',
    insurance: 'INSURANCE', vehicle_image: 'VEHICLE_IMAGE', invoice: 'INVOICE',
  };
  return map[(category || '').toLowerCase()] || 'OTHER';
}

module.exports = router;
