import express from 'express';
import {
  register,
  verifyOtp,
  resendOtp,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  requestChangePasswordOtp,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/change-password/request-otp', protect, requestChangePasswordOtp);
router.post('/change-password', protect, changePassword);

export default router;
