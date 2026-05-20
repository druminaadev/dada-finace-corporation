const loanService = require('./loan.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');

class LoanController {
  create = asyncHandler(async (req, res) => {
    const loan = await loanService.create(req.body, req.user.id);
    ApiResponse.success(res, loan, 'Loan created successfully', 201);
  });

  getAll = asyncHandler(async (req, res) => {
    const result = await loanService.getAll(req.query);
    ApiResponse.paginated(res, result.loans, result.pagination, 'Loans fetched successfully');
  });

  getById = asyncHandler(async (req, res) => {
    const loan = await loanService.getById(req.params.id);
    ApiResponse.success(res, loan, 'Loan fetched successfully');
  });

  update = asyncHandler(async (req, res) => {
    const loan = await loanService.update(req.params.id, req.body);
    ApiResponse.success(res, loan, 'Loan updated successfully');
  });

  // Stage 2: Pending → Approved
  approve = asyncHandler(async (req, res) => {
    const loan = await loanService.approve(req.params.id, req.user.id);
    ApiResponse.success(res, loan, 'Loan approved successfully');
  });

  // Stage 3: Approved → Disbursed
  disburse = asyncHandler(async (req, res) => {
    const loan = await loanService.disburse(req.params.id, req.user.id, req.body.disbursedAt);
    ApiResponse.success(res, loan, 'Loan disbursed successfully');
  });

  reject = asyncHandler(async (req, res) => {
    const loan = await loanService.reject(req.params.id, req.user.id, req.body.rejectionReason);
    ApiResponse.success(res, loan, 'Loan rejected successfully');
  });

  delete = asyncHandler(async (req, res) => {
    await loanService.delete(req.params.id);
    ApiResponse.success(res, null, 'Loan deleted successfully');
  });
}

module.exports = new LoanController();
