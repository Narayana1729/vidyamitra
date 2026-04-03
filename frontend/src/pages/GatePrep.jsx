import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, BookOpen, Clock, ChevronDown, ChevronUp, Map, FileText,
  BarChart3, ExternalLink, Play, CheckCircle2, XCircle, Timer, Award,
  TrendingUp, Target, Lightbulb, Link2, Calendar, Info, AlertCircle,
  RotateCcw, ArrowRight, Sparkles, BookMarked, Youtube, Check, ListOrdered,
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
const StudyRoadmap = ({ subjects, uid }) => {
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey(uid, 'roadmap_prefs'));
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isQuestionnaire, setIsQuestionnaire] = useState(!prefs);
  const [qAnswers, setQAnswers] = useState({
    started: prefs?.started || false,
    completedTopics: prefs?.completedTopics || {},
    topicDays: prefs?.topicDays || {},
    dailyHours: prefs?.dailyHours || 3,
    months: prefs?.months || 6,
    customOrder: prefs?.customOrder || null,
  });
  
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [isCustomOrderMode, setIsCustomOrderMode] = useState(false);
  const [isTimetableView, setIsTimetableView] = useState(false);
  const [expandedPlanners, setExpandedPlanners] = useState({});
  const [swapSource, setSwapSource] = useState(null);
  const [selectedDayResource, setSelectedDayResource] = useState(null);
  const [struckOutDays, setStruckOutDays] = useState({});

  useEffect(() => {
    if (prefs && !prefs.customOrder && subjects?.length > 0) {
      const flat = [...subjects].sort((a, b) => {
        if (a.phase !== b.phase) return a.phase - b.phase;
        return a.order - b.order;
      });
      const newOrder = flat.map(s => s.id);
      setQAnswers(p => ({ ...p, customOrder: newOrder }));
      setPrefs(p => ({ ...p, customOrder: newOrder }));
    }
  }, [subjects, prefs?.customOrder]);
  const performSwap = (phaseId, idx1, idx2, currentSchedule) => {
      const newSchedule = [...currentSchedule];
      const temp = newSchedule[idx1];
      newSchedule[idx1] = newSchedule[idx2];
      newSchedule[idx2] = temp;
      const newOrder = newSchedule.map(item => item.id);
      const newPrefs = {
          ...prefs,
          customPhaseOrders: {
              ...(prefs.customPhaseOrders || {}),
              [phaseId]: newOrder
          }
      };
      setPrefs(newPrefs);
      localStorage.setItem(storageKey(uid, 'roadmap_prefs'), JSON.stringify(newPrefs));
      setSwapSource(null);
  };

  const handleTopicDayChange = (subId, topic, currentVal, delta) => {
    const newVal = Math.max(1, currentVal + delta);
    const newTopicDays = { ...(prefs.topicDays || {}) };
    if (!newTopicDays[subId]) newTopicDays[subId] = {};
    newTopicDays[subId][topic] = newVal;
    
    const updatedPrefs = { ...prefs, topicDays: newTopicDays };
    setPrefs(updatedPrefs);
    setQAnswers(q => ({ ...q, topicDays: newTopicDays }));
    localStorage.setItem(storageKey(uid, 'roadmap_prefs'), JSON.stringify(updatedPrefs));
  };

  const handleSave = () => {
    localStorage.setItem(storageKey(uid, 'roadmap_prefs'), JSON.stringify(qAnswers));
    setPrefs(qAnswers);
    setIsQuestionnaire(false);
  };

  const toggleTopic = (subId, topic, isChecked) => {
    setQAnswers(prev => {
      const current = prev.completedTopics[subId] || [];
      const updated = isChecked 
        ? [...current, topic]
        : current.filter(t => t !== topic);
      return { ...prev, completedTopics: { ...prev.completedTopics, [subId]: updated } };
    });
  };

  const selectAllTopics = (subId, topics, isFull) => {
    setQAnswers(prev => ({
      ...prev,
      completedTopics: {
        ...prev.completedTopics,
        [subId]: isFull ? [] : [...topics]
      }
    }));
  };

  const renderResourceModal = () => {
    if (!selectedDayResource) return null;
    const { sub, topic, globalIdx, id } = selectedDayResource;

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}
        onClick={() => setSelectedDayResource(null)}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="glass-card" style={{ width: '100%', maxWidth: 500, padding: 24, position: 'relative' }}
          onClick={e => e.stopPropagation()}>
          <button onClick={() => setSelectedDayResource(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
             <XCircle size={24} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
             <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', background: `color-mix(in srgb, ${sub.color} 15%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                {sub.icon}
             </div>
             <div>
               <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Day {globalIdx + 1}: {topic}</h3>
               <div style={{ fontSize: 13, color: sub.color, fontWeight: 600 }}>{sub.name}</div>
             </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
             <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 8 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}><Youtube size={16} color="var(--rose)" /> Video Lectures</h4>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Search for top explanations on this specific topic:</p>
                <a href={`https://www.youtube.com/results?search_query=GATE+${encodeURIComponent(sub.name)}+${encodeURIComponent(topic)}`} target="_blank" rel="noreferrer"
                   className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'center' }}>
                   <Play size={14} /> Watch {topic} Lectures
                </a>
             </div>
             
             {sub.books && sub.books.length > 0 && (
                 <div style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 8 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}><BookMarked size={16} color="var(--amber)" /> Recommended Reading</h4>
                    {sub.books.map((b, i) => (
                       <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>• <strong>{b.name}</strong> by {b.author}</div>
                    ))}
                 </div>
             )}
             
             <button className="btn btn-primary" style={{ width: '100%', background: 'var(--emerald)', border: 'none', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 12 }}
                onClick={() => {
                   setStruckOutDays(prev => ({ ...prev, [id]: true }));
                   setSelectedDayResource(null);
                   setTimeout(() => toggleTopic(sub.id, topic, true), 500);
                }}>
                <CheckCircle2 size={18} /> Mark Topic as Completed
             </button>
          </div>
        </motion.div>
      </div>
    );
  };

  if (isQuestionnaire) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ maxWidth: 800, margin: '0 auto', padding: 32 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Map size={24} color="var(--accent-primary)" /> Tailor Your Roadmap
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Question 1 */}
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'block', color: 'var(--text-secondary)' }}>Have you started your GATE preparation?</label>
            <div style={{ display: 'flex', gap: 12, maxWidth: 400 }}>
              {['Yes', 'No'].map(opt => (
                <button key={opt} className={`btn ${qAnswers.started === (opt === 'Yes') ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '10px' }} onClick={() => setQAnswers(p => ({ ...p, started: opt === 'Yes' }))}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
          
          {/* Question 2: Topics Checklist */}
          <AnimatePresence>
            {qAnswers.started && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                <div style={{ marginTop: 8 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'block', color: 'var(--text-secondary)' }}>
                    Which subjects and topics have you completed? Check all that apply:
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 400, overflowY: 'auto', paddingRight: 8 }} className="custom-scrollbar">
                    {subjects.map(sub => {
                      const compCount = qAnswers.completedTopics[sub.id]?.length || 0;
                      const totalCount = sub.topics.length;
                      const isFull = totalCount > 0 && compCount === totalCount;
                      const isOpen = expandedSubject === sub.id;

                      return (
                        <div key={sub.id} className="glass-card" style={{ padding: '12px 16px', background: isFull ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-glass)', border: isFull ? '1px solid var(--emerald)' : '1px solid transparent' }}>
                          <div onClick={() => setExpandedSubject(isOpen ? null : sub.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                            <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                              {isOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                              {sub.icon} {sub.name}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: isFull ? 'var(--emerald)' : (compCount > 0 ? 'var(--amber)' : 'var(--text-muted)') }}>
                                {compCount}/{totalCount} topics {isFull && '✅'}
                            </div>
                          </div>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '2px 8px' }} 
                                      onClick={(e) => { e.stopPropagation(); selectAllTopics(sub.id, sub.topics, isFull); }}>
                                      {isFull ? '# Deselect All' : '+ Select All'}
                                    </button>
                                  </div>
                                  {sub.topics.map(topic => {
                                    const isChecked = qAnswers.completedTopics[sub.id]?.includes(topic) || false;
                                    return (
                                      <label key={topic} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, cursor: 'pointer', color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                          <input type="checkbox" checked={isChecked} onChange={(e) => toggleTopic(sub.id, topic, e.target.checked)} 
                                            style={{ marginTop: 2, accentColor: 'var(--emerald)' }} />
                                          <span style={{ lineHeight: 1.4 }}>{topic}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid-2" style={{ gap: 24 }}>
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block', color: 'var(--text-secondary)' }}>How many hours can you study daily?</label>
              <input type="range" min={1} max={12} value={qAnswers.dailyHours} onChange={e => setQAnswers(p => ({ ...p, dailyHours: +e.target.value }))}
                style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
              <div style={{ color: 'var(--accent-primary)', fontWeight: 700, marginTop: 8, fontSize: 14 }}>{qAnswers.dailyHours} hours/day</div>
            </div>

            <div>
              <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block', color: 'var(--text-secondary)' }}>In how many months do you want to complete the syllabus?</label>
              <input type="range" min={1} max={18} value={qAnswers.months} onChange={e => setQAnswers(p => ({ ...p, months: +e.target.value }))}
                style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
              <div style={{ color: 'var(--accent-primary)', fontWeight: 700, marginTop: 8, fontSize: 14 }}>{qAnswers.months} months</div>
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: 8, padding: 14 }}>
            Build My Detailed Roadmap <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    );
  }

  const { months, dailyHours, completedTopics, started, customOrder } = prefs;
  
  // Base GATE completion is around 6 months. Adjust scale heavily based on months preference
  const scale = (months / 6);
  
  let overallCompletedTopics = 0;
  let overallTotalTopics = 0;

  const phases = STUDY_PHASES.map(p => ({
    ...p, 
    subjects: subjects.filter(s => s.phase === p.id).sort((a, b) => a.order - b.order).map(s => {
      const totalTopics = s.topics ? s.topics.length : 0;
      overallTotalTopics += totalTopics;
      let ratio = 0;
      let isCompleted = false;
      if (started && completedTopics && completedTopics[s.id] && totalTopics > 0) {
         const compCount = completedTopics[s.id].length;
         overallCompletedTopics += compCount;
         ratio = compCount / totalTopics;
         if (compCount === totalTopics) isCompleted = true;
      }
      return { ...s, isCompleted, completionRatio: ratio };
    })
  }));

  const globalCompletionPct = overallTotalTopics > 0 ? Math.round((overallCompletedTopics / overallTotalTopics) * 100) : 0;

  const moveSubject = (idx, direction) => {
    if (!customOrder) return;
    const newOrder = [...customOrder];
    if (direction === -1 && idx > 0) {
      [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    } else if (direction === 1 && idx < newOrder.length - 1) {
      [newOrder[idx + 1], newOrder[idx]] = [newOrder[idx], newOrder[idx + 1]];
    }
    setPrefs(p => ({ ...p, customOrder: newOrder }));
    localStorage.setItem(storageKey(uid, 'roadmap_prefs'), JSON.stringify({...prefs, customOrder: newOrder}));
  };

  // FEASIBILITY ENGINE
  // Base required hours = ~800 hours for full syllabus.
  const requiredHours = Math.round(800 * (1 - (globalCompletionPct / 100)));
  const availableHours = months * 30 * dailyHours;
  
  let feasibilityMessage = "";
  let feasibilityColor = "";
  let feasibilityBadge = "";
  
  if (availableHours < requiredHours * 0.75) {
      feasibilityMessage = "This schedule is rushed. You might need to add a few more months or increase daily hours to comfortably cover the remaining syllabus.";
      feasibilityColor = "var(--rose)";
      feasibilityBadge = "🚀 Rushed Pace";
  } else if (availableHours > requiredHours * 1.5) {
      feasibilityMessage = "You have plenty of time! You can finish early, take days off, or spend extensive time solving previous year questions.";
      feasibilityColor = "var(--cyan)";
      feasibilityBadge = "🐢 Relaxed Pace";
  } else {
      feasibilityMessage = "Your selected timeline is perfectly balanced with the remaining syllabus. Stick to this plan!";
      feasibilityColor = "var(--emerald)";
      feasibilityBadge = "🎯 Balanced Plan";
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {/* Roadmap Summary Bar */}
      <div className="glass-card" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${feasibilityColor}` }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
            Your Personalized Target
            <span className="badge" style={{ marginLeft: 12, background: `color-mix(in srgb, ${feasibilityColor} 15%, transparent)`, color: feasibilityColor }}>
              {feasibilityBadge}
            </span>
          </h3>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 12, marginBottom: 8 }}>
            <span>🗓️ {months} months</span>
            <span>⏱️ {dailyHours} hrs/day</span>
            <span>📊 {started ? `~${globalCompletionPct}% Topics Completed` : 'Starting Fresh'}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {feasibilityMessage}
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setIsQuestionnaire(true)}>
          <RotateCcw size={14} /> Retake
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, gap: 12 }}>
        <button className={`btn btn-sm ${!isCustomOrderMode && !isTimetableView ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setIsCustomOrderMode(false); setIsTimetableView(false); }}>
           AI Subject Phases
        </button>
        <button className={`btn btn-sm ${isCustomOrderMode ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setIsCustomOrderMode(true); setIsTimetableView(false); }}>
           <ListOrdered size={14} /> Custom Order
        </button>
        <button className={`btn btn-sm ${isTimetableView ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setIsTimetableView(true); setIsCustomOrderMode(false); }}>
           <Calendar size={14} /> Weekly Timetable
        </button>
      </div>

      <div className="roadmap-timeline">
        {(() => {
          let globalDayStart = 0;
          
          if (isTimetableView) {
             return phases.map((phase) => {
                 const topicsQueue = [];
                 
                 phase.subjects.forEach(sub => {
                     if (sub.isCompleted) return;
                     const remainingTopics = sub.topics ? sub.topics.filter(t => !(completedTopics && completedTopics[sub.id] && completedTopics[sub.id].includes(t))) : [];
                     if (remainingTopics.length === 0) return;
                     
                     const scaledBaseWeeks = Math.max(1, Math.round(sub.studyWeeks * scale * (1 - sub.completionRatio)));
                     const scaledBaseDays = scaledBaseWeeks * 7;
                     const autoDefaultDaysPerTopic = Math.max(1, Math.round(scaledBaseDays / remainingTopics.length));
                     
                     remainingTopics.forEach(t => {
                         const customDays = prefs.topicDays?.[sub.id]?.[t];
                         const totalDays = typeof customDays === 'number' ? customDays : autoDefaultDaysPerTopic;
                         topicsQueue.push({ sub, topic: t, partsRemaining: totalDays });
                     });
                 });
                 
                 if (topicsQueue.length === 0) return null;
                 
                 // Interleave queue
                 const interleavedSchedule = [];
                 const queueProps = [...topicsQueue];
                 const counters = {};
                 
                 let idx = 0;
                 while (queueProps.length > 0) {
                     if (idx >= queueProps.length) idx = 0;
                     const curr = queueProps[idx];
                     const key = `${curr.sub.id}_${curr.topic}`;
                     counters[key] = (counters[key] || 0) + 1;
                     const itemId = `${key}_${counters[key]}`;
                     interleavedSchedule.push({ sub: curr.sub, topic: curr.topic, id: itemId });
                     curr.partsRemaining--;
                     if (curr.partsRemaining <= 0) {
                         queueProps.splice(idx, 1);
                     } else {
                         idx++;
                     }
                 }

                 let finalSchedule = interleavedSchedule;
                 const customOrder = prefs.customPhaseOrders?.[phase.id];
                 if (customOrder) {
                    finalSchedule = [...interleavedSchedule].sort((a, b) => {
                        const idxA = customOrder.indexOf(a.id);
                        const idxB = customOrder.indexOf(b.id);
                        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                        if (idxA !== -1) return -1;
                        if (idxB !== -1) return 1;
                        return 0;
                    });
                 }
                 
                 // Chunk into 7-day weeks
                 const weeks = [];
                 for (let i = 0; i < finalSchedule.length; i += 7) {
                     weeks.push(finalSchedule.slice(i, i + 7));
                 }
                 
                 return (
                    <div key={phase.id} style={{ marginBottom: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                          <div className="roadmap-dot" style={{ background: phase.color, boxShadow: `0 0 12px ${phase.color}40`, position: 'static' }} />
                          <h4 style={{ fontSize: 18, fontWeight: 700 }}>{phase.name} — Daily Plan</h4>
                        </div>
                        {swapSource?.phaseId === phase.id && (
                           <div style={{ marginBottom: 16, padding: '8px 12px', background: 'var(--amber)', color: '#000', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <span>🔄 Select another day in this phase to swap with Day {swapSource.globalIdx + 1} ({swapSource.topic})</span>
                             <button className="btn btn-sm" style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: '#000' }} onClick={() => setSwapSource(null)}>Cancel</button>
                           </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                            {weeks.map((weekDays, wIdx) => (
                                <div key={wIdx} className="glass-card" style={{ padding: 16, borderTop: `4px solid ${phase.color}40`, opacity: swapSource?.phaseId === phase.id ? 0.9 : 1 }}>
                                    <h5 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Week {wIdx + 1}</h5>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {weekDays.map((dayItem, localIdx) => {
                                            const globalIdx = wIdx * 7 + localIdx;
                                            const isSwapSource = swapSource?.phaseId === phase.id && swapSource?.globalIdx === globalIdx;
                                            const isAnotherSwapTarget = swapSource?.phaseId === phase.id && !isSwapSource;
                                            const isStruckOut = struckOutDays[dayItem.id];
                                            
                                            return (
                                                <div key={localIdx} style={{ 
                                                    display: 'flex', alignItems: 'center', gap: 10, 
                                                    background: isSwapSource ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-secondary)', 
                                                    border: isSwapSource ? '1px solid var(--amber)' : (isAnotherSwapTarget ? '1px dashed var(--amber)' : '1px solid transparent'),
                                                    padding: '6px 8px', borderRadius: 6, transition: 'all 0.2s', cursor: 'pointer',
                                                    opacity: isStruckOut ? 0.4 : 1, textDecoration: isStruckOut ? 'line-through' : 'none'
                                                }} onClick={() => {
                                                    if (isAnotherSwapTarget) {
                                                       performSwap(phase.id, swapSource.globalIdx, globalIdx, finalSchedule);
                                                    } else if (!swapSource) {
                                                       setSelectedDayResource({ id: dayItem.id, sub: dayItem.sub, topic: dayItem.topic, globalIdx });
                                                    }
                                                }}>
                                                    {!swapSource && (
                                                        <button className="btn btn-ghost" style={{ padding: 3, background: 'var(--bg-tertiary)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isStruckOut ? 'var(--emerald)' : 'var(--text-muted)' }}
                                                           onClick={e => {
                                                               e.stopPropagation();
                                                               setStruckOutDays(prev => ({ ...prev, [dayItem.id]: true }));
                                                               setTimeout(() => toggleTopic(dayItem.sub.id, dayItem.topic, true), 500);
                                                           }} title="Mark Completed">
                                                           {isStruckOut ? <CheckCircle2 size={16} /> : <Check size={16} />}
                                                        </button>
                                                    )}
                                                    <span className="badge badge-cyan" style={{ fontSize: 10, minWidth: 42, background: isSwapSource ? 'var(--amber)' : undefined, color: isSwapSource ? '#000' : undefined }}>Day {globalIdx + 1}</span>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: 11, fontWeight: 700, color: isSwapSource ? 'var(--text-primary)' : dayItem.sub.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dayItem.sub.name}</div>
                                                        <div style={{ fontSize: 11, color: isSwapSource ? 'var(--amber)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dayItem.topic}</div>
                                                    </div>
                                                    {isAnotherSwapTarget && (
                                                        <span style={{ fontSize: 16 }}>🔄</span>
                                                    )}
                                                    {!swapSource && (
                                                        <button className="btn btn-ghost btn-sm" style={{ padding: '4px', height: 'auto', minHeight: 0 }} title="Change Topic"
                                                          onClick={(e) => { e.stopPropagation(); setSwapSource({ phaseId: phase.id, globalIdx, topic: dayItem.topic }); }}>
                                                            <RotateCcw size={14} style={{ color: 'var(--text-muted)' }} />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                 );
             });
          }
          
          const renderCard = (sub, idx, isCustomMode, totalCount) => {
            const remainingTopics = sub.topics ? sub.topics.filter(t => !(completedTopics && completedTopics[sub.id] && completedTopics[sub.id].includes(t))) : [];
            
            const scaledBaseWeeks = Math.max(1, Math.round(sub.studyWeeks * scale * (1 - sub.completionRatio)));
            const scaledBaseDays = scaledBaseWeeks * 7;
            const autoDefaultDaysPerTopic = remainingTopics.length > 0 ? Math.max(1, Math.round(scaledBaseDays / remainingTopics.length)) : 1;
            
            let totalSubjectDays = 0;
            if (sub.isCompleted) {
               totalSubjectDays = 0;
            } else if (remainingTopics.length > 0) {
               totalSubjectDays = remainingTopics.reduce((acc, t) => {
                   const customForTopic = prefs.topicDays?.[sub.id]?.[t];
                   return acc + (typeof customForTopic === 'number' ? customForTopic : autoDefaultDaysPerTopic);
               }, 0);
            } else {
               totalSubjectDays = scaledBaseDays;
            }
            
            const totalHours = totalSubjectDays * dailyHours;
            const prevDayStart = globalDayStart;
            globalDayStart += totalSubjectDays;
            const isPlannerOpen = !!expandedPlanners[sub.id];
        
            return (
              <div key={sub.id} style={{ display: 'flex', gap: 12,
                padding: '14px 16px', 
                background: sub.isCompleted ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-glass)', 
                borderRadius: 'var(--radius-sm)',
                borderLeft: `3px solid ${sub.isCompleted ? 'var(--emerald)' : sub.color}`,
                opacity: sub.isCompleted ? 0.8 : 1 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ fontSize: 18, filter: sub.isCompleted ? 'grayscale(100%)' : 'none' }}>{sub.isCompleted ? '✅' : sub.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: sub.isCompleted ? 'var(--emerald)' : 'inherit', textDecoration: sub.isCompleted ? 'line-through' : 'none' }}>
                        {sub.name}
                        {sub.completionRatio > 0 && sub.completionRatio < 1 && (
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--amber)', marginLeft: 8, padding: '2px 6px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 4 }}>
                            {Math.round(sub.completionRatio * 100)}% Done
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: sub.isCompleted ? 'var(--emerald)' : 'var(--text-muted)', marginTop: 2 }}>
                        {sub.isCompleted ? 'Fully Completed' : `${totalSubjectDays} days remaining · ~${totalHours} study hours needed`}
                      </div>
                    </div>
                    {!sub.isCompleted && totalSubjectDays > 0 && (
                      <span className="badge badge-cyan" style={{ fontSize: 10 }}>
                        Day {prevDayStart + 1}-{globalDayStart}
                      </span>
                    )}
                  </div>
                  
                  {!sub.isCompleted && remainingTopics.length > 0 && (
                     <div style={{ paddingLeft: 30, marginTop: 12 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                         <strong style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Remaining Topics & Daily Planner:</strong>
                         <button className="btn btn-ghost btn-sm" style={{ fontSize: 10, padding: '2px 8px', height: 24, background: 'rgba(255,255,255,0.05)' }} onClick={() => setExpandedPlanners(p => ({ ...p, [sub.id]: !p[sub.id] }))}>
                            {isPlannerOpen ? 'Collapse Planner' : 'Customize Days'}
                         </button>
                       </div>
                       
                       {isPlannerOpen ? (
                         <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                            {remainingTopics.map((t, i) => {
                               const currentDays = typeof prefs.topicDays?.[sub.id]?.[t] === 'number' ? prefs.topicDays[sub.id][t] : autoDefaultDaysPerTopic;
                               return (
                                 <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)' }}>
                                   <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{t}</span>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                     <button className="btn btn-secondary btn-sm" style={{ width: 24, height: 24, padding: 0 }} onClick={() => handleTopicDayChange(sub.id, t, currentDays, -1)} disabled={currentDays <= 1}>-</button>
                                     <span style={{ fontSize: 11, fontWeight: 600, width: 44, textAlign: 'center' }}>{currentDays} Days</span>
                                     <button className="btn btn-secondary btn-sm" style={{ width: 24, height: 24, padding: 0 }} onClick={() => handleTopicDayChange(sub.id, t, currentDays, 1)}>+</button>
                                   </div>
                                 </div>
                               );
                            })}
                         </div>
                       ) : (
                         <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {remainingTopics.map((t, i) => <span key={i} style={{ fontSize: 11, padding: '4px 8px', background: 'var(--bg-secondary)', borderRadius: 4, color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>{t}</span>)}
                         </div>
                       )}
                     </div>
                  )}
                  
                  {!sub.isCompleted && sub.books && sub.books.length > 0 && (
                     <div style={{ paddingLeft: 30, marginTop: 6 }}>
                       <strong style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Recommended Resources:</strong>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {sub.books.map((b, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                                  <BookMarked size={14} style={{ color: 'var(--amber)', flexShrink: 0 }} />
                                  <span><strong style={{ color: 'var(--text-primary)' }}>{b.name}</strong> <span style={{ opacity: 0.7 }}>— {b.author}</span></span>
                              </div>
                          ))}
                       </div>
                     </div>
                  )}
                </div>
                
                {/* Reordering Controls */}
                {isCustomMode && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderLeft: '1px solid var(--border)', paddingLeft: 12, justifyContent: 'center' }}>
                    <button onClick={() => moveSubject(idx, -1)} disabled={idx === 0} 
                      style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 1, color: 'var(--text-primary)' }}>
                      <ChevronUp size={20} />
                    </button>
                    <button onClick={() => moveSubject(idx, 1)} disabled={idx === totalCount - 1}
                      style={{ background: 'none', border: 'none', cursor: idx === totalCount - 1 ? 'not-allowed' : 'pointer', opacity: idx === totalCount - 1 ? 0.3 : 1, color: 'var(--text-primary)' }}>
                      <ChevronDown size={20} />
                    </button>
                  </div>
                )}
              </div>
            );
          };
          
          if (isCustomOrderMode && customOrder) {
            const enrichedSubjects = phases.reduce((acc, p) => [...acc, ...p.subjects], []);
            const orderedSubjects = customOrder.map(id => enrichedSubjects.find(s => s.id === id)).filter(Boolean);
            
             return (
              <div key="custom">
                <motion.div className="roadmap-phase" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="roadmap-dot" style={{ background: 'var(--accent-primary)', boxShadow: `0 0 12px var(--accent-primary)40` }} />
                  <div className="glass-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <span className="badge" style={{ background: `color-mix(in srgb, var(--accent-primary) 22%, transparent)`, color: 'var(--accent-primary)', fontSize: 11 }}>
                        Custom Sequence
                      </span>
                      <h4 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)' }}>My Personalized Priority Plan</h4>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>You can shift specific subjects to prioritize what you want to study early.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {orderedSubjects.map((sub, idx) => renderCard(sub, idx, true, orderedSubjects.length))}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          }

          // Default AI Strategy Render
          return phases.map((phase, pi) => {
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
                      {phase.subjects.map(sub => renderCard(sub, null, false, null))}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          });
        })()}
      </div>
      <AnimatePresence>
        {selectedDayResource && renderResourceModal()}
      </AnimatePresence>
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
  const subjectAvg = Object.values(subjectMap).map((data) => ({
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
