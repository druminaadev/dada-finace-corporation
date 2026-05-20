const { stateService, cityService, areaService, branchService, loanTypeService, bankService } = require('./master.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');

function masterController(service) {
  return {
    getAll: asyncHandler(async (req, res) => {
      const data = await service.getAll();
      ApiResponse.success(res, data, 'Fetched successfully');
    }),
    getById: asyncHandler(async (req, res) => {
      const data = await service.getById(req.params.id);
      ApiResponse.success(res, data, 'Fetched successfully');
    }),
    create: asyncHandler(async (req, res) => {
      const data = await service.create(req.body);
      ApiResponse.success(res, data, 'Created successfully', 201);
    }),
    update: asyncHandler(async (req, res) => {
      const data = await service.update(req.params.id, req.body);
      ApiResponse.success(res, data, 'Updated successfully');
    }),
    delete: asyncHandler(async (req, res) => {
      await service.delete(req.params.id);
      ApiResponse.success(res, null, 'Deleted successfully');
    }),
  };
}

module.exports = {
  stateController: masterController(stateService),
  cityController: masterController(cityService),
  areaController: masterController(areaService),
  branchController: masterController(branchService),
  loanTypeController: masterController(loanTypeService),
  bankController: masterController(bankService),
};
