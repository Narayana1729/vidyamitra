import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BrainCircuit, Loader2, Sparkles, Target, TrendingUp, TrendingDown,
  Minus, AlertCircle, RefreshCw, CheckCircle2, Zap, Shield,
  Clock, Activity
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, ReferenceLine
} from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* ───────────────────── helpers ───────────────────── */

const verdictColor = (v) =>
  v === 'High' ? 'var(--emerald)' : v === 'Moderate' ? 'var(--amber)' : 'var(--rose)';

const trendIcon = (t) =>
  t === 'growing' ? <TrendingUp size={14} /> :
  t === 'declining' ? <TrendingDown size={14} /> :
  <Minus size={14} />;

const trendColor = (t) =>
  t === 'growing' ? 'var(--emerald)' : t === 'declining' ? 'var(--rose)' : 'var(--text-muted)';

const healthColor = (h) =>
  h === 'excellent' ? 'var(--emerald)' :
  h === 'good' ? 'var(--cyan)' :
  h === 'moderate' ? 'var(--amber)' : 'var(--rose)';

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
});

/* ───────────────────── custom tooltip ───────────────────── */

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: 'flex', gap: 6 }}>
          <span>{p.name}:</span><strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function AIInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('');

  /* ── 1. Fetch cached insights on mount ── */
  useEffect(() => {
    const fetchCached = async () => {
      try {
        const token = localStorage.getItem('vm_token');
        if (!token) { setLoading(false); return; }
        const res = await axios.get(`${API}/api/ml/cached-insights`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.cached && res.data.data) setInsights(res.data.data);
      } catch { /* no cache */ }
      setLoading(false);
    };
    fetchCached();
  }, []);

  /* ── 2. Generate fresh insights ── */
  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setError(null);

    const token = localStorage.getItem('vm_token');
    if (!token) { setError('You must be logged in.'); setGenerating(false); return; }
    const headers = { Authorization: `Bearer ${token}` };

    try {
      /* ── Fetch real student data from dashboard + coding profile ── */
      setStep('Gathering your profile data...');
      let profile = {
        cgpa: 7.0, leetcode_count: 0, certifications_count: 0,
        projects_count: 0, internships_count: 0, backlogs: 0,
        github_repos: 0, hackathons_count: 0, skills_count: 0,
        ats_score: 50, interview_score: 50,
        branch: user?.domain || 'Software Engineering / CS / IT',
      };
      let userSkills = [];
      let weeklyScores = [];

      // Fetch dashboard summary for stats
      try {
        const dashRes = await axios.get(`${API}/api/dashboard/summary`, { headers, timeout: 8000 });
        const stats = dashRes.data?.stats || {};
        const history = dashRes.data?.weekly_progress || [];
        profile.ats_score = stats.resume_score || profile.ats_score;
        profile.interview_score = stats.average_interview_score || profile.interview_score;
        profile.skills_count = stats.skill_count || profile.skills_count;
        // Build weekly scores from real history
        if (history.length > 0) {
          weeklyScores = history.slice(-4).map((w, i) => ({
            week: i + 1,
            resume_score: w.resume_score ?? 50,
            skill_pct: w.skill_match ?? 40,
            interview_score: w.interview_score ?? 45,
          }));
        }
      } catch { /* dashboard unavailable, use defaults */ }

      // Fetch coding profile for leetcode/github data
      try {
        const codingRes = await axios.get(`${API}/api/coding-profile`, { headers, timeout: 8000 });
        const cp = codingRes.data || {};
        profile.leetcode_count = cp.leetcode?.total_solved || cp.total_problems_solved || 0;
        profile.github_repos = cp.github?.public_repos || 0;
        profile.hackathons_count = cp.hackathons_count || profile.hackathons_count;
        // Collect skills from platforms
        if (cp.skills && Array.isArray(cp.skills)) userSkills = cp.skills;
      } catch { /* coding profile unavailable */ }

      // Fetch skill analyses for user skills
      try {
        const skillAnalysisRes = await axios.get(`${API}/api/dashboard/summary`, { headers, timeout: 5000 });
        const recentSkills = skillAnalysisRes.data?.recent_skills || [];
        if (recentSkills.length > 0 && userSkills.length === 0) {
          userSkills = recentSkills;
        }
      } catch { /* non-critical */ }

      // Fallback defaults
      if (userSkills.length === 0) {
        userSkills = ['Python', 'SQL', 'Git'];
      }
      if (weeklyScores.length === 0) {
        weeklyScores = [
          { week: 1, resume_score: 45, skill_pct: 35, interview_score: 40 },
          { week: 2, resume_score: 52, skill_pct: 42, interview_score: 48 },
          { week: 3, resume_score: 60, skill_pct: 50, interview_score: 55 },
          { week: 4, resume_score: 65, skill_pct: 58, interview_score: 62 },
        ];
      }

      setStep('Running Placement Prediction...');
      const placementRes = await axios.post(`${API}/api/ml/predict-placement`, profile, { headers });

      setStep('Classifying Career Archetype...');
      const { branch, interview_score, backlogs, ...archetypePayload } = profile;
      const archetypeRes = await axios.post(`${API}/api/ml/career-archetype`, archetypePayload, { headers });

      setStep('Predicting Best-Fit Role...');
      const roleRes = await axios.post(`${API}/api/ml/predict-role`, {
        skills_text: userSkills.join(', '),
      }, { headers });

      setStep('Analyzing Skill Portfolio...');
      const skillRes = await axios.post(`${API}/api/ml/skill-health`, {
        skills: userSkills.slice(0, 8), months_ago: 6,
      }, { headers });

      setStep('Projecting Readiness Timeline...');
      const timelineRes = await axios.post(`${API}/api/ml/readiness-timeline`, {
        weekly_scores: weeklyScores,
      }, { headers });

      const newInsights = {
        placement_probability: placementRes.data.placement_probability,
        verdict: placementRes.data.verdict,
        top_factors: placementRes.data.top_factors || [],
        cluster_id: archetypeRes.data.cluster_id,
        archetype: archetypeRes.data.archetype,
        archetype_emoji: archetypeRes.data.emoji,
        archetype_description: archetypeRes.data.description,
        career_paths: archetypeRes.data.career_paths || [],
        strengths: archetypeRes.data.strengths || [],
        archetype_color: archetypeRes.data.color || 'var(--accent-primary)',
        best_role: roleRes.data.best_match,
        role_confidence: roleRes.data.confidence,
        top_matches: roleRes.data.top_matches || [],
        skill_health: skillRes.data || {},
        readiness_timeline: timelineRes.data || {},
      };

      setStep('Saving to database...');
      try {
        await axios.post(`${API}/api/ml/save-insights`, newInsights, { headers });
      } catch { /* non-critical */ }

      setInsights(newInsights);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || err.message;
      setError(`ML Pipeline Error: ${detail}`);
    }
    setStep('');
    setGenerating(false);
  }, [user]);


  /* ═══════ LOADING ═══════ */
  if (loading) {
    return (
      <div style={{ padding: 80, textAlign: 'center' }}>
        <Loader2 size={36} className="spin" style={{ color: 'var(--accent-primary)', marginBottom: 16 }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading saved insights...</p>
      </div>
    );
  }

  /* ═══════ EMPTY STATE — GENERATE CTA ═══════ */
  if (!insights) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{
            maxWidth: 560, textAlign: 'center', padding: '48px 40px',
            background: 'var(--bg-glass)', borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)', backdropFilter: 'blur(16px)',
          }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%', margin: '0 auto 28px',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.15))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BrainCircuit size={40} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <h1 style={{ fontSize: 28, fontFamily: 'var(--font-display)', marginBottom: 12 }}>AI Career Intelligence</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
            Run your profile through <strong>5 ML models</strong> — Placement Prediction, Career Archetype,
            Role Classification, Skill Health Analysis and Readiness Timeline.
          </p>
          {error && (
            <div style={{
              padding: '12px 16px', background: 'color-mix(in srgb, var(--rose) 10%, transparent)',
              color: 'var(--rose)', borderRadius: 'var(--radius-md)', marginBottom: 24,
              fontSize: 13, border: '1px solid color-mix(in srgb, var(--rose) 20%, transparent)', textAlign: 'left',
            }}>
              <AlertCircle size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              {error}
            </div>
          )}
          <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}
            style={{ padding: '14px 32px', fontSize: 15, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            {generating
              ? <><Loader2 className="spin" size={18} /> {step || 'Initializing...'}</>
              : <><Sparkles size={18} /> Generate AI Insights</>}
          </button>
        </motion.div>
      </div>
    );
  }

  /* ── extract sub-objects ── */
  const sk = insights.skill_health || {};
  const tl = insights.readiness_timeline || {};
  const topFactors = insights.top_factors || [];
  const topMatches = insights.top_matches || [];
  const careerPaths = insights.career_paths || [];
  const strengths = insights.strengths || [];
  const skillsAnalysis = sk.skills_analysis || [];
  const fullChart = tl.full_chart || tl.history || [];

  const skillBarColor = (rel) =>
    rel >= 85 ? '#10b981' : rel >= 70 ? '#06b6d4' : rel >= 50 ? '#f59e0b' : '#f43f5e';


  /* ═══════ FULL DASHBOARD ═══════ */
  return (
    <div style={{ paddingBottom: 60 }}>

      {/* HEADER */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>🧠 AI Career Insights</h1>
          <p>Your personalized career intelligence, powered by 5 ML models</p>
        </div>
        <button className="btn btn-secondary" onClick={handleGenerate} disabled={generating}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          {generating
            ? <><Loader2 className="spin" size={14} /> {step || 'Running...'}</>
            : <><RefreshCw size={14} /> Regenerate</>}
        </button>
      </div>

      {/* ROW 1: Placement + Archetype */}
      <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>

        {/* PLACEMENT */}
        <motion.div className="glass-card" {...fadeUp(0)} style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `color-mix(in srgb, ${verdictColor(insights.verdict)} 12%, transparent)` }}>
              <Target size={20} style={{ color: verdictColor(insights.verdict) }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Placement Prediction</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>GradientBoosting + SHAP</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 56, fontWeight: 800, fontFamily: 'var(--font-display)', color: verdictColor(insights.verdict), lineHeight: 1 }}>
              {insights.placement_probability}%
            </div>
            <div style={{ display: 'inline-block', marginTop: 8, padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              background: `color-mix(in srgb, ${verdictColor(insights.verdict)} 12%, transparent)`, color: verdictColor(insights.verdict) }}>
              {insights.verdict} Chances
            </div>
          </div>
          {topFactors.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>SHAP Impact Factors</div>
              {topFactors.map((f, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', marginBottom: 4, borderRadius: 8, background: 'var(--bg-glass)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f.feature}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: f.direction === 'positive' ? 'var(--emerald)' : 'var(--rose)' }}>
                    {f.direction === 'positive' ? '+' : ''}{f.impact}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ARCHETYPE */}
        <motion.div className="glass-card" {...fadeUp(1)} style={{ padding: 32, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)' }}>
              <Zap size={20} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Career Archetype</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>KMeans Clustering</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 52, marginBottom: 8 }}>{insights.archetype_emoji}</div>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)', color: insights.archetype_color || 'var(--text-primary)' }}>
              {insights.archetype}
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, textAlign: 'center', marginBottom: 20 }}>
            {insights.archetype_description}
          </p>
          {careerPaths.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Recommended Paths</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {careerPaths.map((c, i) => (
                  <span key={i} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{c}</span>
                ))}
              </div>
            </div>
          )}
          {strengths.length > 0 && (
            <div style={{ marginTop: 'auto' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Key Strengths</div>
              {strengths.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--emerald)', flexShrink: 0 }} /> {s}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ROW 2: Role + Skill Health */}
      <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>

        {/* ROLE */}
        <motion.div className="glass-card" {...fadeUp(2)} style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'color-mix(in srgb, var(--cyan) 12%, transparent)' }}>
              <BrainCircuit size={20} style={{ color: 'var(--cyan)' }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Best-Fit Role</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>TF-IDF + RandomForest</div>
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: 12 }}>
            {insights.best_role}
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, color: 'var(--text-muted)' }}>
              <span>Confidence</span>
              <span style={{ fontWeight: 700, color: 'var(--cyan)' }}>{insights.role_confidence}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--bg-glass)', borderRadius: 4, overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(insights.role_confidence, 100)}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--cyan))', borderRadius: 4 }} />
            </div>
          </div>
          {topMatches.length > 1 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>Other Matches</div>
              {topMatches.slice(1).map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', marginBottom: 4, borderRadius: 8, background: 'var(--bg-glass)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{m.role}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{m.score}%</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* SKILL HEALTH */}
        <motion.div className="glass-card" {...fadeUp(3)} style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `color-mix(in srgb, ${healthColor(sk.portfolio_health)} 12%, transparent)` }}>
              <Shield size={20} style={{ color: healthColor(sk.portfolio_health) }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skill Portfolio Health</div>
              <div style={{ fontSize: 13, color: healthColor(sk.portfolio_health), fontWeight: 700 }}>{sk.portfolio_health_label || 'N/A'}</div>
            </div>
            {sk.portfolio_relevance_score != null && (
              <div style={{ marginLeft: 'auto', fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)', color: healthColor(sk.portfolio_health) }}>
                {sk.portfolio_relevance_score}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { label: 'Growing', count: sk.growing_count, color: 'var(--emerald)' },
              { label: 'Stable', count: sk.stable_count, color: 'var(--cyan)' },
              { label: 'Declining', count: sk.declining_count, color: 'var(--rose)' },
            ].map((b, i) => (
              <div key={i} style={{ flex: 1, padding: '10px 12px', borderRadius: 10, textAlign: 'center',
                background: `color-mix(in srgb, ${b.color} 8%, transparent)`,
                border: `1px solid color-mix(in srgb, ${b.color} 15%, transparent)` }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: b.color, fontFamily: 'var(--font-display)' }}>{b.count ?? 0}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{b.label}</div>
              </div>
            ))}
          </div>
          {skillsAnalysis.length > 0 && (
            <div style={{ height: 180, marginTop: 8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillsAnalysis} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="skill" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="current_relevance" name="Relevance" radius={[4, 4, 0, 0]}>
                    {skillsAnalysis.map((s, i) => (
                      <Cell key={i} fill={skillBarColor(s.current_relevance)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      {/* ROW 3: Readiness Timeline */}
      {tl.message && (
        <motion.div className="glass-card" {...fadeUp(4)} style={{ padding: 32, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'color-mix(in srgb, var(--amber) 12%, transparent)' }}>
                <Clock size={20} style={{ color: 'var(--amber)' }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Readiness Timeline</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Linear Regression Projection</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {tl.current_readiness != null && (
                <div style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                  background: 'color-mix(in srgb, var(--cyan) 10%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--cyan) 20%, transparent)', color: 'var(--cyan)' }}>
                  Current: {tl.current_readiness}%
                </div>
              )}
              {tl.growth_per_week != null && (
                <div style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                  background: 'color-mix(in srgb, var(--emerald) 10%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--emerald) 20%, transparent)', color: 'var(--emerald)' }}>
                  +{tl.growth_per_week} pts/week
                </div>
              )}
              {tl.weeks_to_ready != null && tl.weeks_to_ready > 0 && (
                <div style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                  background: 'color-mix(in srgb, var(--amber) 10%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--amber) 20%, transparent)', color: 'var(--amber)' }}>
                  ~{tl.weeks_to_ready} weeks to ready
                </div>
              )}
            </div>
          </div>
          <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 20,
            background: 'var(--bg-glass)', border: '1px solid var(--border)',
            fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {tl.message}
          </div>
          {fullChart.length > 0 && (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fullChart} margin={{ top: 8, right: 8, left: -20, bottom: 4 }}>
                  <defs>
                    <linearGradient id="gradScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={tl.target_score || 75} stroke="var(--emerald)" strokeDasharray="6 4"
                    label={{ value: 'Ready', position: 'right', fontSize: 11, fill: 'var(--emerald)' }} />
                  <Area type="monotone" dataKey="score" name="Readiness"
                    stroke="var(--accent-primary)" strokeWidth={2.5} fill="url(#gradScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      )}

      {/* ROW 4: Per-Skill Breakdown */}
      {skillsAnalysis.length > 0 && (
        <motion.div className="glass-card" {...fadeUp(5)} style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Activity size={18} style={{ color: 'var(--accent-primary)' }} />
            <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)' }}>Per-Skill Breakdown</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {skillsAnalysis.map((s, i) => (
              <div key={i} style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{s.skill}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: trendColor(s.trend) }}>
                    {trendIcon(s.trend)} {s.trend}
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-glass)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ height: '100%', borderRadius: 3, width: `${s.current_relevance}%`, background: skillBarColor(s.current_relevance), transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{s.recommendation}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
