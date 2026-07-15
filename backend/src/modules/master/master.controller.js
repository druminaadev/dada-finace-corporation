import * as svc from './master.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';

const makeCtrl = (service) => ({
  getAll: asyncHandler(async (req, res) => ApiResponse.success(res, await service.getAll(req.query))),
  getById: asyncHandler(async (req, res) => ApiResponse.success(res, await service.getById(req.params.id))),
  create: asyncHandler(async (req, res) => ApiResponse.success(res, await service.create(req.body), 'Created', 201)),
  update: asyncHandler(async (req, res) => ApiResponse.success(res, await service.update(req.params.id, req.body), 'Updated')),
  toggleActive: asyncHandler(async (req, res) => ApiResponse.success(res, await service.toggleActive(req.params.id), 'Status toggled')),
});

export const stateCtrl = makeCtrl(svc.stateService);
export const cityCtrl = makeCtrl(svc.cityService);
export const areaCtrl = makeCtrl(svc.areaService);
export const branchCtrl = makeCtrl(svc.branchService);
export const loanTypeCtrl = makeCtrl(svc.loanTypeService);
export const bankCtrl = makeCtrl(svc.bankService);
