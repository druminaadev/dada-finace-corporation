import { Router } from 'express';
import { z } from 'zod';
import settingsService from './settings.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

const router = Router();
router.use(authenticate);

const upsertSchema = z.object({
  value: z.string(),
  description: z.string().max(500).optional(),
});

const bulkSchema = z.object({
  settings: z.array(z.object({
    key: z.string().min(1).max(100),
    value: z.string(),
    description: z.string().max(500).optional(),
  })).min(1),
});

// Get all settings (any authenticated user can read)
router.get('/', asyncHandler(async (_req, res) => {
  ApiResponse.success(res, await settingsService.getAll(), 'Settings fetched');
}));

// Get single setting
router.get('/:key', asyncHandler(async (req, res) => {
  ApiResponse.success(res, await settingsService.get(req.params.key), 'Setting fetched');
}));

// Upsert single setting (admin only)
router.put('/:key', authorize('ADMIN'), validate(upsertSchema), asyncHandler(async (req, res) => {
  const result = await settingsService.upsert(req.params.key, req.body.value, req.body.description, req.user.id);
  ApiResponse.success(res, result, 'Setting saved');
}));

// Bulk upsert
router.post('/bulk', authorize('ADMIN'), validate(bulkSchema), asyncHandler(async (req, res) => {
  ApiResponse.success(res, await settingsService.bulkUpsert(req.body.settings, req.user.id), 'Settings saved');
}));

// Delete setting
router.delete('/:key', authorize('ADMIN'), asyncHandler(async (req, res) => {
  await settingsService.delete(req.params.key, req.user.id);
  ApiResponse.success(res, null, 'Setting deleted');
}));

export default router;
