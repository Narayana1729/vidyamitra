/**
 * AI Insights Page — Interactive ML-powered career intelligence dashboard.
 * 5 sections backed by trained ML models:
 *   1. Placement Prediction (GradientBoosting + SHAP)
 *   2. Career Archetype (KMeans clustering)
 *   3. Role Classifier (TF-IDF + RandomForest)
 *   4. Skill Health (market trend analysis)
 *   5. Readiness Timeline (linear regression)
 */
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Brain, FileText, Activity, Calendar,
  ChevronDown, ChevronUp, Sparkles, TrendingUp, TrendingDown,
  Minus, AlertCircle, CheckCircle, Loader2, Zap, Award,
  BarChart3, Shield, Clock, Plus, X,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import {
  predictPlacement,
  predictArchetype,
  predictRole,
  analyzeSkillHealth,
  predictTimeline,
} from '../services/mlService';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const BRANCH_OPTIONS = [
  'CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AI/ML', 'BioTech', 'Chemical',
];

const SECTIONS = [
  { id: 'placement', icon: Target, label: 'Placement Prediction', color: 'var(--accent-primary)' },
  { id: 'archetype', icon: Brain, label: 'Career Archetype', color: 'var(--cyan)' },
  { id: 'role', icon: FileText, label: 'Role Classifier', color: 'var(--emerald)' },
  { id: 'health', icon: Activity, label: 'Skill Health', color: 'var(--amber)' },
  { id: 'timeline', icon: Calendar, label: 'Readiness Timeline', color: 'var(--blue)' },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.35, ease: 'easeOut' },
};

/* ═══════════════════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

/* Animated score ring (SVG) */
function ScoreRing({ value, max = 100, size = 140, strokeWidth = 10, color, label }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--bg-tertiary)" strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color || 'url(#ringGrad)'}
          strokeWidth={strokeWidth} strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ strokeDasharray: circumference }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-primary)" />
            <stop offset="100%" stopColor="var(--cyan)" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: size * 0.22,
          fontWeight: 800, lineHeight: 1,
        }}>
          {typeof value === 'number' ? Math.round(value) : value}
        </span>
        {label && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{label}</span>}
      </div>
    </div>
  );
}

/* Confidence bar */
function ConfidenceBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}%</span>
      </div>
      <div className="progress-bar">
        <motion.div
          className="progress-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ background: color || 'var(--accent-gradient)' }}
        />
      </div>
    </div>
  );
}

/* Section accordion wrapper */
function SectionAccordion({ section, isOpen, onToggle, children }) {
  const { icon: Icon, label, color } = section;
  return (
    <div className="glass-card ai-section" style={{ marginBottom: 20 }}>
      <button
        className="ai-section-header"
        onClick={onToggle}
        id={`ai-section-${section.id}`}
        aria-expanded={isOpen}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="ai-section-icon" style={{
            background: `color-mix(in srgb, ${color} 15%, transparent)`,
            color: color,
          }}>
            <Icon size={22} />
          </div>
          <span className="ai-section-label">{label}</span>
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="ai-section-body">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Loading state */
function LoadingState({ message }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 12, padding: 40,
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      >
        <Loader2 size={28} style={{ color: 'var(--accent-primary)' }} />
      </motion.div>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        {message || 'Analyzing...'}
      </span>
    </div>
  );
}

/* Error state */
function ErrorBanner({ error, onRetry }) {
  return (
    <div style={{
      padding: '12px 16px', borderRadius: 'var(--radius-md)',
      background: 'color-mix(in srgb, var(--rose) 10%, transparent)',
      border: '1px solid color-mix(in srgb, var(--rose) 25%, transparent)',
      display: 'flex', alignItems: 'center', gap: 10, fontSize: 13,
    }}>
      <AlertCircle size={16} style={{ color: 'var(--rose)', flexShrink: 0 }} />
      <span style={{ flex: 1, color: 'var(--rose)' }}>{error}</span>
      {onRetry && (
        <button className="btn btn-ghost btn-sm" onClick={onRetry} style={{ fontSize: 12 }}>
          Retry
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 1: PLACEMENT PREDICTION
   ═══════════════════════════════════════════════════════════════ */

function PlacementSection() {
  const [form, setForm] = useState({
    cgpa: '', leetcode_count: '', certifications_count: '',
    projects_count: '', internships_count: '', backlogs: '',
    github_repos: '', hackathons_count: '', skills_count: '',
    ats_score: '', interview_score: '', branch: 'CSE',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const payload = {
        ...form,
        cgpa: parseFloat(form.cgpa) || 0,
        leetcode_count: parseInt(form.leetcode_count) || 0,
        certifications_count: parseInt(form.certifications_count) || 0,
        projects_count: parseInt(form.projects_count) || 0,
        internships_count: parseInt(form.internships_count) || 0,
        backlogs: parseInt(form.backlogs) || 0,
        github_repos: parseInt(form.github_repos) || 0,
        hackathons_count: parseInt(form.hackathons_count) || 0,
        skills_count: parseInt(form.skills_count) || 0,
        ats_score: parseFloat(form.ats_score) || 0,
        interview_score: parseFloat(form.interview_score) || 0,
      };
      const res = await predictPlacement(payload);
      setResult(res);
    } catch (e) {
      setError(e.response?.data?.detail || e.message || 'Prediction failed');
    }
    setLoading(false);
  };

  const fields = [
    { key: 'cgpa', label: 'CGPA', type: 'number', placeholder: '0 – 10', step: '0.1' },
    { key: 'leetcode_count', label: 'LeetCode Problems', type: 'number', placeholder: '0+' },
    { key: 'certifications_count', label: 'Certifications', type: 'number', placeholder: '0+' },
    { key: 'projects_count', label: 'Projects', type: 'number', placeholder: '0+' },
    { key: 'internships_count', label: 'Internships', type: 'number', placeholder: '0+' },
    { key: 'backlogs', label: 'Backlogs', type: 'number', placeholder: '0+' },
    { key: 'github_repos', label: 'GitHub Repos', type: 'number', placeholder: '0+' },
    { key: 'hackathons_count', label: 'Hackathons', type: 'number', placeholder: '0+' },
    { key: 'skills_count', label: 'Skills Count', type: 'number', placeholder: '0+' },
    { key: 'ats_score', label: 'ATS Score', type: 'number', placeholder: '0 – 100', step: '0.1' },
    { key: 'interview_score', label: 'Interview Score', type: 'number', placeholder: '0 – 100', step: '0.1' },
  ];

  const verdictColor = {
    'High': 'var(--emerald)', 'Moderate': 'var(--amber)', 'Low': 'var(--rose)',
  };

  return (
    <div>
      {/* Input form */}
      <div className="ai-form-grid">
        {fields.map(f => (
          <div key={f.key} className="ai-field">
            <label>{f.label}</label>
            <input
              className="input"
              type={f.type}
              step={f.step}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={e => handleChange(f.key, e.target.value)}
            />
          </div>
        ))}
        <div className="ai-field">
          <label>Branch</label>
          <select className="select" value={form.branch} onChange={e => handleChange('branch', e.target.value)}>
            {BRANCH_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={loading}
        style={{ marginTop: 20, width: '100%' }}
        id="predict-placement-btn"
      >
        {loading ? <><Loader2 size={16} className="spin" /> Predicting...</> : <><Zap size={16} /> Predict Placement</>}
      </button>

      {error && <div style={{ marginTop: 16 }}><ErrorBanner error={error} onRetry={handleSubmit} /></div>}

      {/* Result */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div {...fadeUp} className="ai-result-panel" style={{ marginTop: 24 }}>
            <div className="ai-result-top">
              <ScoreRing
                value={result.placement_probability}
                label="Probability"
                color={verdictColor[result.verdict]}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span className="badge" style={{
                    background: `color-mix(in srgb, ${verdictColor[result.verdict]} 15%, transparent)`,
                    color: verdictColor[result.verdict],
                    fontSize: 14, padding: '6px 14px',
                  }}>
                    {result.verdict === 'High' && <CheckCircle size={14} />}
                    {result.verdict === 'Moderate' && <AlertCircle size={14} />}
                    {result.verdict === 'Low' && <AlertCircle size={14} />}
                    {result.verdict} Chance
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                  {result.message}
                </p>
              </div>
            </div>

            {/* SHAP factors */}
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, marginBottom: 12, marginTop: 20 }}>
              Top Influencing Factors
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.top_factors?.map((f, i) => (
                <div key={i} className="ai-factor-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    {f.direction === 'positive'
                      ? <TrendingUp size={14} style={{ color: 'var(--emerald)' }} />
                      : <TrendingDown size={14} style={{ color: 'var(--rose)' }} />
                    }
                    <span style={{ fontSize: 13 }}>{f.feature}</span>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: f.direction === 'positive' ? 'var(--emerald)' : 'var(--rose)',
                  }}>
                    {f.impact > 0 ? '+' : ''}{f.impact.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 2: CAREER ARCHETYPE
   ═══════════════════════════════════════════════════════════════ */

function ArchetypeSection() {
  const [form, setForm] = useState({
    cgpa: '', leetcode_count: '', certifications_count: '',
    projects_count: '', internships_count: '', github_repos: '',
    hackathons_count: '', skills_count: '', ats_score: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const payload = {
        cgpa: parseFloat(form.cgpa) || 0,
        leetcode_count: parseInt(form.leetcode_count) || 0,
        certifications_count: parseInt(form.certifications_count) || 0,
        projects_count: parseInt(form.projects_count) || 0,
        internships_count: parseInt(form.internships_count) || 0,
        github_repos: parseInt(form.github_repos) || 0,
        hackathons_count: parseInt(form.hackathons_count) || 0,
        skills_count: parseInt(form.skills_count) || 0,
        ats_score: parseFloat(form.ats_score) || 0,
      };
      const res = await predictArchetype(payload);
      setResult(res);
    } catch (e) {
      setError(e.response?.data?.detail || e.message || 'Clustering failed');
    }
    setLoading(false);
  };

  const fields = [
    { key: 'cgpa', label: 'CGPA', placeholder: '0 – 10', step: '0.1' },
    { key: 'leetcode_count', label: 'LeetCode Problems', placeholder: '0+' },
    { key: 'certifications_count', label: 'Certifications', placeholder: '0+' },
    { key: 'projects_count', label: 'Projects', placeholder: '0+' },
    { key: 'internships_count', label: 'Internships', placeholder: '0+' },
    { key: 'github_repos', label: 'GitHub Repos', placeholder: '0+' },
    { key: 'hackathons_count', label: 'Hackathons', placeholder: '0+' },
    { key: 'skills_count', label: 'Skills Count', placeholder: '0+' },
    { key: 'ats_score', label: 'ATS Score', placeholder: '0 – 100', step: '0.1' },
  ];

  return (
    <div>
      <div className="ai-form-grid">
        {fields.map(f => (
          <div key={f.key} className="ai-field">
            <label>{f.label}</label>
            <input
              className="input"
              type="number"
              step={f.step}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={e => handleChange(f.key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={loading}
        style={{ marginTop: 20, width: '100%' }}
        id="predict-archetype-btn"
      >
        {loading ? <><Loader2 size={16} className="spin" /> Analyzing...</> : <><Brain size={16} /> Discover Archetype</>}
      </button>

      {error && <div style={{ marginTop: 16 }}><ErrorBanner error={error} onRetry={handleSubmit} /></div>}

      <AnimatePresence>
        {result && !loading && (
          <motion.div {...fadeUp} style={{ marginTop: 24 }}>
            <div className="ai-archetype-card" style={{ borderColor: result.color || 'var(--accent-primary)' }}>
              <div className="ai-archetype-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                  <span style={{ fontSize: 48 }}>{result.emoji}</span>
                  <div>
                    <h3 style={{
                      fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
                      color: result.color || 'var(--accent-tertiary)',
                    }}>
                      {result.archetype}
                    </h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.6 }}>
                      {result.description}
                    </p>
                  </div>
                </div>
                <ScoreRing value={result.confidence} label="Confidence" size={100} strokeWidth={8} color={result.color} />
              </div>

              {/* Strengths */}
              {result.strengths && (
                <div style={{ marginTop: 20 }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
                    💪 Strengths
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {result.strengths.map((s, i) => (
                      <span key={i} className="badge badge-emerald">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Career Paths */}
              {result.career_paths && (
                <div style={{ marginTop: 20 }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
                    🚀 Career Paths
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {result.career_paths.map((p, i) => (
                      <span key={i} className="badge badge-cyan">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 3: ROLE CLASSIFIER
   ═══════════════════════════════════════════════════════════════ */

function RoleSection() {
  const [skills, setSkills] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (skills.trim().length < 3) return;
    setError(null);
    setLoading(true);
    try {
      const res = await predictRole(skills);
      setResult(res);
    } catch (e) {
      setError(e.response?.data?.detail || e.message || 'Classification failed');
    }
    setLoading(false);
  };

  const roleColors = ['var(--emerald)', 'var(--cyan)', 'var(--accent-primary)'];

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        Enter your skills and expertise to find the best matching job roles.
      </p>
      <textarea
        className="interview-textarea"
        placeholder="e.g. Python, React, TensorFlow, SQL, Docker, Machine Learning, REST APIs..."
        value={skills}
        onChange={e => setSkills(e.target.value)}
        style={{ minHeight: 100 }}
      />
      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={loading || skills.trim().length < 3}
        style={{ marginTop: 16, width: '100%' }}
        id="predict-role-btn"
      >
        {loading ? <><Loader2 size={16} className="spin" /> Classifying...</> : <><Award size={16} /> Classify Role</>}
      </button>

      {error && <div style={{ marginTop: 16 }}><ErrorBanner error={error} onRetry={handleSubmit} /></div>}

      <AnimatePresence>
        {result && !loading && (
          <motion.div {...fadeUp} className="ai-result-panel" style={{ marginTop: 24 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
                color: 'var(--emerald)',
              }}>
                {result.best_match}
              </span>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                {result.message}
              </p>
            </div>
            <h4 style={{
              fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, marginBottom: 14,
            }}>
              Top 3 Role Matches
            </h4>
            {result.top_matches?.map((m, i) => (
              <ConfidenceBar
                key={i}
                label={`${i + 1}. ${m.role}`}
                value={m.score}
                color={roleColors[i]}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 4: SKILL HEALTH
   ═══════════════════════════════════════════════════════════════ */

function SkillHealthSection() {
  const [tags, setTags] = useState([]);
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const addTag = () => {
    const t = input.trim();
    if (t && !tags.includes(t)) {
      setTags(prev => [...prev, t]);
      setInput('');
    }
  };

  const removeTag = (idx) => setTags(prev => prev.filter((_, i) => i !== idx));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async () => {
    if (tags.length === 0) return;
    setError(null);
    setLoading(true);
    try {
      const res = await analyzeSkillHealth(tags, 0);
      setResult(res);
    } catch (e) {
      setError(e.response?.data?.detail || e.message || 'Health analysis failed');
    }
    setLoading(false);
  };

  const trendIcon = (trend) => {
    if (trend === 'rising' || trend === 'hot') return <TrendingUp size={14} style={{ color: 'var(--emerald)' }} />;
    if (trend === 'declining' || trend === 'cold') return <TrendingDown size={14} style={{ color: 'var(--rose)' }} />;
    return <Minus size={14} style={{ color: 'var(--text-muted)' }} />;
  };

  const trendColor = (trend) => {
    if (trend === 'rising' || trend === 'hot') return 'var(--emerald)';
    if (trend === 'declining' || trend === 'cold') return 'var(--rose)';
    return 'var(--amber)';
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
        Add your skills to analyze their market health and trends.
      </p>

      <div className="tag-input-container" onClick={() => inputRef.current?.focus()}>
        {tags.map((t, i) => (
          <span key={i} className="tag">
            {t}
            <button onClick={(e) => { e.stopPropagation(); removeTag(i); }}>
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="tag-input"
          placeholder={tags.length === 0 ? 'Type a skill and press Enter...' : ''}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={loading || tags.length === 0}
        style={{ marginTop: 16, width: '100%' }}
        id="analyze-health-btn"
      >
        {loading ? <><Loader2 size={16} className="spin" /> Analyzing...</> : <><BarChart3 size={16} /> Analyze Health</>}
      </button>

      {error && <div style={{ marginTop: 16 }}><ErrorBanner error={error} onRetry={handleSubmit} /></div>}

      <AnimatePresence>
        {result && !loading && (
          <motion.div {...fadeUp} className="ai-result-panel" style={{ marginTop: 24 }}>
            {/* Overall health */}
            {result.portfolio_health != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                <ScoreRing
                  value={result.portfolio_health}
                  label="Health Score"
                  size={110}
                  strokeWidth={8}
                  color={result.portfolio_health >= 70 ? 'var(--emerald)' : result.portfolio_health >= 40 ? 'var(--amber)' : 'var(--rose)'}
                />
                <div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>
                    Portfolio Health
                  </h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {result.summary || 'Your skill portfolio analysis is ready.'}
                  </p>
                </div>
              </div>
            )}

            {/* Individual skills */}
            {result.skills && (
              <div>
                <h4 style={{
                  fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, marginBottom: 12,
                }}>
                  Individual Skill Analysis
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.skills.map((s, i) => (
                    <div key={i} className="ai-factor-row" style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                        {trendIcon(s.trend)}
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="badge" style={{
                          background: `color-mix(in srgb, ${trendColor(s.trend)} 15%, transparent)`,
                          color: trendColor(s.trend),
                        }}>
                          {s.trend || 'stable'}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: trendColor(s.trend) }}>
                          {s.score != null ? `${s.score}%` : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <h4 style={{
                  fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, marginBottom: 10,
                }}>
                  💡 Recommendations
                </h4>
                <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.recommendations.map((r, i) => (
                    <li key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {typeof r === 'string' ? r : r.message || r.action}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECTION 5: READINESS TIMELINE
   ═══════════════════════════════════════════════════════════════ */

function TimelineSection() {
  const [weeks, setWeeks] = useState([
    { week: 1, resume_score: '', skill_pct: '', interview_score: '' },
    { week: 2, resume_score: '', skill_pct: '', interview_score: '' },
    { week: 3, resume_score: '', skill_pct: '', interview_score: '' },
  ]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateWeek = (idx, key, val) => {
    setWeeks(prev => prev.map((w, i) => i === idx ? { ...w, [key]: val } : w));
  };

  const addWeek = () => {
    setWeeks(prev => [...prev, { week: prev.length + 1, resume_score: '', skill_pct: '', interview_score: '' }]);
  };

  const removeWeek = (idx) => {
    if (weeks.length <= 2) return;
    setWeeks(prev => prev.filter((_, i) => i !== idx).map((w, i) => ({ ...w, week: i + 1 })));
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const payload = weeks.map(w => ({
        week: w.week,
        resume_score: parseFloat(w.resume_score) || 0,
        skill_pct: parseFloat(w.skill_pct) || 0,
        interview_score: parseFloat(w.interview_score) || 0,
      }));
      const res = await predictTimeline(payload);
      setResult(res);
    } catch (e) {
      setError(e.response?.data?.detail || e.message || 'Timeline prediction failed');
    }
    setLoading(false);
  };

  // Build chart data from result
  const chartData = result?.timeline || result?.chart_data || null;

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        Enter your weekly progress scores to predict when you'll be placement-ready.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Header row */}
        <div className="ai-timeline-header">
          <span style={{ width: 60 }}>Week</span>
          <span style={{ flex: 1 }}>Resume Score</span>
          <span style={{ flex: 1 }}>Skill %</span>
          <span style={{ flex: 1 }}>Interview Score</span>
          <span style={{ width: 32 }}></span>
        </div>

        {weeks.map((w, i) => (
          <div key={i} className="ai-timeline-row">
            <span className="ai-timeline-week">{w.week}</span>
            <input
              className="input"
              type="number"
              placeholder="0–100"
              value={w.resume_score}
              onChange={e => updateWeek(i, 'resume_score', e.target.value)}
              style={{ flex: 1 }}
            />
            <input
              className="input"
              type="number"
              placeholder="0–100"
              value={w.skill_pct}
              onChange={e => updateWeek(i, 'skill_pct', e.target.value)}
              style={{ flex: 1 }}
            />
            <input
              className="input"
              type="number"
              placeholder="0–100"
              value={w.interview_score}
              onChange={e => updateWeek(i, 'interview_score', e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              className="btn btn-ghost"
              onClick={() => removeWeek(i)}
              disabled={weeks.length <= 2}
              style={{ padding: 4, minWidth: 32 }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <button
        className="btn btn-secondary btn-sm"
        onClick={addWeek}
        style={{ marginTop: 8 }}
      >
        <Plus size={14} /> Add Week
      </button>

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={loading || weeks.length < 2}
        style={{ marginTop: 16, width: '100%' }}
        id="predict-timeline-btn"
      >
        {loading ? <><Loader2 size={16} className="spin" /> Predicting...</> : <><Clock size={16} /> Predict Readiness</>}
      </button>

      {error && <div style={{ marginTop: 16 }}><ErrorBanner error={error} onRetry={handleSubmit} /></div>}

      <AnimatePresence>
        {result && !loading && (
          <motion.div {...fadeUp} className="ai-result-panel" style={{ marginTop: 24 }}>
            {/* Summary cards */}
            <div className="grid-3" style={{ marginBottom: 24 }}>
              {result.predicted_ready_week != null && (
                <div className="glass-card glass-card-sm" style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
                    color: 'var(--emerald)',
                  }}>
                    Week {result.predicted_ready_week}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Predicted Ready</div>
                </div>
              )}
              {result.current_readiness != null && (
                <div className="glass-card glass-card-sm" style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
                    color: 'var(--cyan)',
                  }}>
                    {Math.round(result.current_readiness)}%
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Current Readiness</div>
                </div>
              )}
              {result.weekly_growth != null && (
                <div className="glass-card glass-card-sm" style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
                    color: 'var(--accent-primary)',
                  }}>
                    +{result.weekly_growth?.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Weekly Growth</div>
                </div>
              )}
            </div>

            {/* Chart */}
            {chartData && chartData.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <h4 style={{
                  fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, marginBottom: 16,
                }}>
                  📈 Readiness Projection
                </h4>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="readGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="week"
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      tickFormatter={v => `W${v}`}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="var(--accent-primary)"
                      fill="url(#readGrad)"
                      strokeWidth={2}
                    />
                    {chartData.some(d => d.predicted) && (
                      <Area
                        type="monotone"
                        dataKey="predicted"
                        stroke="var(--cyan)"
                        strokeDasharray="5 5"
                        fill="none"
                        strokeWidth={2}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Message */}
            {result.message && (
              <div style={{
                marginTop: 16, padding: '12px 16px',
                background: 'color-mix(in srgb, var(--emerald) 8%, transparent)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid color-mix(in srgb, var(--emerald) 20%, transparent)',
                fontSize: 13, color: 'var(--emerald)', lineHeight: 1.6,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <Shield size={16} style={{ flexShrink: 0 }} />
                {result.message}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function AIInsights() {
  const [openSections, setOpenSections] = useState({ placement: true });

  const toggle = (id) => setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="page-enter">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="ai-page-icon">
            <Sparkles size={24} />
          </div>
          <div>
            <h1>AI Insights</h1>
            <p>ML-powered career intelligence — placement predictions, role matching & more</p>
          </div>
        </div>
      </div>

      {/* Section Tabs / Quick Nav */}
      <div className="ai-quick-nav" style={{ marginBottom: 24 }}>
        {SECTIONS.map(s => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              className={`ai-quick-btn ${openSections[s.id] ? 'active' : ''}`}
              onClick={() => {
                toggle(s.id);
                document.getElementById(`ai-section-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              style={{ '--section-color': s.color }}
            >
              <Icon size={16} />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sections */}
      <SectionAccordion section={SECTIONS[0]} isOpen={openSections.placement} onToggle={() => toggle('placement')}>
        <PlacementSection />
      </SectionAccordion>

      <SectionAccordion section={SECTIONS[1]} isOpen={openSections.archetype} onToggle={() => toggle('archetype')}>
        <ArchetypeSection />
      </SectionAccordion>

      <SectionAccordion section={SECTIONS[2]} isOpen={openSections.role} onToggle={() => toggle('role')}>
        <RoleSection />
      </SectionAccordion>

      <SectionAccordion section={SECTIONS[3]} isOpen={openSections.health} onToggle={() => toggle('health')}>
        <SkillHealthSection />
      </SectionAccordion>

      <SectionAccordion section={SECTIONS[4]} isOpen={openSections.timeline} onToggle={() => toggle('timeline')}>
        <TimelineSection />
      </SectionAccordion>
    </div>
  );
}
