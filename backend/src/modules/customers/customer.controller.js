const customerService = require('./customer.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');

class CustomerController {
  create = asyncHandler(async (req, res) => {
    const customer = await customerService.create(req.body, req.user.id);
    ApiResponse.success(res, customer, 'Customer created successfully', 201);
  });

  getAll = asyncHandler(async (req, res) => {
    const result = await customerService.getAll(req.query);
    ApiResponse.paginated(res, result.customers, result.pagination, 'Customers fetched successfully');
  });

  getById = asyncHandler(async (req, res) => {
    const customer = await customerService.getById(req.params.id);
    ApiResponse.success(res, customer, 'Customer fetched successfully');
  });

  update = asyncHandler(async (req, res) => {
    const customer = await customerService.update(req.params.id, req.body);
    ApiResponse.success(res, customer, 'Customer updated successfully');
  });

  delete = asyncHandler(async (req, res) => {
    await customerService.delete(req.params.id);
    ApiResponse.success(res, null, 'Customer deleted successfully');
  });
}

module.exports = new CustomerController();
