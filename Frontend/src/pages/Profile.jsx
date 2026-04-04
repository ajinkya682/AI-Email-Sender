import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Lock, Sparkles, ArrowLeft,
  CheckCircle, AlertCircle, Eye, EyeOff, RefreshCw,
  Shield, BarChart2, Crown,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import './Profile.scss';

const PLAN_INFO = {
  free: { label: 'Free Plan', color: '#8A8F9A', icon: <Sparkles size={13} /> },
  pro: { label: 'Pro Plan', color: '#FF6A00', icon: <Crown size={13} /> },
  business: { label: 'Business Plan', color: '#7C3AED', icon: <Crown size={13} /> },
};

/* ─── OTP Input (inline) ─── */
const OtpInput = ({ value, onChange }) => {
  const refs = Array.from({ length: 6 }, () => ({ current: null }));
  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const chars = value.split('');
    chars[i] = val;
    onChange(chars.join(''));
    if (val && i < 5) refs[i + 1].current?.focus();
  };
  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs[i - 1].current?.focus();
  };
  return (
    <div className="profile-otp-inputs">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs[i].current = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={`profile-otp-box ${value[i] ? 'filled' : ''}`}
          id={`profile-otp-${i}`}
        />
      ))}
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, requestChangePasswordOtp, changePassword, isLoading, error, clearError } = useAuthStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState(null);

  // Edit profile state
  const [editForm, setEditForm] = useState({ name: user?.name || '', mobile: user?.mobile || '' });

  // Change password state
  const [pwStep, setPwStep] = useState('request'); // 'request' | 'verify'
  const [otp, setOtp] = useState('');
  const [newPw, setNewPw] = useState('');
  const [showPw, setShowPw] = useState(false);

  useEffect(() => { clearError(); }, [activeTab]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  /* ── Update Profile ── */
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const result = await updateProfile(editForm);
    if (result.success) showToast('success', 'Profile updated successfully!');
    else showToast('error', error || 'Failed to update profile');
  };

  /* ── Request OTP for password change ── */
  const handleRequestPwOtp = async () => {
    const result = await requestChangePasswordOtp();
    if (result.success) {
      setPwStep('verify');
      showToast('success', result.message);
    } else {
      showToast('error', error || 'Failed to send OTP');
    }
  };

  /* ── Change Password ── */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (otp.length < 6 || newPw.length < 6) return;
    const result = await changePassword(otp, newPw);
    if (result.success) {
      showToast('success', result.message);
      setOtp('');
      setNewPw('');
      setPwStep('request');
    } else {
      showToast('error', error || 'Failed to change password');
    }
  };

  const plan = PLAN_INFO[user?.plan] || PLAN_INFO.free;
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'N/A';

  return (
    <div className="profile-page">
      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`profile-toast ${toast.type}`}
          >
            {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <header className="profile-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')} id="profile-back-btn">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div className="profile-header-brand">
          <div className="brand-icon"><Sparkles size={15} /></div>
          <span>OmniPilot AI</span>
        </div>
      </header>

      <div className="profile-content">
        {/* ── Left: Avatar card ── */}
        <aside className="profile-aside">
          <div className="avatar-card">
            <div className="profile-avatar">{initials}</div>
            <h3 className="profile-name">{user?.name}</h3>
            <p className="profile-email-display">{user?.email}</p>
            <div className="plan-badge" style={{ '--plan-color': plan.color }}>
              {plan.icon} {plan.label}
            </div>
            <div className="profile-meta">
              <div className="meta-item">
                <BarChart2 size={14} />
                <span>Messages: <strong>{user?.usageCount || 0}</strong></span>
              </div>
              <div className="meta-item">
                <CheckCircle size={14} />
                <span>Member since <strong>{joinedDate}</strong></span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Right: Tabs ── */}
        <main className="profile-main">
          <div className="profile-tabs">
            {[
              { id: 'overview', icon: <User size={14} />, label: 'Overview' },
              { id: 'edit', icon: <Shield size={14} />, label: 'Edit Profile' },
              { id: 'security', icon: <Lock size={14} />, label: 'Security' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                id={`profile-tab-${tab.id}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="tab-panel"
              >
                <h2 className="tab-title">Profile Overview</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-icon"><User size={16} /></div>
                    <div>
                      <div className="info-label">Full Name</div>
                      <div className="info-value">{user?.name || '—'}</div>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon"><Mail size={16} /></div>
                    <div>
                      <div className="info-label">Email Address</div>
                      <div className="info-value">{user?.email || '—'}
                        {user?.isVerified && <span className="verified-badge"><CheckCircle size={11} />Verified</span>}
                      </div>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon"><Phone size={16} /></div>
                    <div>
                      <div className="info-label">Mobile Number</div>
                      <div className="info-value">{user?.mobile || <span className="not-set">Not set</span>}</div>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon" style={{ color: plan.color }}>{plan.icon}</div>
                    <div>
                      <div className="info-label">Subscription Plan</div>
                      <div className="info-value" style={{ color: plan.color }}>{plan.label}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── EDIT PROFILE ── */}
            {activeTab === 'edit' && (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="tab-panel"
              >
                <h2 className="tab-title">Edit Profile</h2>
                <p className="tab-subtitle">Update your name and contact information.</p>

                <form onSubmit={handleUpdateProfile} className="profile-form">
                  <div className="profile-input-group">
                    <label htmlFor="edit-name">Full Name</label>
                    <div className="profile-input-wrap">
                      <User size={15} className="pinput-icon" />
                      <input
                        id="edit-name"
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                  </div>
                  <div className="profile-input-group">
                    <label htmlFor="edit-mobile">Mobile Number</label>
                    <div className="profile-input-wrap">
                      <Phone size={15} className="pinput-icon" />
                      <input
                        id="edit-mobile"
                        type="tel"
                        value={editForm.mobile}
                        onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  <div className="profile-input-group readonly">
                    <label>Email Address <span className="readonly-badge">Cannot be changed</span></label>
                    <div className="profile-input-wrap disabled">
                      <Mail size={15} className="pinput-icon" />
                      <input type="email" value={user?.email} readOnly />
                    </div>
                  </div>

                  <button type="submit" className="profile-save-btn" disabled={isLoading} id="save-profile-btn">
                    {isLoading ? <span className="btn-spinner" /> : <CheckCircle size={15} />}
                    {isLoading ? 'Saving…' : 'Save Changes'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── SECURITY ── */}
            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="tab-panel"
              >
                <h2 className="tab-title">Security Settings</h2>
                <p className="tab-subtitle">Change your password securely with OTP verification.</p>

                {pwStep === 'request' ? (
                  <div className="pw-request-section">
                    <div className="security-info-box">
                      <Shield size={20} className="security-icon" />
                      <div>
                        <strong>OTP Verification Required</strong>
                        <p>We'll send a one-time code to <strong>{user?.email}</strong> to confirm your identity before changing your password.</p>
                      </div>
                    </div>
                    <button
                      className="profile-save-btn"
                      onClick={handleRequestPwOtp}
                      disabled={isLoading}
                      id="request-pw-otp-btn"
                    >
                      {isLoading ? <span className="btn-spinner" /> : <RefreshCw size={15} />}
                      {isLoading ? 'Sending OTP…' : 'Send OTP to Email'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="profile-form">
                    <div className="profile-input-group">
                      <label>Verification Code</label>
                      <p className="otp-hint">Enter the 6-digit code sent to your email</p>
                      <OtpInput value={otp} onChange={setOtp} />
                    </div>
                    <div className="profile-input-group">
                      <label htmlFor="new-pw">New Password</label>
                      <div className="profile-input-wrap">
                        <Lock size={15} className="pinput-icon" />
                        <input
                          id="new-pw"
                          type={showPw ? 'text' : 'password'}
                          value={newPw}
                          onChange={(e) => setNewPw(e.target.value)}
                          placeholder="Min. 6 characters"
                          minLength={6}
                          required
                        />
                        <button type="button" className="toggle-eye-btn" onClick={() => setShowPw(!showPw)}>
                          {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="profile-error">
                        <AlertCircle size={14} /> {error}
                      </div>
                    )}

                    <div className="btn-row">
                      <button type="button" className="back-step-btn" onClick={() => { setPwStep('request'); setOtp(''); setNewPw(''); }}>
                        <ArrowLeft size={14} /> Back
                      </button>
                      <button
                        type="submit"
                        className="profile-save-btn"
                        disabled={isLoading || otp.length < 6 || newPw.length < 6}
                        id="change-pw-btn"
                      >
                        {isLoading ? <span className="btn-spinner" /> : <Lock size={15} />}
                        {isLoading ? 'Changing…' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Profile;
