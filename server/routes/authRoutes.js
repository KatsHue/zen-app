const express = require('express');
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerValidators, loginValidators } = require('../middleware/validators');
const { authLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/register', authLimiter, registerValidators, register);
router.post('/login', authLimiter, loginValidators, login);
router.post('/logout', logout);
router.get('/test-me', (req, res) => {
  res.status(200).json({
    message: 'AUTH ROUTES FUNCIONA'
  });
});
router.get('/me', protect, getMe);

module.exports = router;
