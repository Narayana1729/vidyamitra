import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff,
  User, Building2, GraduationCap, Briefcase, BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DOMAIN_OPTIONS } from '../utils/domainData';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('student');
  const [domain, setDomain] = useState('Software Engineering / CS / IT');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
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
      const user = await signup({
        email, password, role,
        full_name: fullName,
        company_name: companyName,
        domain: role === 'student' ? domain : undefined
      });
      navigate(user.role === 'company' ? '/company/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-gradient" />

      <motion.div
        className="auth-card glass-card"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className="auth-logo">
          <div className="sidebar-logo-icon" style={{ width: 44, height: 44 }}>
            <Sparkles size={22} />
          </div>
          <h1>Join VidyaMitra</h1>
          <p className="auth-subtitle">Create your free account</p>
        </div>

        {/* Role Toggle */}
        <div className="auth-role-toggle">
          <button
            type="button"
            className={`auth-role-btn ${role === 'student' ? 'active' : ''}`}
            onClick={() => setRole('student')}
          >
            <GraduationCap size={18} />
            Student
          </button>
          <button
            type="button"
            className={`auth-role-btn ${role === 'company' ? 'active' : ''}`}
            onClick={() => setRole('company')}
          >
            <Briefcase size={18} />
            Company
          </button>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            className="auth-error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>{role === 'company' ? 'Contact Person' : 'Full Name'}</label>
            <div className="auth-input-wrap">
              <User size={16} />
              <input
                id="signup-name"
                type="text"
                placeholder={role === 'company' ? 'John Doe' : 'Your full name'}
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          <AnimatePresence>
            {role === 'company' && (
              <motion.div
                className="auth-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <label>Company Name</label>
                <div className="auth-input-wrap">
                  <Building2 size={16} />
                  <input
                    id="signup-company"
                    type="text"
                    placeholder="Acme Inc."
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    required={role === 'company'}
                  />
                </div>
              </motion.div>
            )}
            
            {role === 'student' && (
              <motion.div
                className="auth-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <label>Engineering Branch</label>
                <div className="auth-input-wrap">
                  <BookOpen size={16} />
                  <select
                    id="signup-domain"
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    required={role === 'student'}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      padding: '8px 0',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {DOMAIN_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="auth-field">
            <label>Email</label>
            <div className="auth-input-wrap">
              <Mail size={16} />
              <input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="auth-input-wrap">
              <Lock size={16} />
              <input
                id="signup-password"
                type={showPw ? 'text' : 'password'}
                placeholder="Min. 6 characters"
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
            id="signup-submit"
            type="submit"
            className="btn btn-primary btn-lg auth-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner" />
            ) : (
              <>Create Account <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
