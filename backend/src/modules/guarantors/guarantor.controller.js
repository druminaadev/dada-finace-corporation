const guarantorService = require('./guarantor.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');

class GuarantorController {
  create = asyncHandler(async (req, res) => {
    const guarantor = await guarantorService.create(req.body);
    ApiResponse.success(res, guarantor, 'Guarantor created successfully', 201);
  });

  getByLoanId = asyncHandler(async (req, res) => {
    const guarantors = await guarantorService.getByLoanId(req.params.loanId);
    ApiResponse.success(res, guarantors, 'Guarantors fetched successfully');
  });

  update = asyncHandler(async (req, res) => {
    const guarantor = await guarantorService.update(req.params.id, req.body);
    ApiResponse.success(res, guarantor, 'Guarantor updated successfully');
  });

  delete = asyncHandler(async (req, res) => {
    await guarantorService.delete(req.params.id);
    ApiResponse.success(res, null, 'Guarantor deleted successfully');
  });
}

module.exports = new GuarantorController();
