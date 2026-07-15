import { Router } from 'express';
import reportController from './report.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = Router();
router.use(authenticate, authorize('ADMIN', 'MANAGER', 'EMPLOYEE'));

router.get('/dashboard', reportController.getDashboard);
router.get('/loans', reportController.getLoanReport);
router.get('/collections', reportController.getCollectionReport);
router.get('/overdue', reportController.getOverdueReport);
router.get('/disbursements', reportController.getDisbursementReport);
router.get('/aging', reportController.getAgingReport);
router.get('/branch-performance', reportController.getBranchPerformance);
router.get('/employee-performance', reportController.getEmployeePerformance);
router.get('/cash-reconciliation', reportController.getCashReconciliation);

export default router;
