const express = require('express');
const userController = require('./user.controller');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = express.Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

module.exports = router;
