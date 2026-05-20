const express = require('express');
const emiController = require('./emi.controller');
const validate = require('../../middlewares/validate');
const emiValidators = require('../../validators/emi.validator');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/calendar', emiController.getCalendar);
router.get('/upcoming', emiController.getUpcoming);
router.get('/overdue', emiController.getOverdue);
router.get('/loan/:loanId', emiController.getByLoanId);
router.post('/reminders/send', authorize('ADMIN', 'EMPLOYEE'), emiController.sendReminders);
router.post('/:id/pay', authorize('ADMIN', 'EMPLOYEE'), validate(emiValidators.payEMI), emiController.payEMI);
router.get('/:id/history', emiController.getPaymentHistory);

module.exports = router;
