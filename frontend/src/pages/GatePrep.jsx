import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, BookOpen, Clock, ChevronDown, ChevronUp, Map, FileText,
  BarChart3, ExternalLink, Play, CheckCircle2, XCircle, Timer, Award,
  TrendingUp, Target, Lightbulb, Link2, Calendar, Info, AlertCircle,
  RotateCcw, ArrowRight, Sparkles, BookMarked, Youtube, Check,
} from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { GATE_EXAM_INFO, GATE_PLATFORMS, GATE_BRANCHES, STUDY_PHASES,
  getBranchFromDomain } from '../utils/gateData';

const TABS = [
  { id: 'overview', label: 'Exam Overview', icon: Info },
  { id: 'subjects', label: 'Subjects & Syllabus', icon: BookOpen },
  { id: 'roadmap', label: 'Study Roadmap', icon: Map },
  { id: 'quiz', label: 'Mock Quizzes', icon: FileText },
  { id: 'performance', label: 'Performance', icon: BarChart3 },
  { id: 'resources', label: 'Resources', icon: Link2 },
];

const storageKey = (uid, key) => `gate_${key}_${uid}`;

// ─────────────── TAB BAR ───────────────
const TabBar = ({ active, setActive }) => (
  <div className="gate-tabs">
    {TABS.map(t => (
      <button key={t.id} className={`gate-tab ${active === t.id ? 'active' : ''}`}
        onClick={() => setActive(t.id)}>
        <t.icon size={16} /> {t.label}
      </button>
    ))}
  </div>
);

// ─────────────── EXAM OVERVIEW ───────────────
const ExamOverview = () => {
  const info = GATE_EXAM_INFO;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {/* Exam Banner */}
      <div className="glass-card" style={{ borderTop: '3px solid var(--accent-primary)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', background: 'var(--accent-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={28} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>{info.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{info.fullName} · {info.conductedBy}</p>
          </div>
        </div>
        <div className="grid-3" style={{ gap: 16 }}>
          {[
            { label: 'Duration', value: info.duration, icon: <Clock size={18} />, color: 'var(--cyan)' },
            { label: 'Total Marks', value: info.totalMarks, icon: <Award size={18} />, color: 'var(--emerald)' },
            { label: 'Total Questions', value: info.totalQuestions, icon: <FileText size={18} />, color: 'var(--amber)' },
          ].map((s, i) => (
            <div key={i} className="glass-card glass-card-sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: `color-mix(in srgb, ${s.color} 15%, transparent)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>{s.icon}</div>
              <div><div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div></div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ gap: 20, marginBottom: 24 }}>
        {/* Marking Scheme */}
        <div className="glass-card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={18} color="var(--cyan)" /> Marking Scheme
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '8px 0', color: 'var(--text-muted)', fontWeight: 600 }}>Question Type</th>
              <th style={{ textAlign: 'center', padding: '8px 0', color: 'var(--emerald)' }}>Correct</th>
              <th style={{ textAlign: 'center', padding: '8px 0', color: 'var(--rose)' }}>Wrong</th>
            </tr></thead>
            <tbody>{info.markingScheme.map((m, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>{m.type}</td>
                <td style={{ textAlign: 'center', color: 'var(--emerald)', fontWeight: 600 }}>{m.correct}</td>
                <td style={{ textAlign: 'center', color: m.wrong === '0' ? 'var(--text-muted)' : 'var(--rose)', fontWeight: 600 }}>{m.wrong}</td>
              </tr>))}
            </tbody>
          </table>
        </div>

        {/* Important Dates */}
        <div className="glass-card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={18} color="var(--amber)" /> Important Dates
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {info.importantDates.map((d, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{d.event}</span>
                <span className="badge badge-purple" style={{ fontSize: 11 }}>{d.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Eligibility */}
        <div className="glass-card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={18} color="var(--emerald)" /> Eligibility
          </h3>
          {info.eligibility.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
              <ArrowRight size={14} style={{ color: 'var(--emerald)', marginTop: 2, flexShrink: 0 }} /> {e}
            </div>
          ))}
        </div>
        {/* Benefits */}
        <div className="glass-card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={18} color="var(--accent-primary)" /> Benefits of GATE
          </h3>
          {info.benefits.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
              <Sparkles size={14} style={{ color: 'var(--accent-tertiary)', marginTop: 2, flexShrink: 0 }} /> {b}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ─────────────── SUBJECTS & SYLLABUS ───────────────
const SubjectsView = ({ subjects }) => {
  const [expanded, setExpanded] = useState(null);
  const sorted = [...subjects].sort((a, b) => b.weightage - a.weightage);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ marginBottom: 20, padding: '12px 16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)',
        fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Info size={14} /> Subjects sorted by weightage. Click to expand syllabus & recommended books.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sorted.map((sub, i) => {
          const isOpen = expanded === sub.id;
          return (
            <motion.div key={sub.id} className="glass-card" initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              style={{ cursor: 'pointer', padding: isOpen ? 24 : 16 }}>
              <div onClick={() => setExpanded(isOpen ? null : sub.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 24 }}>{sub.icon}</span>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600 }}>{sub.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                    <div style={{ flex: 1, maxWidth: 200, height: 6, background: 'var(--bg-tertiary)', borderRadius: 3 }}>
                      <div style={{ width: `${sub.weightage * 4}%`, height: '100%', background: sub.color, borderRadius: 3,
                        transition: 'width 0.5s' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: sub.color }}>{sub.weightage}%</span>
                  </div>
                </div>
                {isOpen ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
              </div>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                      <h5 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>📝 Topics</h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                        {sub.topics.map((t, j) => <span key={j} className="badge badge-purple" style={{ fontSize: 11 }}>{t}</span>)}
                      </div>
                      <h5 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>📚 Recommended Books</h5>
                      {sub.books.map((b, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '8px 12px',
                          background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
                          <BookMarked size={14} style={{ color: 'var(--amber)', flexShrink: 0 }} />
                          <span style={{ color: 'var(--text-secondary)' }}><strong>{b.name}</strong> — {b.author}</span>
                        </div>
                      ))}
                      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                        ⏱️ Recommended study time: <strong>{sub.studyWeeks} weeks</strong> · Phase {sub.phase}: {STUDY_PHASES[sub.phase - 1]?.name}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ─────────────── STUDY ROADMAP ───────────────
const StudyRoadmap = ({ subjects }) => {
  const [months, setMonths] = useState(6);
  const scale = months / 6;
  const phases = STUDY_PHASES.map(p => ({
    ...p, subjects: subjects.filter(s => s.phase === p.id).sort((a, b) => a.order - b.order),
  }));
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="glass-card" style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>
          Total Duration: <span style={{ color: 'var(--accent-primary)' }}>{months} months</span>
        </label>
        <input type="range" min={3} max={12} value={months} onChange={e => setMonths(+e.target.value)}
          style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
          <span>3 months (intensive)</span><span>12 months (relaxed)</span>
        </div>
      </div>

      <div className="roadmap-timeline">
        {phases.map((phase, pi) => {
          let weekStart = phases.slice(0, pi).reduce((s, p) => s + p.subjects.reduce((a, sub) => a + sub.studyWeeks, 0), 0);
          return (
            <div key={phase.id}>
              <motion.div className="roadmap-phase" initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }} transition={{ delay: pi * 0.15 }}>
                <div className="roadmap-dot" style={{ background: phase.color, boxShadow: `0 0 12px ${phase.color}40` }} />
                <div className="glass-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span className="badge" style={{ background: `${phase.color}22`, color: phase.color, fontSize: 11 }}>
                      Phase {phase.id}
                    </span>
                    <h4 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{phase.name}</h4>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{phase.description}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {phase.subjects.map(sub => {
                      const scaledWeeks = Math.max(1, Math.round(sub.studyWeeks * scale));
                      weekStart += scaledWeeks;
                      return (
                        <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 14px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)',
                          borderLeft: `3px solid ${sub.color}` }}>
                          <span style={{ fontSize: 18 }}>{sub.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{sub.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              {scaledWeeks} weeks · ~{Math.round(scaledWeeks * 7 * 2.5)} hours total
                            </div>
                          </div>
                          <span className="badge badge-cyan" style={{ fontSize: 10 }}>
                            Week {weekStart - scaledWeeks + 1}-{weekStart}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ─────────────── MOCK QUIZ ───────────────
const QUIZ_TIME_PER_Q = 45; // seconds

const MockQuiz = ({ subjects, uid }) => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [phase, setPhase] = useState('select'); // select | active | result
  const [showExplanation, setShowExplanation] = useState({});

  const quizSubjects = subjects.filter(s => s.questions && s.questions.length > 0);
  const questions = selectedSubject?.questions || [];

  useEffect(() => {
    if (phase !== 'active') return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const startQuiz = (sub) => {
    setSelectedSubject(sub);
    setQIdx(0);
    setAnswers({});
    setTimeLeft(sub.questions.length * QUIZ_TIME_PER_Q);
    setPhase('active');
    setShowExplanation({});
  };

  const handleSubmit = useCallback(() => {
    if (!selectedSubject) return;
    const qs = selectedSubject.questions;
    let score = 0;
    qs.forEach((q, i) => { if (answers[i] === q.ans) score++; });
    const result = {
      subject: selectedSubject.name,
      subjectId: selectedSubject.id,
      score, total: qs.length,
      pct: Math.round((score / qs.length) * 100),
      date: new Date().toISOString(),
    };
    // Save to localStorage
    const key = storageKey(uid, 'quiz_history');
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    history.push(result);
    localStorage.setItem(key, JSON.stringify(history));
    setPhase('result');
  }, [selectedSubject, answers, uid]);

  if (phase === 'select') {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ marginBottom: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          Select a subject to start a timed mock quiz. Results are saved to track your progress.
        </div>
        <div className="grid-3" style={{ gap: 16 }}>
          {quizSubjects.map((sub) => (
            <motion.div key={sub.id} className="glass-card" whileHover={{ scale: 1.02 }}
              style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => startQuiz(sub)}>
              <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>{sub.icon}</span>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{sub.name}</h4>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub.questions.length} questions</span>
              <div style={{ marginTop: 12 }}>
                <button className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <Play size={14} /> Start Quiz
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (phase === 'active') {
    const q = questions[qIdx];
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Timer & Progress */}
        <div className="glass-card" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedSubject.icon} {selectedSubject.name}</span>
            <span className="badge badge-purple">Q {qIdx + 1}/{questions.length}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: timeLeft < 30 ? 'var(--rose)' : 'var(--text-secondary)',
            fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-display)' }}>
            <Timer size={18} /> {mins}:{secs.toString().padStart(2, '0')}
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, marginBottom: 24 }}>
          <motion.div animate={{ width: `${((qIdx + 1) / questions.length) * 100}%` }}
            style={{ height: '100%', background: 'var(--accent-primary)', borderRadius: 2 }} />
        </div>
        {/* Question */}
        <div className="glass-card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, lineHeight: 1.6 }}>{q.q}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q.opts.map((opt, oi) => (
              <div key={oi} className={`gate-quiz-option ${answers[qIdx] === oi ? 'selected' : ''}`}
                onClick={() => setAnswers(p => ({ ...p, [qIdx]: oi }))}>
                <span className="gate-quiz-letter">{String.fromCharCode(65 + oi)}</span> {opt}
              </div>
            ))}
          </div>
        </div>
        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" disabled={qIdx === 0} onClick={() => setQIdx(i => i - 1)}>← Previous</button>
          {qIdx < questions.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setQIdx(i => i + 1)}>Next →</button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit} style={{ background: 'var(--emerald)' }}>
              <CheckCircle2 size={16} /> Submit Quiz
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // RESULT
  const qs = questions;
  let score = 0;
  qs.forEach((q, i) => { if (answers[i] === q.ans) score++; });
  const pct = Math.round((score / qs.length) * 100);
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <div className="glass-card" style={{ textAlign: 'center', marginBottom: 24, borderTop: `3px solid ${pct >= 70 ? 'var(--emerald)' : pct >= 40 ? 'var(--amber)' : 'var(--rose)'}` }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{pct >= 70 ? '🎉' : pct >= 40 ? '💪' : '📚'}</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
          color: pct >= 70 ? 'var(--emerald)' : pct >= 40 ? 'var(--amber)' : 'var(--rose)' }}>
          {score}/{qs.length} Correct · {pct}%
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>
          {pct >= 70 ? 'Excellent! Keep it up!' : pct >= 40 ? 'Good effort. Review weak topics.' : 'Needs more practice. Review the explanations below.'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={() => { setPhase('select'); setSelectedSubject(null); }}>
            <RotateCcw size={14} /> Try Another Subject
          </button>
          <button className="btn btn-primary" onClick={() => startQuiz(selectedSubject)}>
            <Play size={14} /> Retry This Quiz
          </button>
        </div>
      </div>
      {/* Detailed Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {qs.map((q, i) => {
          const correct = answers[i] === q.ans;
          return (
            <div key={i} className="glass-card" style={{ padding: 16, borderLeft: `3px solid ${correct ? 'var(--emerald)' : 'var(--rose)'}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                {correct ? <CheckCircle2 size={18} color="var(--emerald)" style={{ flexShrink: 0, marginTop: 2 }} />
                  : <XCircle size={18} color="var(--rose)" style={{ flexShrink: 0, marginTop: 2 }} />}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Q{i + 1}: {q.q}</p>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Your answer: <strong style={{ color: correct ? 'var(--emerald)' : 'var(--rose)' }}>
                      {answers[i] !== undefined ? q.opts[answers[i]] : 'Not answered'}</strong>
                    {!correct && <> · Correct: <strong style={{ color: 'var(--emerald)' }}>{q.opts[q.ans]}</strong></>}
                  </div>
                  <button className="btn btn-ghost btn-sm" style={{ padding: '2px 8px', fontSize: 11 }}
                    onClick={() => setShowExplanation(p => ({ ...p, [i]: !p[i] }))}>
                    {showExplanation[i] ? 'Hide' : 'Show'} Explanation
                  </button>
                  {showExplanation[i] && (
                    <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)',
                      fontSize: 12, color: 'var(--text-secondary)', borderLeft: '2px solid var(--cyan)' }}>
                      💡 {q.exp}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ─────────────── PERFORMANCE ───────────────
const PerformanceView = ({ uid, subjects }) => {
  const key = storageKey(uid, 'quiz_history');
  const history = JSON.parse(localStorage.getItem(key) || '[]');

  if (history.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: 48 }}>
          <BarChart3 size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No Data Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Take some mock quizzes to see your performance analytics here.</p>
        </div>
      </motion.div>
    );
  }

  // Score trend
  const trendData = history.map((h, i) => ({
    name: `#${i + 1}`,
    score: h.pct,
    subject: h.subject.split(' ').slice(0, 2).join(' '),
  }));

  // Subject averages
  const subjectMap = {};
  history.forEach(h => {
    if (!subjectMap[h.subjectId]) subjectMap[h.subjectId] = { scores: [], name: h.subject };
    subjectMap[h.subjectId].scores.push(h.pct);
  });
  const subjectAvg = Object.entries(subjectMap).map(([id, data]) => ({
    subject: data.name.length > 15 ? data.name.substring(0, 15) + '...' : data.name,
    avg: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
    attempts: data.scores.length,
    fullName: data.name,
  }));

  // Radar data
  const radarData = subjectAvg.map(s => ({ subject: s.subject, score: s.avg, fullMark: 100 }));

  // Predicted score
  const recentScores = history.slice(-5).map(h => h.pct);
  const avgRecent = Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length);
  const predictedGate = Math.round(avgRecent * 0.85); // conservative estimate

  // Weak & strong subjects
  const weak = subjectAvg.filter(s => s.avg < 50).sort((a, b) => a.avg - b.avg);
  const strong = subjectAvg.filter(s => s.avg >= 50).sort((a, b) => b.avg - a.avg);

  const barColors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#ec4899', '#14b8a6'];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {/* Summary Stats */}
      <div className="grid-4" style={{ gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Quizzes Taken', value: history.length, icon: <FileText size={20} />, color: 'var(--accent-primary)' },
          { label: 'Average Score', value: `${Math.round(history.reduce((a, h) => a + h.pct, 0) / history.length)}%`, icon: <Target size={20} />, color: 'var(--cyan)' },
          { label: 'Best Score', value: `${Math.max(...history.map(h => h.pct))}%`, icon: <Award size={20} />, color: 'var(--emerald)' },
          { label: 'Predicted GATE', value: `~${predictedGate}/100`, icon: <TrendingUp size={20} />, color: 'var(--amber)' },
        ].map((s, i) => (
          <div key={i} className="glass-card glass-card-sm" style={{ textAlign: 'center' }}>
            <div style={{ color: s.color, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 20, marginBottom: 24 }}>
        {/* Score Trend */}
        <div className="glass-card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} color="var(--cyan)" /> Score Trend
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke="var(--accent-primary)" strokeWidth={2} dot={{ fill: 'var(--accent-primary)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject-wise Average */}
        <div className="glass-card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={18} color="var(--emerald)" /> Subject Averages
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={subjectAvg} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis dataKey="subject" type="category" width={120} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
                {subjectAvg.map((_, i) => <Cell key={i} fill={barColors[i % barColors.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar + Suggestions */}
      <div className="grid-2" style={{ gap: 20 }}>
        {radarData.length >= 3 && (
          <div className="glass-card">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={18} color="var(--accent-primary)" /> Strength Map
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar dataKey="score" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="glass-card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lightbulb size={18} color="var(--amber)" /> AI Suggestions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {weak.length > 0 && (
              <div style={{ padding: 12, background: 'rgba(244,63,94,0.06)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--rose)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--rose)', marginBottom: 6 }}>⚠️ Weak Areas — Focus Here</div>
                {weak.map((w, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    • <strong>{w.fullName}</strong> — avg {w.avg}% ({w.attempts} attempt{w.attempts > 1 ? 's' : ''})
                  </div>
                ))}
              </div>
            )}
            {strong.length > 0 && (
              <div style={{ padding: 12, background: 'rgba(16,185,129,0.06)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--emerald)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--emerald)', marginBottom: 6 }}>✅ Strong Areas</div>
                {strong.map((s, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    • <strong>{s.fullName}</strong> — avg {s.avg}%
                  </div>
                ))}
              </div>
            )}
            <div style={{ padding: 12, background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--cyan)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cyan)', marginBottom: 6 }}>💡 Recommendations</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {avgRecent >= 70
                  ? '• Great performance! Focus on maintaining consistency and attempt full-length mocks.'
                  : avgRecent >= 40
                  ? '• Revise weak subjects daily. Solve previous year GATE questions for each topic.'
                  : '• Strengthen fundamentals first. Watch NPTEL lectures for weak subjects before attempting more quizzes.'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
                • Predicted GATE score: <strong style={{ color: 'var(--accent-primary)' }}>~{predictedGate} marks</strong> (based on recent {recentScores.length} attempts)
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─────────────── RESOURCES ───────────────
const ResourcesView = ({ branch }) => {
  const branchData = GATE_BRANCHES[branch];
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {/* Platforms */}
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, fontFamily: 'var(--font-display)' }}>
        🎓 Learning Platforms
      </h3>
      <div className="grid-2" style={{ gap: 16, marginBottom: 32 }}>
        {GATE_PLATFORMS.map((p, i) => (
          <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
            className="glass-card" style={{ textDecoration: 'none', color: 'var(--text-primary)', display: 'flex', gap: 14, alignItems: 'center' }}>
            <span style={{ fontSize: 28 }}>{p.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{p.desc}</div>
            </div>
            <span className={`badge ${p.type === 'Free' ? 'badge-emerald' : p.type === 'Paid' ? 'badge-rose' : 'badge-amber'}`}
              style={{ fontSize: 10 }}>{p.type}</span>
          </a>
        ))}
      </div>

      {/* YouTube */}
      {branchData?.youtubeChannels?.length > 0 && (
        <>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, fontFamily: 'var(--font-display)' }}>
            📺 YouTube Channels
          </h3>
          <div className="grid-3" style={{ gap: 16, marginBottom: 32 }}>
            {branchData.youtubeChannels.map((ch, i) => (
              <a key={i} href={ch.url} target="_blank" rel="noopener noreferrer"
                className="glass-card glass-card-sm" style={{ textDecoration: 'none', color: 'var(--text-primary)', textAlign: 'center' }}>
                <Youtube size={28} color="#ff0000" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{ch.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ch.desc}</div>
              </a>
            ))}
          </div>
        </>
      )}

      {/* Quick PYQ Links */}
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, fontFamily: 'var(--font-display)' }}>📄 Previous Year Papers</h3>
      <div className="glass-card">
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
          Solving previous year GATE papers is the most effective strategy. Access them on:
        </p>
        {[
          { name: 'GATE Overflow — Community Solutions', url: 'https://gateoverflow.in/' },
          { name: 'GATE Official Website — Past Papers', url: 'https://gate2025.iitr.ac.in/' },
          { name: 'GeeksforGeeks — Year-wise Solutions', url: 'https://www.geeksforgeeks.org/gate-cs-notes-gq/' },
        ].map((link, i) => (
          <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--bg-glass)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13, marginBottom: 8 }}>
            <ExternalLink size={14} style={{ color: 'var(--accent-tertiary)', flexShrink: 0 }} />
            {link.name}
          </a>
        ))}
      </div>
    </motion.div>
  );
};

// ─────────────── MAIN COMPONENT ───────────────
export default function GatePrep() {
  const { user } = useAuth();
  const uid = user?.id || 'anon';
  const detectedBranch = getBranchFromDomain(user?.domain);
  const [branch, setBranch] = useState(detectedBranch);
  const [activeTab, setActiveTab] = useState('overview');

  const branchData = GATE_BRANCHES[branch];
  const subjects = branchData?.subjects || [];
  const branchOptions = Object.entries(GATE_BRANCHES).map(([code, data]) => ({ code, name: data.name }));

  return (
    <div>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <GraduationCap size={36} color="var(--accent-primary)" /> GATE Preparation
        </h1>
        <p>Comprehensive GATE prep — syllabus, roadmap, quizzes, analytics & resources</p>
      </div>

      {/* Branch Selector */}
      <div style={{ maxWidth: 400, margin: '0 auto 24px', textAlign: 'center' }}>
        <select className="select" value={branch} onChange={e => setBranch(e.target.value)}
          style={{ textAlign: 'center', fontWeight: 600 }}>
          {branchOptions.map(b => (
            <option key={b.code} value={b.code}>GATE {b.code} — {b.name}</option>
          ))}
        </select>
      </div>

      <TabBar active={activeTab} setActive={setActiveTab} />

      <div style={{ marginTop: 24 }}>
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && <ExamOverview key="overview" />}
          {activeTab === 'subjects' && <SubjectsView key="subjects" subjects={subjects} />}
          {activeTab === 'roadmap' && <StudyRoadmap key="roadmap" subjects={subjects} />}
          {activeTab === 'quiz' && <MockQuiz key="quiz" subjects={subjects} uid={uid} />}
          {activeTab === 'performance' && <PerformanceView key="performance" uid={uid} subjects={subjects} />}
          {activeTab === 'resources' && <ResourcesView key="resources" branch={branch} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
