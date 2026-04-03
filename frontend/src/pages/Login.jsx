import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff, BrainCircuit, Rocket, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login({ email, password });
      navigate(user.role === 'company' ? '/company/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-split">
      {/* Background Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      
      {/* LEFT SIDE - Hero & Branding (Hidden on mobile) */}
      <div className="auth-hero">
        <motion.div 
          className="auth-hero-content"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="auth-hero-logo">
            <div className="sidebar-logo-icon" style={{ width: 48, height: 48 }}>
              <Sparkles size={24} />
            </div>
            <h2>VidyaMitra</h2>
          </div>
          
          <h1 className="auth-hero-title">
            Your Ultimate <br/> 
            <span className="gradient-text">AI Career Copilot</span>
          </h1>
          <p className="auth-hero-subtitle">
            Leverage deep learning and predictive analytics to master your interviews, ace ATS systems, and land your dream job faster.
          </p>

          <div className="auth-features">
            <motion.div className="auth-feature" whileHover={{ x: 5 }}>
              <div className="auth-feature-icon"><BrainCircuit size={18} /></div>
              <span>ML-Powered Insights & Analysis</span>
            </motion.div>
            <motion.div className="auth-feature" whileHover={{ x: 5 }}>
              <div className="auth-feature-icon"><Target size={18} /></div>
              <span>High-Precision ATS Scoring</span>
            </motion.div>
            <motion.div className="auth-feature" whileHover={{ x: 5 }}>
              <div className="auth-feature-icon"><Rocket size={18} /></div>
              <span>Automated Daily Action Plans</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="auth-form-container">
        <motion.div
          className="auth-card premium-glass"
          initial={{ opacity: 0, y: 32, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Mobile Logo Only */}
          <div className="auth-mobile-logo">
            <div className="sidebar-logo-icon">
              <Sparkles size={20} />
            </div>
            <h1>VidyaMitra</h1>
          </div>

          <div className="auth-form-header">
            <h2>Welcome Back</h2>
            <p>Access your personalized dashboard.</p>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              className="auth-error-alert"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
            >
              {error}
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field premium-field">
              <label>Email Address</label>
              <div className="auth-input-wrap">
                <Mail size={16} />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field premium-field">
              <div className="auth-label-row">
                <label>Password</label>
                <Link to="#" className="forgot-password">Forgot?</Link>
              </div>
              <div className="auth-input-wrap">
                <Lock size={16} />
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-lg auth-submit premium-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <><span>Sign In Securely</span> <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link premium-link">Create one now</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
