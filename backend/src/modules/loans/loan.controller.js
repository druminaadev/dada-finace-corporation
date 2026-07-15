import loanService from './loan.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';

export const create = asyncHandler(async (req, res) => {
  const loan = await loanService.create(req.body, req.user.id);
  ApiResponse.success(res, loan, 'Loan created', 201);
});

export const getAll = asyncHandler(async (req, res) => {
  const { loans, pagination } = await loanService.getAll(req.query);
  ApiResponse.paginated(res, loans, pagination, 'Loans fetched');
});

export const getById = asyncHandler(async (req, res) => {
  const loan = await loanService.getById(req.params.id);
  ApiResponse.success(res, loan, 'Loan fetched');
});

export const update = asyncHandler(async (req, res) => {
  const loan = await loanService.update(req.params.id, req.body, req.user.id);
  ApiResponse.success(res, loan, 'Loan updated');
});

export const submit = asyncHandler(async (req, res) => {
  const loan = await loanService.transition(req.params.id, 'PENDING_APPROVAL', req.user.id, { ip: req.ip });
  ApiResponse.success(res, loan, 'Loan submitted for approval');
});

export const approve = asyncHandler(async (req, res) => {
  const loan = await loanService.transition(req.params.id, 'APPROVED', req.user.id, { ip: req.ip, note: req.body.note });
  ApiResponse.success(res, loan, 'Loan approved');
});

export const reject = asyncHandler(async (req, res) => {
  const loan = await loanService.transition(req.params.id, 'REJECTED', req.user.id, { reason: req.body.reason, ip: req.ip });
  ApiResponse.success(res, loan, 'Loan rejected');
});

export const markDisbursementPending = asyncHandler(async (req, res) => {
  const loan = await loanService.transition(req.params.id, 'DISBURSEMENT_PENDING', req.user.id, { ip: req.ip });
  ApiResponse.success(res, loan, 'Loan marked for disbursement');
});

export const disburse = asyncHandler(async (req, res) => {
  const loan = await loanService.disburse(req.params.id, req.user.id, req.body);
  ApiResponse.success(res, loan, 'Loan disbursed');
});

export const cancel = asyncHandler(async (req, res) => {
  const loan = await loanService.transition(req.params.id, 'CANCELLED', req.user.id, { reason: req.body.reason, ip: req.ip });
  ApiResponse.success(res, loan, 'Loan cancelled');
});

export const getStatusHistory = asyncHandler(async (req, res) => {
  const history = await loanService.getStatusHistory(req.params.id);
  ApiResponse.success(res, history, 'Status history fetched');
});
