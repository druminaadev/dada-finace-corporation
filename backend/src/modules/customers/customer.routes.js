const express = require('express');
const customerController = require('./customer.controller');
const validate = require('../../middlewares/validate');
const customerValidators = require('../../validators/customer.validator');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'EMPLOYEE'), validate(customerValidators.create), customerController.create);
router.get('/', customerController.getAll);
router.get('/:id', customerController.getById);
router.put('/:id', authorize('ADMIN', 'EMPLOYEE'), validate(customerValidators.update), customerController.update);
router.delete('/:id', authorize('ADMIN'), customerController.delete);

module.exports = router;
