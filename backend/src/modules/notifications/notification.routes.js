import { Router } from 'express';
import notificationService from './notification.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { authenticate, authorize } from '../../middlewares/auth.js';
import emailService from '../../services/email.service.js';

const router = Router();
router.use(authenticate);

// Send loan confirmation email
router.post('/send-email', asyncHandler(async (req, res) => {
  const { to, name, loanNumber, amount, interestRate, tenure, emiAmount } = req.body;
  if (!to || !name || !loanNumber) {
    return res.status(400).json({ success: false, message: 'to, name and loanNumber are required' });
  }
  await emailService.sendLoanApprovedEmail({
    to, name, loanNumber,
    amount: amount || 0,
    tenure: tenure || 'N/A',
    interestRate: interestRate || 0,
  });
  ApiResponse.success(res, null, 'Email sent successfully');
}));

// In-app notifications for current user
router.get('/me', asyncHandler(async (req, res) => {
  ApiResponse.success(res, await notificationService.listForUser(req.user.id, req.query), 'Notifications fetched');
}));

router.patch('/me/:id/read', asyncHandler(async (req, res) => {
  await notificationService.markRead(req.params.id, req.user.id);
  ApiResponse.success(res, null, 'Marked as read');
}));

router.patch('/me/read-all', asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user.id);
  ApiResponse.success(res, null, 'All notifications marked as read');
}));

// Admin: all notifications
router.get('/', authorize('ADMIN', 'MANAGER'), asyncHandler(async (req, res) => {
  ApiResponse.success(res, await notificationService.listAll(req.query), 'Notifications fetched');
}));

export default router;
