const svc = require('./loan-application.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');

// Stage 1 — OTP
const sendOtp = asyncHandler(async (req, res) => {
  const result = await svc.sendOtp(req.body.aadhaar);
  ApiResponse.success(res, result, 'OTP sent successfully');
});

const verifyOtp = asyncHandler(async (req, res) => {
  const result = await svc.verifyOtp(req.body.aadhaar, req.body.otp);
  ApiResponse.success(res, result, 'OTP verified successfully');
});

// Draft management
const createDraft = asyncHandler(async (req, res) => {
  const draft = await svc.createDraft(req.user.id);
  ApiResponse.success(res, draft, 'Draft created', 201);
});

const getDraft = asyncHandler(async (req, res) => {
  const draft = await svc.getDraft(req.params.id, req.user.id);
  ApiResponse.success(res, draft, 'Draft fetched');
});

const getAllDrafts = asyncHandler(async (req, res) => {
  const drafts = await svc.getAllDrafts(req.user.id);
  ApiResponse.success(res, drafts, 'Drafts fetched');
});

// Stage save
const saveStage = asyncHandler(async (req, res) => {
  const draft = await svc.saveStage(
    req.params.id,
    req.user.id,
    parseInt(req.params.stage),
    req.body
  );
  ApiResponse.success(res, draft, `Stage ${req.params.stage} saved`);
});

// Final submit
const submitDraft = asyncHandler(async (req, res) => {
  const result = await svc.submitDraft(req.params.id, req.user.id);
  ApiResponse.success(res, result, 'Loan application submitted successfully', 201);
});

// Status update
const updateStatus = asyncHandler(async (req, res) => {
  const loan = await svc.updateLoanStatus(
    req.params.loanId,
    req.user.id,
    req.body.status,
    req.body.note
  );
  ApiResponse.success(res, loan, 'Loan status updated');
});

module.exports = { sendOtp, verifyOtp, createDraft, getDraft, getAllDrafts, saveStage, submitDraft, updateStatus };
