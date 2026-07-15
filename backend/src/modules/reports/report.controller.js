import reportService from './report.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';

const getDashboard = asyncHandler(async (_req, res) => {
  ApiResponse.success(res, await reportService.getDashboard(), 'Dashboard data fetched');
});

const getLoanReport = asyncHandler(async (req, res) => {
  ApiResponse.success(res, await reportService.getLoanReport(req.query), 'Loan report fetched');
});

const getCollectionReport = asyncHandler(async (req, res) => {
  ApiResponse.success(res, await reportService.getCollectionReport(req.query), 'Collection report fetched');
});

const getOverdueReport = asyncHandler(async (req, res) => {
  ApiResponse.success(res, await reportService.getOverdueReport(req.query), 'Overdue report fetched');
});

const getDisbursementReport = asyncHandler(async (req, res) => {
  ApiResponse.success(res, await reportService.getDisbursementReport(req.query), 'Disbursement report fetched');
});

const getAgingReport = asyncHandler(async (_req, res) => {
  ApiResponse.success(res, await reportService.getAgingReport(), 'Aging report fetched');
});

const getBranchPerformance = asyncHandler(async (req, res) => {
  ApiResponse.success(res, await reportService.getBranchPerformance(req.query), 'Branch performance fetched');
});

const getEmployeePerformance = asyncHandler(async (req, res) => {
  ApiResponse.success(res, await reportService.getEmployeePerformance(req.query), 'Employee performance fetched');
});

const getCashReconciliation = asyncHandler(async (req, res) => {
  ApiResponse.success(res, await reportService.getCashReconciliation(req.query), 'Cash reconciliation fetched');
});

export default {
  getDashboard,
  getLoanReport,
  getCollectionReport,
  getOverdueReport,
  getDisbursementReport,
  getAgingReport,
  getBranchPerformance,
  getEmployeePerformance,
  getCashReconciliation,
};
