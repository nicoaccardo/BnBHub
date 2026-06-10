const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const {
  registrationValidation,
  loginValidation,
  passwordResetRequestValidation,
  passwordResetConfirmValidation
} = require('../middleware/authValidation');
const validateRequest = require('../middleware/validateRequest');
const {
  registrationLimiter,
  loginLimiter,
  passwordResetRequestLimiter
} = require('../middleware/authRateLimit');

router.post(
  '/register',
  registrationValidation,
  validateRequest,
  registrationLimiter,
  AuthController.register
);
router.post(
  '/login',
  loginValidation,
  validateRequest,
  loginLimiter,
  AuthController.login
);
router.post(
  '/password-reset/request',
  passwordResetRequestLimiter,
  passwordResetRequestValidation,
  validateRequest,
  AuthController.requestPasswordReset
);
router.post(
  '/password-reset/confirm',
  passwordResetConfirmValidation,
  validateRequest,
  AuthController.confirmPasswordReset
);

module.exports = router;
