import collectionService from './collection.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';

const getTodayDues = asyncHandler(async (req, res) => {
  ApiResponse.success(res, await collectionService.getTodayDues(req.query), "Today's dues fetched");
});

const getUpcoming = asyncHandler(async (req, res) => {
  ApiResponse.success(res, await collectionService.getUpcoming(req.query), 'Upcoming EMIs fetched');
});

const getOverdue = asyncHandler(async (req, res) => {
  ApiResponse.success(res, await collectionService.getOverdue(req.query), 'Overdue EMIs fetched');
});

const getCustomerDues = asyncHandler(async (req, res) => {
  ApiResponse.success(res, await collectionService.getCustomerDues(req.params.customerId), 'Customer dues fetched');
});

const collectPayment = asyncHandler(async (req, res) => {
  const result = await collectionService.collectPayment(req.params.emiId, req.body, req.user.id);
  ApiResponse.success(res, result, 'Payment collected successfully', result.idempotent ? 200 : 201);
});

const collectAdvance = asyncHandler(async (req, res) => {
  ApiResponse.success(res, await collectionService.collectAdvance(req.params.loanId, req.body, req.user.id), 'Advance payment collected', 201);
});

const reversePayment = asyncHandler(async (req, res) => {
  ApiResponse.success(res, await collectionService.reversePayment(req.params.paymentId, req.user.id, req.body.reason), 'Payment reversed');
});

const getLoanPayments = asyncHandler(async (req, res) => {
  ApiResponse.success(res, await collectionService.getLoanPayments(req.params.loanId, req.query), 'Payments fetched');
});

const getPayment = asyncHandler(async (req, res) => {
  ApiResponse.success(res, await collectionService.getPayment(req.params.paymentId), 'Payment fetched');
});

export default { getTodayDues, getUpcoming, getOverdue, getCustomerDues, collectPayment, collectAdvance, reversePayment, getLoanPayments, getPayment };
