const express = require('express');

const router = express.Router();

const {
  register,
  login,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

router.post('/register', register);

router.post('/login', login);

router.get('/verify/:token', verifyEmail);

// ✅ Forgot password
router.post('/forgot-password', forgotPassword);

// ✅ Reset password
router.post('/reset-password/:token', resetPassword);

router.get('/me', protect, getMe);

module.exports = router;
