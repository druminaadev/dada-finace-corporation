import customerService from './customer.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';

export const create = asyncHandler(async (req, res) => {
  const customer = await customerService.create(req.body, req.user.id);
  ApiResponse.success(res, customer, 'Customer created', 201);
});

export const getAll = asyncHandler(async (req, res) => {
  const { customers, pagination } = await customerService.getAll(req.query);
  ApiResponse.paginated(res, customers, pagination, 'Customers fetched');
});

export const getById = asyncHandler(async (req, res) => {
  const customer = await customerService.getById(req.params.id);
  ApiResponse.success(res, customer, 'Customer fetched');
});

export const update = asyncHandler(async (req, res) => {
  const customer = await customerService.update(req.params.id, req.body, req.user.id);
  ApiResponse.success(res, customer, 'Customer updated');
});

export const deactivate = asyncHandler(async (req, res) => {
  await customerService.deactivate(req.params.id, req.user.id);
  ApiResponse.success(res, null, 'Customer deactivated');
});

export const getLoanHistory = asyncHandler(async (req, res) => {
  const loans = await customerService.getLoanHistory(req.params.id);
  ApiResponse.success(res, loans, 'Loan history fetched');
});

export const findOrCreate = asyncHandler(async (req, res) => {
  const result = await customerService.findOrCreate(req.body, req.user.id);
  ApiResponse.success(res, result, result.created ? 'Customer created' : 'Existing customer found', result.created ? 201 : 200);
});
