const express = require('express');
const guarantorController = require('./guarantor.controller');
const validate = require('../../middlewares/validate');
const guarantorValidators = require('../../validators/guarantor.validator');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'EMPLOYEE'), validate(guarantorValidators.create), guarantorController.create);
router.get('/loan/:loanId', guarantorController.getByLoanId);
router.put('/:id', authorize('ADMIN', 'EMPLOYEE'), validate(guarantorValidators.update), guarantorController.update);
router.delete('/:id', authorize('ADMIN'), guarantorController.delete);

module.exports = router;
