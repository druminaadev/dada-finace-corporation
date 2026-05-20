const reportService = require('./report.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');

class ReportController {
  getDashboard = asyncHandler(async (req, res) => {
    const dashboard = await reportService.getDashboard();
    ApiResponse.success(res, dashboard, 'Dashboard data fetched successfully');
  });

  getLoanReport = asyncHandler(async (req, res) => {
    const report = await reportService.getLoanReport(req.query);
    ApiResponse.success(res, report, 'Loan report fetched successfully');
  });

  getCollectionReport = asyncHandler(async (req, res) => {
    const report = await reportService.getCollectionReport(req.query);
    ApiResponse.success(res, report, 'Collection report fetched successfully');
  });

  getOverdueReport = asyncHandler(async (req, res) => {
    const report = await reportService.getOverdueReport();
    ApiResponse.success(res, report, 'Overdue report fetched successfully');
  });
}

module.exports = new ReportController();
