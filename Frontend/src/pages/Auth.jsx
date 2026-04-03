import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Mail, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import "./Auth.scss";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { login, register, isLoading, error, clearError } = useAuthStore();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await login(formData.email, formData.password);
    } else {
      await register(formData.name, formData.email, formData.password);
    }
  };

  return (
    <div className="auth-container">
      {/* Visual Side */}
      <div className="auth-visual">
        <div className="visual-content">
          <Mail size={80} className="mail-icon" />
          <h1>Smart Email Automation</h1>
          <p>Let AI research, draft, and send emails for you just by asking.</p>
        </div>
      </div>

      <div className="auth-wrapper">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="auth-box"
        >
          <div className="auth-header">
            <div className="logo">
              <Sparkles className="icon-sparkle" size={28} />
              <span>AI Assistant</span>
            </div>
            <h2>{isLogin ? "Welcome back" : "Create an account"}</h2>
            <p>
              {isLogin
                ? "Enter your details to access your chats."
                : "Sign up to start chatting and sending smart emails."}
            </p>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="input-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
            )}
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={isLoading} className="submit-btn">
              {isLoading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                className="toggle-btn"
                onClick={() => {
                  setIsLogin(!isLogin);
                  clearError();
                }}
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
