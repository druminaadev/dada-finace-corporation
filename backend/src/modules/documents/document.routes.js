import { Router } from 'express';
import { z } from 'zod';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import path from 'path';
import prisma from '../../config/database.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import AppError from '../../utils/appError.js';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { upload } from '../../middlewares/upload.js';
import { sha256 } from '../../utils/encryption.js';
import config from '../../config/env.js';

const router = Router();
router.use(authenticate);

// S3 client (works with any S3-compatible storage)
const s3 = config.s3.accessKey ? new S3Client({
  region: config.s3.region,
  endpoint: config.s3.endpoint,
  credentials: { accessKeyId: config.s3.accessKey, secretAccessKey: config.s3.secretKey },
}) : null;

const uploadToS3 = async (buffer, key, mimeType) => {
  if (!s3) throw new AppError('S3 storage not configured', 503);
  await s3.send(new PutObjectCommand({
    Bucket: config.s3.bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  }));
  return key;
};

const getPresignedUrl = async (key) => {
  if (!s3) return null;
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: config.s3.bucket, Key: key }), { expiresIn: config.s3.presignExpiry });
};

const metaSchema = z.object({
  entityType: z.enum(['CUSTOMER', 'LOAN', 'GUARANTOR', 'NOMINEE', 'DRAFT']),
  entityId: z.string().uuid(),
  documentType: z.enum(['AADHAAR', 'PAN', 'PHOTO', 'INCOME_PROOF', 'ADDRESS_PROOF', 'BANK_STATEMENT', 'RC_BOOK', 'INSURANCE', 'VEHICLE_IMAGE', 'INVOICE', 'SALARY_SLIP', 'ITR', 'FORM_16', 'PROPERTY_PAPER', 'AGREEMENT', 'OTHER']),
  loanId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  draftId: z.string().uuid().optional(),
});

router.post('/upload', upload.single('file'), validate(metaSchema, 'body'), asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('File is required', 400);
  const ext = path.extname(req.file.originalname).toLowerCase();
  const key = `documents/${req.body.entityType.toLowerCase()}/${req.body.entityId}/${randomUUID()}${ext}`;
  const checksum = sha256(req.file.buffer);

  await uploadToS3(req.file.buffer, key, req.file.mimetype);

  const doc = await prisma.document.create({
    data: {
      entityType: req.body.entityType,
      entityId: req.body.entityId,
      documentType: req.body.documentType,
      loanId: req.body.loanId || null,
      customerId: req.body.customerId || null,
      draftId: req.body.draftId || null,
      fileName: key,
      originalName: req.file.originalname,
      filePath: key,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      checksum,
      uploadedBy: req.user.id,
    },
  });

  ApiResponse.success(res, doc, 'Document uploaded', 201);
}));

router.get('/:id/download', asyncHandler(async (req, res) => {
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc || doc.deletedAt) throw new AppError('Document not found', 404);
  const url = await getPresignedUrl(doc.filePath);
  if (!url) throw new AppError('Storage not configured', 503);
  ApiResponse.success(res, { url, expiresIn: config.s3.presignExpiry }, 'Download URL generated');
}));

router.get('/entity/:entityType/:entityId', asyncHandler(async (req, res) => {
  const docs = await prisma.document.findMany({
    where: { entityType: req.params.entityType, entityId: req.params.entityId, deletedAt: null },
    orderBy: { uploadedAt: 'desc' },
  });
  ApiResponse.success(res, docs, 'Documents fetched');
}));

router.patch('/:id/verify', authorize('ADMIN', 'MANAGER'), asyncHandler(async (req, res) => {
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc || doc.deletedAt) throw new AppError('Document not found', 404);
  const updated = await prisma.document.update({
    where: { id: req.params.id },
    data: { isVerified: true, verifiedAt: new Date(), verifiedBy: req.user.id },
  });
  ApiResponse.success(res, updated, 'Document verified');
}));

router.delete('/:id', authorize('ADMIN', 'MANAGER'), asyncHandler(async (req, res) => {
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc || doc.deletedAt) throw new AppError('Document not found', 404);
  await prisma.document.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date(), deletedBy: req.user.id },
  });
  ApiResponse.success(res, null, 'Document deleted');
}));

export default router;
