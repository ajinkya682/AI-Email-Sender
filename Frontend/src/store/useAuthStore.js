import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,
  // OTP flow state
  pendingEmail: null,

  /* ── Register (Step 1) ── */
  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      set({ isLoading: false, pendingEmail: res.data.email });
      return { success: true, pending: true, message: res.data.message };
    } catch (err) {
      const error = err.response?.data?.error || 'Registration failed';
      set({ error, isLoading: false });
      return { success: false };
    }
  },

  /* ── Verify OTP (Step 2) ── */
  verifyOtp: async (email, otp) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      set({ user: res.data.user, token: res.data.token, isLoading: false, pendingEmail: null });
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.error || 'OTP verification failed';
      set({ error, isLoading: false });
      return { success: false };
    }
  },

  /* ── Resend OTP ── */
  resendOtp: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/auth/resend-otp`, { email });
      set({ isLoading: false });
      return { success: true, message: res.data.message };
    } catch (err) {
      const error = err.response?.data?.error || 'Failed to resend OTP';
      set({ error, isLoading: false });
      return { success: false };
    }
  },

  /* ── Login ── */
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      set({ user: res.data.user, token: res.data.token, isLoading: false });
      return { success: true };
    } catch (err) {
      const data = err.response?.data;
      // Unverified user — redirect to OTP
      if (data?.pending) {
        set({ isLoading: false, error: null, pendingEmail: data.email });
        return { success: false, pending: true, email: data.email, message: data.error };
      }
      set({ error: data?.error || 'Login failed', isLoading: false });
      return { success: false };
    }
  },

  /* ── Logout ── */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, pendingEmail: null });
  },

  /* ── Forgot Password ── */
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      set({ isLoading: false, pendingEmail: email });
      return { success: true, message: res.data.message };
    } catch (err) {
      const error = err.response?.data?.error || 'Failed to send OTP';
      set({ error, isLoading: false });
      return { success: false };
    }
  },

  /* ── Reset Password ── */
  resetPassword: async (email, otp, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/auth/reset-password`, { email, otp, newPassword });
      set({ isLoading: false, pendingEmail: null });
      return { success: true, message: res.data.message };
    } catch (err) {
      const error = err.response?.data?.error || 'Failed to reset password';
      set({ error, isLoading: false });
      return { success: false };
    }
  },

  /* ── Update Profile ── */
  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.put(`${API_URL}/auth/profile`, data, getAuthHeaders());
      const updatedUser = { ...get().user, ...res.data.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser, isLoading: false });
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.error || 'Failed to update profile';
      set({ error, isLoading: false });
      return { success: false };
    }
  },

  /* ── Request Change Password OTP ── */
  requestChangePasswordOtp: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/auth/change-password/request-otp`, {}, getAuthHeaders());
      set({ isLoading: false });
      return { success: true, message: res.data.message };
    } catch (err) {
      const error = err.response?.data?.error || 'Failed to send OTP';
      set({ error, isLoading: false });
      return { success: false };
    }
  },

  /* ── Change Password (OTP verified) ── */
  changePassword: async (otp, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/auth/change-password`, { otp, newPassword }, getAuthHeaders());
      set({ isLoading: false });
      return { success: true, message: res.data.message };
    } catch (err) {
      const error = err.response?.data?.error || 'Failed to change password';
      set({ error, isLoading: false });
      return { success: false };
    }
  },

  clearError: () => set({ error: null }),
  setPendingEmail: (email) => set({ pendingEmail: email }),
}));
