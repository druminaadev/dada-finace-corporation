const express = require('express');
const reportController = require('./report.controller');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/dashboard', reportController.getDashboard);
router.get('/loans', authorize('ADMIN', 'EMPLOYEE'), reportController.getLoanReport);
router.get('/collections', authorize('ADMIN', 'EMPLOYEE'), reportController.getCollectionReport);
router.get('/overdue', authorize('ADMIN', 'EMPLOYEE'), reportController.getOverdueReport);

module.exports = router;
