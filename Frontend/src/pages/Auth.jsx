import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Mail, Lock, User, Phone, Eye, EyeOff,
  AlertCircle, CheckCircle, ArrowLeft, ArrowRight, RefreshCw,
} from 'lucide-react';
import './Auth.scss';

/* ─── Fade slide variants ─── */
const slideVariant = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -24, transition: { duration: 0.25 } },
};

/* ─── OTP Input ─────────────────────────────────────── */
const OtpInput = ({ value, onChange }) => {
  const refs = Array.from({ length: 6 }, () => useRef(null));

  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const chars = value.split('');
    chars[i] = val;
    const next = chars.join('');
    onChange(next);
    if (val && i < 5) refs[i + 1].current?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      refs[i - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    refs[Math.min(pasted.length, 5)].current?.focus();
    e.preventDefault();
  };

  return (
    <div className="otp-inputs">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`otp-box ${value[i] ? 'filled' : ''}`}
          id={`otp-box-${i}`}
        />
      ))}
    </div>
  );
};

/* ─── Resend Timer ─────────────────────────────────── */
const ResendTimer = ({ onResend, email }) => {
  const [seconds, setSeconds] = useState(60);
  const { resendOtp, isLoading } = useAuthStore();

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const handleResend = async () => {
    const result = await resendOtp(email);
    if (result.success) setSeconds(60);
  };

  return (
    <div className="resend-row">
      {seconds > 0 ? (
        <span className="resend-timer">Resend OTP in <strong>{seconds}s</strong></span>
      ) : (
        <button
          type="button"
          className="resend-btn"
          onClick={handleResend}
          disabled={isLoading}
          id="resend-otp-btn"
        >
          <RefreshCw size={13} /> Resend OTP
        </button>
      )}
    </div>
  );
};

/* ─── Main Auth Component ─────────────────────────── */
const Auth = () => {
  const navigate = useNavigate();

  // 'login' | 'register' | 'otp' | 'forgot' | 'reset'
  const [mode, setMode] = useState('login');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [otp, setOtp] = useState('');
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  const [form, setForm] = useState({ name: '', email: '', password: '', newPassword: '' });

  const {
    login, register, verifyOtp, forgotPassword, resetPassword,
    isLoading, error, clearError, pendingEmail, setPendingEmail,
  } = useAuthStore();

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) clearError();
  };

  const switchMode = (m) => {
    setMode(m);
    setOtp('');
    clearError();
  };

  /* ── Login submit ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result?.pending) {
      setPendingEmail(result.email);
      setForm({ ...form, email: result.email });
      showToast('error', result.message);
      switchMode('otp');
    }
    // On success, App.jsx redirects to /dashboard
  };

  /* ── Register submit ── */
  const handleRegister = async (e) => {
    e.preventDefault();
    const result = await register(form.name, form.email, form.password);
    if (result?.success) {
      showToast('success', result.message);
      switchMode('otp');
    }
  };

  /* ── OTP submit ── */
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return;
    const email = pendingEmail || form.email;
    const result = await verifyOtp(email, otp);
    if (result?.success) {
      navigate('/dashboard');
    }
  };

  /* ── Forgot password submit ── */
  const handleForgot = async (e) => {
    e.preventDefault();
    const result = await forgotPassword(form.email);
    if (result?.success) {
      showToast('success', result.message);
      switchMode('reset');
    }
  };

  /* ── Reset password submit ── */
  const handleReset = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return;
    const email = pendingEmail || form.email;
    const result = await resetPassword(email, otp, form.newPassword);
    if (result?.success) {
      showToast('success', result.message);
      setTimeout(() => switchMode('login'), 1500);
    }
  };

  /* ─── Render helpers ─── */
  const renderFeatureSide = () => (
    <div className="auth-visual">
      <div className="auth-visual-inner">
        <div className="auth-brand">
          <div className="auth-brand-icon"><Sparkles size={24} /></div>
          <span>OmniPilot AI</span>
        </div>
        <h1>AI that doesn't just answer —<br /><span className="gradient-text">it acts.</span></h1>
        <p>Send emails, WhatsApp messages, and get intelligent answers — all through a single chat interface.</p>
        <div className="auth-feature-list">
          {[
            { icon: <Mail size={15} />, label: 'Send professional emails instantly' },
            { icon: <Sparkles size={15} />, label: 'Chat with an intelligent AI agent' },
            { icon: <CheckCircle size={15} />, label: 'WhatsApp messages in one command' },
          ].map((f) => (
            <div key={f.label} className="auth-feature-item">
              <div className="auth-feature-icon">{f.icon}</div>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      {renderFeatureSide()}

      <div className="auth-form-side">
        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`auth-toast ${toast.type}`}
            >
              {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              <span>{toast.msg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="auth-card-wrap">
          <AnimatePresence mode="wait">

            {/* ── LOGIN ── */}
            {mode === 'login' && (
              <motion.div key="login" variants={slideVariant} initial="hidden" animate="visible" exit="exit" className="auth-card">
                <div className="auth-card-header">
                  <div className="auth-logo"><div className="logo-icon"><Sparkles size={18} /></div><span>OmniPilot AI</span></div>
                  <h2>Welcome back</h2>
                  <p>Sign in to your account to continue</p>
                </div>

                {error && <div className="auth-error"><AlertCircle size={15} /><span>{error}</span></div>}

                <form onSubmit={handleLogin} className="auth-form">
                  <div className="input-group">
                    <label htmlFor="login-email">Email</label>
                    <div className="input-wrap">
                      <Mail size={15} className="input-icon" />
                      <input id="login-email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor="login-password">Password</label>
                    <div className="input-wrap">
                      <Lock size={15} className="input-icon" />
                      <input id="login-password" type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
                      <button type="button" className="toggle-eye" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                    </div>
                  </div>
                  <button type="button" className="forgot-link" onClick={() => switchMode('forgot')}>Forgot password?</button>
                  <button type="submit" className="auth-submit-btn" disabled={isLoading} id="login-submit-btn">
                    {isLoading ? <span className="btn-spinner" /> : null} {isLoading ? 'Signing in…' : 'Sign In'}
                    <ArrowRight size={16} />
                  </button>
                </form>

                <div className="auth-switch">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => switchMode('register')} id="switch-to-register-btn">Create one</button>
                </div>
              </motion.div>
            )}

            {/* ── REGISTER ── */}
            {mode === 'register' && (
              <motion.div key="register" variants={slideVariant} initial="hidden" animate="visible" exit="exit" className="auth-card">
                <div className="auth-card-header">
                  <div className="auth-logo"><div className="logo-icon"><Sparkles size={18} /></div><span>OmniPilot AI</span></div>
                  <h2>Create your account</h2>
                  <p>Start automating with AI today — free forever</p>
                </div>

                {error && <div className="auth-error"><AlertCircle size={15} /><span>{error}</span></div>}

                <form onSubmit={handleRegister} className="auth-form">
                  <div className="input-group">
                    <label htmlFor="reg-name">Full Name</label>
                    <div className="input-wrap">
                      <User size={15} className="input-icon" />
                      <input id="reg-name" type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor="reg-email">Email</label>
                    <div className="input-wrap">
                      <Mail size={15} className="input-icon" />
                      <input id="reg-email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor="reg-password">Password</label>
                    <div className="input-wrap">
                      <Lock size={15} className="input-icon" />
                      <input id="reg-password" type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required minLength={6} />
                      <button type="button" className="toggle-eye" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                    </div>
                  </div>
                  <button type="submit" className="auth-submit-btn" disabled={isLoading} id="register-submit-btn">
                    {isLoading && <span className="btn-spinner" />} {isLoading ? 'Creating account…' : 'Create Account'}
                    <ArrowRight size={16} />
                  </button>
                </form>

                <div className="auth-switch">
                  Already have an account?{' '}
                  <button type="button" onClick={() => switchMode('login')} id="switch-to-login-btn">Sign in</button>
                </div>
              </motion.div>
            )}

            {/* ── OTP VERIFY ── */}
            {mode === 'otp' && (
              <motion.div key="otp" variants={slideVariant} initial="hidden" animate="visible" exit="exit" className="auth-card">
                <div className="auth-card-header">
                  <div className="otp-icon-wrap"><Mail size={28} /></div>
                  <h2>Check your email</h2>
                  <p>We sent a 6-digit OTP to <strong>{pendingEmail || form.email}</strong></p>
                </div>

                {error && <div className="auth-error"><AlertCircle size={15} /><span>{error}</span></div>}

                <form onSubmit={handleOtpVerify} className="auth-form">
                  <OtpInput value={otp} onChange={setOtp} />
                  <button type="submit" className="auth-submit-btn" disabled={isLoading || otp.length < 6} id="otp-verify-btn">
                    {isLoading && <span className="btn-spinner" />} {isLoading ? 'Verifying…' : 'Verify OTP'}
                    <ArrowRight size={16} />
                  </button>
                </form>

                <ResendTimer email={pendingEmail || form.email} />

                <button type="button" className="back-btn" onClick={() => switchMode('login')}>
                  <ArrowLeft size={14} /> Back to login
                </button>
              </motion.div>
            )}

            {/* ── FORGOT PASSWORD ── */}
            {mode === 'forgot' && (
              <motion.div key="forgot" variants={slideVariant} initial="hidden" animate="visible" exit="exit" className="auth-card">
                <div className="auth-card-header">
                  <h2>Forgot password?</h2>
                  <p>Enter your email and we'll send an OTP to reset your password.</p>
                </div>

                {error && <div className="auth-error"><AlertCircle size={15} /><span>{error}</span></div>}

                <form onSubmit={handleForgot} className="auth-form">
                  <div className="input-group">
                    <label htmlFor="forgot-email">Email</label>
                    <div className="input-wrap">
                      <Mail size={15} className="input-icon" />
                      <input id="forgot-email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                    </div>
                  </div>
                  <button type="submit" className="auth-submit-btn" disabled={isLoading} id="forgot-submit-btn">
                    {isLoading && <span className="btn-spinner" />} {isLoading ? 'Sending…' : 'Send OTP'}
                    <ArrowRight size={16} />
                  </button>
                </form>

                <button type="button" className="back-btn" onClick={() => switchMode('login')}>
                  <ArrowLeft size={14} /> Back to login
                </button>
              </motion.div>
            )}

            {/* ── RESET PASSWORD ── */}
            {mode === 'reset' && (
              <motion.div key="reset" variants={slideVariant} initial="hidden" animate="visible" exit="exit" className="auth-card">
                <div className="auth-card-header">
                  <div className="otp-icon-wrap"><Lock size={28} /></div>
                  <h2>Reset your password</h2>
                  <p>Enter the OTP sent to <strong>{pendingEmail || form.email}</strong> and choose a new password.</p>
                </div>

                {error && <div className="auth-error"><AlertCircle size={15} /><span>{error}</span></div>}

                <form onSubmit={handleReset} className="auth-form">
                  <div className="input-group">
                    <label>Verification Code</label>
                    <OtpInput value={otp} onChange={setOtp} />
                  </div>
                  <div className="input-group">
                    <label htmlFor="new-password">New Password</label>
                    <div className="input-wrap">
                      <Lock size={15} className="input-icon" />
                      <input id="new-password" type={showPw2 ? 'text' : 'password'} name="newPassword" value={form.newPassword} onChange={handleChange} placeholder="Min. 6 characters" required minLength={6} />
                      <button type="button" className="toggle-eye" onClick={() => setShowPw2(!showPw2)}>{showPw2 ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                    </div>
                  </div>
                  <button type="submit" className="auth-submit-btn" disabled={isLoading || otp.length < 6} id="reset-submit-btn">
                    {isLoading && <span className="btn-spinner" />} {isLoading ? 'Resetting…' : 'Reset Password'}
                    <ArrowRight size={16} />
                  </button>
                </form>

                <ResendTimer email={pendingEmail || form.email} />
                <button type="button" className="back-btn" onClick={() => switchMode('login')}>
                  <ArrowLeft size={14} /> Back to login
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Auth;
