const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const {
  registrationValidation,
  loginValidation
} = require('../middleware/authValidation');
const validateRequest = require('../middleware/validateRequest');
const {
  registrationLimiter,
  loginLimiter
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

module.exports = router;
