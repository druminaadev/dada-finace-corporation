const express = require('express');
const loanController = require('./loan.controller');
const validate = require('../../middlewares/validate');
const loanValidators = require('../../validators/loan.validator');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'EMPLOYEE'), validate(loanValidators.create), loanController.create);
router.get('/', loanController.getAll);
router.get('/:id', loanController.getById);
router.put('/:id', authorize('ADMIN', 'EMPLOYEE'), validate(loanValidators.update), loanController.update);

// 3-stage workflow: Pending → Approved → Disbursed
router.patch('/:id/approve', authorize('ADMIN', 'EMPLOYEE'), loanController.approve);
router.patch('/:id/disburse', authorize('ADMIN', 'EMPLOYEE'), loanController.disburse);
router.patch('/:id/reject', authorize('ADMIN', 'EMPLOYEE'), validate(loanValidators.reject), loanController.reject);

router.delete('/:id', authorize('ADMIN'), loanController.delete);

module.exports = router;
