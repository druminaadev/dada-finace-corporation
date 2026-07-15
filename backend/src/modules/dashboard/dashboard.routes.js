import { Router } from 'express';
import reportService from '../reports/report.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (_req, res) => {
  ApiResponse.success(res, await reportService.getDashboard(), 'Dashboard fetched');
}));

export default router;
