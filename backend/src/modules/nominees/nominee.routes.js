const express = require('express');
const nomineeController = require('./nominee.controller');
const validate = require('../../middlewares/validate');
const nomineeValidators = require('../../validators/nominee.validator');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'EMPLOYEE'), validate(nomineeValidators.create), nomineeController.create);
router.get('/customer/:customerId', nomineeController.getByCustomerId);
router.put('/:id', authorize('ADMIN', 'EMPLOYEE'), validate(nomineeValidators.update), nomineeController.update);
router.delete('/:id', authorize('ADMIN'), nomineeController.delete);

module.exports = router;
