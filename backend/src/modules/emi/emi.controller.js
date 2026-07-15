import emiService from './emi.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';

export const getByLoan = asyncHandler(async (req, res) => {
  const emis = await emiService.getByLoan(req.params.loanId);
  ApiResponse.success(res, emis, 'EMI schedule fetched');
});

export const getCalendar = asyncHandler(async (req, res) => {
  const emis = await emiService.getCalendar(req.query);
  ApiResponse.success(res, emis, 'EMI calendar fetched');
});

export const getUpcoming = asyncHandler(async (req, res) => {
  const emis = await emiService.getUpcoming(req.query.days);
  ApiResponse.success(res, emis, 'Upcoming EMIs fetched');
});

export const getOverdue = asyncHandler(async (req, res) => {
  const result = await emiService.getOverdue(req.query);
  ApiResponse.paginated(res, result.emis, result.pagination, 'Overdue EMIs fetched');
});

export const getTodayCollections = asyncHandler(async (req, res) => {
  const emis = await emiService.getTodayCollections();
  ApiResponse.success(res, emis, "Today's collections fetched");
});

export const collectPayment = asyncHandler(async (req, res) => {
  const result = await emiService.collectPayment(req.params.id, req.body, req.user.id);
  ApiResponse.success(res, result, 'Payment collected', 201);
});

export const reversePayment = asyncHandler(async (req, res) => {
  const result = await emiService.reversePayment(req.params.paymentId, req.user.id, req.body.reason);
  ApiResponse.success(res, result, 'Payment reversed');
});

export const waiveEMI = asyncHandler(async (req, res) => {
  const emi = await emiService.waiveEMI(req.params.id, req.user.id, req.body.note);
  ApiResponse.success(res, emi, 'EMI waived');
});
