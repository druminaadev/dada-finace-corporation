const emiService = require('./emi.service');
const reminderService = require('../reminders/reminder.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');

class EMIController {
  getCalendar = asyncHandler(async (req, res) => {
    const emis = await emiService.getCalendar(req.query);
    ApiResponse.success(res, emis, 'EMI calendar fetched successfully');
  });

  getUpcoming = asyncHandler(async (req, res) => {
    const emis = await emiService.getUpcoming(req.query.days);
    ApiResponse.success(res, emis, 'Upcoming EMIs fetched successfully');
  });

  getOverdue = asyncHandler(async (req, res) => {
    const emis = await emiService.getOverdue();
    ApiResponse.success(res, emis, 'Overdue EMIs fetched successfully');
  });

  getByLoanId = asyncHandler(async (req, res) => {
    const emis = await emiService.getByLoanId(req.params.loanId);
    ApiResponse.success(res, emis, 'Loan EMIs fetched successfully');
  });

  payEMI = asyncHandler(async (req, res) => {
    const result = await emiService.payEMI(req.params.id, req.body);
    ApiResponse.success(res, result, 'EMI payment recorded successfully');
  });

  getPaymentHistory = asyncHandler(async (req, res) => {
    const emi = await emiService.getPaymentHistory(req.params.id);
    ApiResponse.success(res, emi, 'Payment history fetched successfully');
  });

  sendReminders = asyncHandler(async (req, res) => {
    const result = await reminderService.sendUpcomingEmiReminders(req.body.days || req.query.days);
    ApiResponse.success(res, result, 'EMI SMS reminders processed successfully');
  });
}

module.exports = new EMIController();
