const nomineeService = require('./nominee.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');

class NomineeController {
  create = asyncHandler(async (req, res) => {
    const nominee = await nomineeService.create(req.body);
    ApiResponse.success(res, nominee, 'Nominee created successfully', 201);
  });

  getByCustomerId = asyncHandler(async (req, res) => {
    const nominees = await nomineeService.getByCustomerId(req.params.customerId);
    ApiResponse.success(res, nominees, 'Nominees fetched successfully');
  });

  update = asyncHandler(async (req, res) => {
    const nominee = await nomineeService.update(req.params.id, req.body);
    ApiResponse.success(res, nominee, 'Nominee updated successfully');
  });

  delete = asyncHandler(async (req, res) => {
    await nomineeService.delete(req.params.id);
    ApiResponse.success(res, null, 'Nominee deleted successfully');
  });
}

module.exports = new NomineeController();
