import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getDomainData } from '../utils/domainData';
import {
  ArrowRightLeft, Plus, X, Sparkles, AlertTriangle, CheckCircle,
  OctagonX, Clock, TrendingUp, DollarSign, Target, Zap, Brain,
  ChevronRight, Flame, ShieldAlert,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const VERDICT_CONFIG = {
  GO: {
    icon: CheckCircle, color: 'var(--emerald)', bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.3)', label: '✅ GO — Make the switch',
  },
  CAUTION: {
    icon: AlertTriangle, color: 'var(--amber)', bg: 'rgba(251,191,36,0.08)',
    border: 'rgba(251,191,36,0.3)', label: '⚠️ CAUTION — Proceed carefully',
  },
  STOP: {
    icon: OctagonX, color: 'var(--rose)', bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.3)', label: '🛑 STOP — Reconsider this path',
  },
};

const PRIORITY_COLORS = {
  critical: { bg: 'rgba(239,68,68,0.1)', color: 'var(--rose)', border: 'rgba(239,68,68,0.3)' },
  important: { bg: 'rgba(251,191,36,0.1)', color: 'var(--amber)', border: 'rgba(251,191,36,0.3)' },
  'nice-to-have': { bg: 'rgba(99,102,241,0.1)', color: 'var(--primary)', border: 'rgba(99,102,241,0.3)' },
};

export default function DomainSwitch() {
  const { user } = useAuth();
  const domainData = getDomainData(user?.domain);
  const roleSuggestions = (domainData.targetRoles || []).map((role) => role.name);
  const domainCommonSkills = Array.from(new Set([
    ...(domainData.topSkills || []).map((skill) => skill.name),
    ...(domainData.targetRoles || []).flatMap((role) => role.suggestedSkills || []),
  ]));

  const [formData, setFormData] = useState({
    current_role: '',
    target_role: ''
  });
  const [yearsExp, setYearsExp] = useState(0);
  const [reason, setReason] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const addSkill = (skill) => {
    const s = skill.trim();
    if (s && !skills.includes(s)) {
      setSkills(prev => [...prev, s]);
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  const handleAnalyze = async () => {
    if (!formData.current_role.trim() || !formData.target_role.trim()) {
      setError('Please fill in both your current role and target role.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const token = localStorage.getItem('vm_token');
      const res = await axios.post(`${API}/api/domain-switch/analyze`, {
        current_role: formData.current_role,
        current_skills: skills,
        years_experience: yearsExp,
        target_role: formData.target_role,
        reason,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
    }
    setLoading(false);
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  const vc = result ? (VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG.CAUTION) : null;

  return (
    <div>
      <div className="page-header">
        <h1><ArrowRightLeft size={28} style={{ verticalAlign: 'middle', marginRight: 12 }} />Domain Switch</h1>
        <p>Brutally honest career transition analysis — no sugar coating</p>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="glass-card" style={{ maxWidth: 720, margin: '0 auto', padding: 32 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                Tell us about your switch
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
                We'll give you the unfiltered truth about whether this career move makes sense.
              </p>

              {error && (
                <div style={{ padding: '10px 16px', marginBottom: 20, borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--rose)', fontSize: 14 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                {/* Current Role */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Where you are now
                  </label>
                  <input
                    type="text" value={formData.current_role} onChange={e => setFormData({ ...formData, current_role: e.target.value })}
                    placeholder={`e.g. ${roleSuggestions[0] || 'Student'}`}
                    required
                    list="domain-role-suggestions"
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 8,
                      border: '1px solid var(--border)', background: 'var(--bg-glass)',
                      color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                    }}
                  />
                </div>

                {/* Target Role */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Where you want to go
                  </label>
                  <input
                    type="text"
                    value={formData.target_role}
                    onChange={e => setFormData({ ...formData, target_role: e.target.value })}
                    placeholder={`e.g. ${roleSuggestions[1] || roleSuggestions[0] || 'Target Role'}`}
                    list="domain-role-suggestions"
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 8,
                      border: '1px solid var(--border)', background: 'var(--bg-glass)',
                      color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                    }}
                  />
                </div>
              </div>
              <datalist id="domain-role-suggestions">
                {roleSuggestions.map((role) => (
                  <option key={role} value={role} />
                ))}
              </datalist>

              {/* Years Experience */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Years of experience
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[0, 1, 2, 3, 5, 8, 10].map(y => (
                    <button key={y} onClick={() => setYearsExp(y)} style={{
                      padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      background: yearsExp === y ? 'var(--primary)' : 'var(--bg-glass)',
                      color: yearsExp === y ? '#fff' : 'var(--text-secondary)',
                      border: `1px solid ${yearsExp === y ? 'var(--primary)' : 'var(--border)'}`,
                      transition: 'all 0.2s',
                    }}>
                      {y === 0 ? 'Fresh' : y === 10 ? '10+' : `${y} yr`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills Input */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Your current skills
                </label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input
                    type="text" value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSkill(skillInput)}
                    placeholder="Type a skill and press Enter"
                    style={{
                      flex: 1, padding: '10px 14px', borderRadius: 8,
                      border: '1px solid var(--border)', background: 'var(--bg-glass)',
                      color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                    }}
                  />
                  <button onClick={() => addSkill(skillInput)} className="btn btn-secondary" style={{ padding: '10px 16px' }}>
                    <Plus size={16} />
                  </button>
                </div>

                {/* Selected Skills */}
                {skills.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {skills.map(s => (
                      <span key={s} style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                        background: 'rgba(99,102,241,0.1)', color: 'var(--primary)',
                        border: '1px solid rgba(99,102,241,0.2)',
                      }}>
                        {s}
                        <X size={12} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => removeSkill(s)} />
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick-add skills */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {domainCommonSkills.filter(s => !skills.includes(s)).slice(0, 12).map(s => (
                    <button key={s} onClick={() => addSkill(s)} style={{
                      padding: '3px 8px', borderRadius: 4, fontSize: 11, cursor: 'pointer',
                      background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                      color: 'var(--text-muted)', transition: 'all 0.15s',
                    }}>
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Why do you want to switch? (optional)
                </label>
                <textarea
                  value={reason} onChange={e => setReason(e.target.value)}
                  placeholder="e.g. I'm bored, I want higher pay, I love data..."
                  rows={3}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 8, resize: 'vertical',
                    border: '1px solid var(--border)', background: 'var(--bg-glass)',
                    color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={handleAnalyze}
                disabled={loading || !formData.current_role.trim() || !formData.target_role.trim()}
                style={{ width: '100%', padding: 16, fontSize: 16 }}
              >
                {loading ? (
                  <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Analyzing your switch...</>
                ) : (
                  <><Zap size={18} /> Get the Brutal Truth</>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>

            {/* ── Verdict Banner ── */}
            <div className="glass-card" style={{
              padding: '28px 32px', marginBottom: 24, textAlign: 'center',
              background: vc.bg, borderLeft: `5px solid ${vc.color}`,
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)', color: vc.color, marginBottom: 8 }}>
                {vc.label}
              </div>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
                {result.verdict_summary}
              </p>
            </div>

            {/* ── Harsh Truth Banner ── */}
            {result.harsh_truth && (
              <div className="glass-card" style={{
                padding: '16px 24px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 14,
                background: 'rgba(239,68,68,0.04)', borderLeft: '4px solid var(--rose)',
              }}>
                <ShieldAlert size={22} style={{ color: 'var(--rose)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--rose)', marginBottom: 4 }}>The Harsh Truth</div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{result.harsh_truth}</p>
                </div>
              </div>
            )}

            {/* ── Reality Check ── */}
            <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Brain size={18} style={{ color: 'var(--primary)' }} />Reality Check
              </h3>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.reality_check}</p>
            </div>

            {/* ── Stats Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              <div className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
                <DollarSign size={20} style={{ color: 'var(--emerald)', marginBottom: 6 }} />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Salary Impact</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{result.salary_impact}</div>
              </div>
              <div className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
                <Clock size={20} style={{ color: 'var(--amber)', marginBottom: 6 }} />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Timeline</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{result.timeline}</div>
              </div>
              <div className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
                <TrendingUp size={20} style={{ color: 'var(--primary)', marginBottom: 6 }} />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Market Demand</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{result.market_demand}</div>
              </div>
            </div>

            {/* ── Pros / Cons ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div className="glass-card" style={{ padding: 24, borderLeft: '4px solid var(--emerald)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--emerald)', fontWeight: 700, marginBottom: 16 }}>
                  <CheckCircle size={18} /> Pros
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(result.pros || []).map((p, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <ChevronRight size={14} style={{ color: 'var(--emerald)', marginTop: 3, flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card" style={{ padding: 24, borderLeft: '4px solid var(--rose)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--rose)', fontWeight: 700, marginBottom: 16 }}>
                  <OctagonX size={18} /> Cons
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(result.cons || []).map((c, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <ChevronRight size={14} style={{ color: 'var(--rose)', marginTop: 3, flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── Skill Gap Analysis ── */}
            {result.skill_gaps && result.skill_gaps.length > 0 && (
              <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Target size={18} style={{ color: 'var(--amber)' }} /> Skill Gaps to Bridge
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.skill_gaps.map((sg, i) => {
                    const pc = PRIORITY_COLORS[sg.priority] || PRIORITY_COLORS['nice-to-have'];
                    return (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 16px', borderRadius: 8, background: 'var(--bg-glass)',
                        border: '1px solid var(--border)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                            background: pc.bg, color: pc.color, border: `1px solid ${pc.border}`,
                            textTransform: 'uppercase',
                          }}>
                            {sg.priority}
                          </span>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{sg.skill}</span>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} /> {sg.time_to_learn}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Transferable Skills ── */}
            {result.transferable_skills && result.transferable_skills.length > 0 && (
              <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Flame size={18} style={{ color: 'var(--emerald)' }} /> Skills That Transfer
                </h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {result.transferable_skills.map((s, i) => (
                    <span key={i} style={{
                      padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                      background: 'rgba(16,185,129,0.1)', color: 'var(--emerald)',
                      border: '1px solid rgba(16,185,129,0.2)',
                    }}>
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Action Plan ── */}
            {result.action_plan && result.action_plan.length > 0 && (
              <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap size={18} style={{ color: 'var(--primary)' }} /> Action Plan
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {result.action_plan.map((step, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 14, alignItems: 'flex-start',
                      padding: '14px 16px', borderRadius: 8, background: 'var(--bg-glass)',
                      border: '1px solid var(--border)',
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: '#fff',
                      }}>
                        {i + 1}
                      </div>
                      <span style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, paddingTop: 3 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button className="btn btn-secondary" onClick={reset} style={{ padding: '14px 24px', fontSize: 15 }}>
              <ArrowRightLeft size={16} /> Analyze Another Switch
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
