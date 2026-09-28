const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  registerValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
  changePasswordValidators,
} = require('../middleware/validators');
const { authLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/register', authLimiter, registerValidators, register);
router.post('/login', authLimiter, loginValidators, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', authLimiter, forgotPasswordValidators, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPasswordValidators, resetPassword);
router.put('/change-password', protect, changePasswordValidators, changePassword);

module.exports = router;