import User from '../models/User.js';
import { sendOtpEmail } from '../services/emailService.js';
import bcrypt from 'bcrypt';

/* ───────────────────────────────────────────────────────
   HELPERS
─────────────────────────────────────────────────────── */
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile || '',
      plan: user.plan,
      isVerified: user.isVerified,
    },
  });
};

/* ───────────────────────────────────────────────────────
   REGISTER — Step 1: Create user (unverified) + send OTP
─────────────────────────────────────────────────────── */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide name, email, and password' });
    }

    // Check for existing verified user
    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.isVerified) {
        return res.status(400).json({ success: false, error: 'Email already registered. Please sign in.' });
      }
      // Unverified user — resend OTP
      const otp = existing.generateOtp();
      await existing.save({ validateBeforeSave: false });
      await sendOtpEmail(email, otp, 'verify');
      return res.status(200).json({
        success: true,
        message: 'OTP resent to your email.',
        email,
        pending: true,
      });
    }

    // Create new unverified user
    const user = new User({ name, email, password, isVerified: false });
    const otp = user.generateOtp();
    await user.save();

    // Send OTP email
    await sendOtpEmail(email, otp, 'verify');

    res.status(201).json({
      success: true,
      message: 'Account created. Please verify your email.',
      email,
      pending: true,
    });
  } catch (err) {
    next(err);
  }
};

/* ───────────────────────────────────────────────────────
   VERIFY OTP — Step 2: Verify email, issue JWT
─────────────────────────────────────────────────────── */
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpiry');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ success: false, error: 'No OTP found. Please request a new one.' });
    }
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new one.' });
    }
    if (user.otp !== otp.trim()) {
      return res.status(400).json({ success: false, error: 'Invalid OTP. Please try again.' });
    }

    // Mark verified, clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/* ───────────────────────────────────────────────────────
   RESEND OTP
─────────────────────────────────────────────────────── */
export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).select('+otpResendCount +otpResendWindow');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, error: 'Email already verified' });
    }

    // Rate limit: max 5 per minute
    const now = new Date();
    if (user.otpResendWindow && (now - user.otpResendWindow) < 60 * 1000) {
      if (user.otpResendCount >= 5) {
        return res.status(429).json({ success: false, error: 'Too many OTP requests. Please wait a minute.' });
      }
      user.otpResendCount += 1;
    } else {
      user.otpResendCount = 1;
      user.otpResendWindow = now;
    }

    const otp = user.generateOtp();
    await user.save({ validateBeforeSave: false });
    await sendOtpEmail(email, otp, 'verify');

    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    next(err);
  }
};

/* ───────────────────────────────────────────────────────
   LOGIN
─────────────────────────────────────────────────────── */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      // Resend OTP and prompt verification
      const otp = user.generateOtp();
      await user.save({ validateBeforeSave: false });
      await sendOtpEmail(email, otp, 'verify');
      return res.status(403).json({
        success: false,
        error: 'Email not verified. A new OTP has been sent to your email.',
        pending: true,
        email,
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/* ───────────────────────────────────────────────────────
   GET ME
─────────────────────────────────────────────────────── */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile || '',
        plan: user.plan,
        isVerified: user.isVerified,
        usageCount: user.usageCount,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ───────────────────────────────────────────────────────
   UPDATE PROFILE (name, mobile)
─────────────────────────────────────────────────────── */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, mobile } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (mobile !== undefined) updates.mobile = mobile.trim();

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile || '',
        plan: user.plan,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ───────────────────────────────────────────────────────
   FORGOT PASSWORD — Send OTP
─────────────────────────────────────────────────────── */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Security: don't reveal if email exists
      return res.status(200).json({ success: true, message: 'If that email exists, an OTP has been sent.' });
    }

    const otp = user.generateOtp();
    await user.save({ validateBeforeSave: false });
    await sendOtpEmail(email, otp, 'forgot');

    res.status(200).json({ success: true, message: 'OTP sent to your email address.' });
  } catch (err) {
    next(err);
  }
};

/* ───────────────────────────────────────────────────────
   RESET PASSWORD (Forgot flow — verify OTP + new password)
─────────────────────────────────────────────────────── */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email, OTP, and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpiry');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ success: false, error: 'No OTP found. Please request a new one.' });
    }
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ success: false, error: 'OTP has expired.' });
    }
    if (user.otp !== otp.trim()) {
      return res.status(400).json({ success: false, error: 'Invalid OTP.' });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.isVerified = true;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully. You can now sign in.' });
  } catch (err) {
    next(err);
  }
};

/* ───────────────────────────────────────────────────────
   REQUEST CHANGE-PASSWORD OTP (from inside profile)
─────────────────────────────────────────────────────── */
export const requestChangePasswordOtp = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const otp = user.generateOtp();
    await user.save({ validateBeforeSave: false });
    await sendOtpEmail(user.email, otp, 'change');
    res.status(200).json({ success: true, message: 'OTP sent to your registered email.' });
  } catch (err) {
    next(err);
  }
};

/* ───────────────────────────────────────────────────────
   CHANGE PASSWORD (authenticated, OTP-verified)
─────────────────────────────────────────────────────── */
export const changePassword = async (req, res, next) => {
  try {
    const { otp, newPassword } = req.body;

    if (!otp || !newPassword) {
      return res.status(400).json({ success: false, error: 'OTP and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id).select('+otp +otpExpiry');
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ success: false, error: 'No OTP found. Please request a new one.' });
    }
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ success: false, error: 'OTP has expired.' });
    }
    if (user.otp !== otp.trim()) {
      return res.status(400).json({ success: false, error: 'Invalid OTP.' });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
};
