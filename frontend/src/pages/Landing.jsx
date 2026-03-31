import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText, Brain, Map, Mic, BarChart3, Sparkles,
    ArrowRight, Zap, Users, Award, Briefcase
} from 'lucide-react';

import ThemeToggle from '../components/ThemeToggle';

const features = [
    {
        icon: <FileText size={24} />,
        title: 'AI Resume Analyzer',
        desc: 'Get instant AI feedback on your resume with ATS scoring, keyword optimization, and section-by-section analysis.',
        color: 'var(--accent-primary)',
        bg: 'rgba(124, 58, 237, 0.12)',
        to: '/resume',
    },
    {
        icon: <Brain size={24} />,
        title: 'Skill Gap Detection',
        desc: 'Compare your skills against industry requirements and discover exactly what you need to learn for your dream role.',
        color: 'var(--cyan)',
        bg: 'rgba(6, 182, 212, 0.12)',
        to: '/skills',
    },
    {
        icon: <Map size={24} />,
        title: 'Learning Roadmap',
        desc: 'Get a personalized, phased learning plan with curated resources and timelines to close your skill gaps efficiently.',
        color: 'var(--emerald)',
        bg: 'rgba(16, 185, 129, 0.12)',
        to: '/roadmap',
    },
    {
        icon: <Mic size={24} />,
        title: 'Mock Interview',
        desc: 'Practice with role-specific interview questions and receive AI-powered feedback on your answers in real-time.',
        color: 'var(--amber)',
        bg: 'rgba(245, 158, 11, 0.12)',
        to: '/interview',
    },
    {
        icon: <BarChart3 size={24} />,
        title: 'Progress Dashboard',
        desc: 'Track your career readiness journey with visual analytics, streaks, and improvement metrics over time.',
        color: 'var(--blue)',
        bg: 'rgba(59, 130, 246, 0.12)',
        to: '/dashboard',
    },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const item = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Landing() {
    return (
  <div className="landing">
    {/* Nav */}
    <nav className="landing-nav">
      <Link to="/" className="landing-nav-logo">
        <div
          className="sidebar-logo-icon"
          style={{ width: 36, height: 36, fontSize: 18 }}
        >
          <Sparkles size={18} />
        </div>
        <h2>VidyaMitra</h2>
      </Link>

      <div className="landing-nav-actions">
        <Link to="/login" className="btn btn-secondary btn-sm">
          Login
        </Link>
        <Link to="/signup" className="btn btn-primary btn-sm">
          Get Started <ArrowRight size={16} />
        </Link>
        <ThemeToggle />
      </div>
    </nav>

    {/* Hero */}
    <section className="landing-hero">
      <motion.div
        className="landing-hero-content"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="landing-badge">
          <Sparkles size={14} /> AI-Powered Career Intelligence
        </div>

        <h1 className="landing-title">
          Your Career Growth<br />
          Starts with <span className="gradient-text">VidyaMitra</span>
        </h1>

        <p className="landing-subtitle">
          Analyze your resume, detect skill gaps, generate personalized learning roadmaps,
          and ace interviews — all powered by advanced AI technology.
        </p>

        <div className="landing-cta">
          <Link to="/signup" className="btn btn-primary btn-lg">
            Get Started Free <ArrowRight size={18} />
          </Link>

          <Link to="/signup?role=company" className="btn btn-secondary btn-lg">
            I'm a Company <Briefcase size={18} />
          </Link>
        </div>

        <motion.div
          className="landing-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="landing-stat">
            <div className="landing-stat-value">10K+</div>
            <div className="landing-stat-label">Resumes Analyzed</div>
          </div>

          <div className="landing-stat">
            <div className="landing-stat-value">95%</div>
            <div className="landing-stat-label">User Satisfaction</div>
          </div>

          <div className="landing-stat">
            <div className="landing-stat-value">500+</div>
            <div className="landing-stat-label">Skills Tracked</div>
          </div>

          <div className="landing-stat">
            <div className="landing-stat-value">50K+</div>
            <div className="landing-stat-label">Interviews Simulated</div>
          </div>
        </motion.div>
      </motion.div>
    </section>

    {/* Features */}
    <section className="landing-features">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="landing-features-title">
          Everything You Need to <span className="gradient-text">Succeed</span>
        </h2>

        <p className="landing-features-subtitle">
          Five powerful AI-driven tools working together to accelerate your career growth
        </p>
      </motion.div>

      <motion.div
        className="grid-3"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        style={{ gap: 24 }}
      >
        {features.map((f, i) => (
          <motion.div key={i} variants={item}>
            <Link to={f.to} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="feature-card">
                <div
                  className="feature-icon"
                  style={{ background: f.bg, color: f.color }}
                >
                  {f.icon}
                </div>

                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>

    {/* CTA */}
    <section className="landing-cta-section">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2>Ready to Accelerate Your Career?</h2>
        <p>Join thousands of students already using VidyaMitra.</p>

        <Link to="/signup" className="btn btn-primary btn-lg">
          Start Free Analysis <ArrowRight size={18} />
        </Link>
      </motion.div>
    </section>

    {/* Footer */}
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        padding: '32px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          VidyaMitra
        </span>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
        © 2026 VidyaMitra. AI-Powered Career Intelligence Platform.
      </p>
    </footer>
  </div>
);
}