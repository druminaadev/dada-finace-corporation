const express = require('express');
const authController = require('./auth.controller');
const validate = require('../../middlewares/validate');
const authValidators = require('../../validators/auth.validator');
const { authenticate } = require('../../middlewares/auth');

const router = express.Router();

router.post('/register', validate(authValidators.register), authController.register);
router.post('/login', validate(authValidators.login), authController.login);
router.post('/refresh', validate(authValidators.refreshToken), authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
