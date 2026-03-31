import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Target, X, Plus, Sparkles, CheckCircle, AlertCircle,
    ArrowRight, ChevronDown, ChevronUp, Clock, BookOpen, Rocket,
    Calendar, Lightbulb, FolderGit2, GraduationCap, Trophy,
    Award, ExternalLink, TrendingUp, BarChart3
} from 'lucide-react';
import axios from 'axios';
import ScoreCircle from '../components/ScoreCircle';
import { useAuth } from '../context/AuthContext';

import { getDomainData } from '../utils/domainData';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const levels = ['Beginner', 'Intermediate', 'Advanced'];

const priorityColor = { critical: 'var(--rose)', high: 'var(--amber)', medium: 'var(--cyan)' };
const priorityBg = {
    critical: 'color-mix(in srgb, var(--rose) 12%, transparent)',
    high: 'color-mix(in srgb, var(--amber) 12%, transparent)',
    medium: 'color-mix(in srgb, var(--cyan) 12%, transparent)',
};
const difficultyBadge = {
    beginner: { bg: 'color-mix(in srgb, var(--emerald) 12%, transparent)', color: 'var(--emerald)' },
    intermediate: { bg: 'color-mix(in srgb, var(--amber) 12%, transparent)', color: 'var(--amber)' },
    advanced: { bg: 'color-mix(in srgb, var(--rose) 12%, transparent)', color: 'var(--rose)' },
};

// ── Skeleton Loader ──
function SkeletonCard({ lines = 3, height }) {
    return (
        <div className="glass-card" style={{ pointerEvents: 'none' }}>
            <div style={{
                height: 18, width: '40%', borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-tertiary)', marginBottom: 16,
                animation: 'pulse 1.5s ease-in-out infinite',
            }} />
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} style={{
                    height: height || 14, width: `${80 - i * 12}%`, borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-tertiary)', marginBottom: 10,
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: `${i * 0.15}s`,
                }} />
            ))}
        </div>
    );
}

// ── Collapsible Section ──
function CollapsibleSection({ title, icon, defaultOpen = false, badge, children }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-primary)', padding: 0,
                }}
            >
                <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0 }}>
                    {icon} {title}
                    {badge && <span className="badge badge-purple" style={{ fontSize: 11 }}>{badge}</span>}
                </h3>
                {open ? <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <div style={{ paddingTop: 16 }}>{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


export default function SkillGap() {
    const { user } = useAuth();
    const domainData = getDomainData(user?.domain);
    const roles = domainData.targetRoles;
    const uid = user?.id || 'anon';
    const ck = (k) => `${k}_${uid}`;

    const [selectedRole, setSelectedRole] = useState(() => localStorage.getItem(ck('skillgap_role')) || roles[0]?.id || '');
    const [skills, setSkills] = useState(() => {
        const saved = localStorage.getItem(ck('skillgap_skills'));
        return saved ? JSON.parse(saved) : [];
    });
    const [inputValue, setInputValue] = useState('');
    const [level, setLevel] = useState(() => localStorage.getItem(ck('skillgap_level')) || 'Beginner');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(() => {
        const saved = localStorage.getItem(ck('skillgap_result'));
        return saved ? JSON.parse(saved) : null;
    });
    const [expandedPhase, setExpandedPhase] = useState(null);

    // ── LocalStorage Sync (user-scoped) ──
    useEffect(() => { localStorage.setItem(ck('skillgap_role'), selectedRole); }, [selectedRole, uid]);
    useEffect(() => { localStorage.setItem(ck('skillgap_skills'), JSON.stringify(skills)); }, [skills, uid]);
    useEffect(() => { localStorage.setItem(ck('skillgap_level'), level); }, [level, uid]);
    useEffect(() => {
        if (result) localStorage.setItem(ck('skillgap_result'), JSON.stringify(result));
        else localStorage.removeItem(ck('skillgap_result'));
    }, [result, uid]);

    // ── Supabase Hydration (cross-device persistence) ──
    useEffect(() => {
        if (!user) return;
        const token = localStorage.getItem('vm_token');
        if (!token) return;
        const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        axios.get(`${BASE}/api/user-data/latest`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            const data = res.data;
            if (!result && data.skill_analysis) {
                const sa = data.skill_analysis;
                setSelectedRole(sa.target_role || '');
                setLevel(sa.experience_level || 'Beginner');
                setSkills(sa.matched_skills || []);
                setResult(sa);
            }
        })
        .catch(() => {});
    }, [uid]);
    const addSkill = () => {
        const s = inputValue.trim();
        if (s && !skills.includes(s)) {
            setSkills([...skills, s]);
            setInputValue('');
        }
    };

    const removeSkill = (skill) => setSkills(skills.filter(s => s !== skill));

    const handleToggleSkill = (skill) => {
        if (skills.includes(skill)) {
            removeSkill(skill);
        } else {
            setSkills([...skills, skill]);
        }
    };

    const analyze = async () => {
        if (!selectedRole || skills.length === 0) return;
        setLoading(true);
        setResult(null);
        try {
            const token = localStorage.getItem('vm_token');
            const res = await axios.post(`${API}/api/skills/analyze`, {
                current_skills: skills,
                target_role: selectedRole,
                experience_level: level,
                domain: user?.domain || 'Software Engineering / CS / IT'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResult(res.data);
        } catch (err) {
            console.error('Skill gap analysis failed:', err);
        }
        setLoading(false);
    };

    const reset = () => {
        setResult(null);
        setExpandedPhase(null);
    };

    const currentRoleData = roles.find(r => r.id === selectedRole);
    const allSuggestedSkills = currentRoleData?.suggestedSkills || [];
    const requiredSuggestedSkills = currentRoleData?.requiredSkills || allSuggestedSkills.slice(0, Math.min(5, allSuggestedSkills.length));
    const additionalSuggestedSkills = currentRoleData?.additionalSkills || allSuggestedSkills.slice(requiredSuggestedSkills.length);

    // ── FORM VIEW ──
    const renderForm = () => (
        <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="grid-2" style={{ maxWidth: 900, margin: '0 auto' }}>
                {/* Target Role */}
                <div className="glass-card">
                    <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Target size={18} style={{ color: 'var(--accent-tertiary)' }} /> Target Role
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {roles.map(r => (
                            <button
                                key={r.id}
                                className={`btn ${selectedRole === r.id ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setSelectedRole(r.id)}
                                style={{ justifyContent: 'flex-start' }}
                            >
                                <span>{r.icon}</span> {r.name}
                            </button>
                        ))}
                    </div>

                    {/* Experience Level */}
                    <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20 }}>
                        <GraduationCap size={18} style={{ color: 'var(--cyan)' }} /> Experience Level
                    </h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {levels.map(l => (
                            <button
                                key={l}
                                className={`btn btn-sm ${level === l ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setLevel(l)}
                                style={{ flex: 1 }}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Skills */}
                <div className="glass-card">
                    <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Brain size={18} style={{ color: 'var(--cyan)' }} /> Your Skills
                    </h3>

                    {/* ── Dynamic Suggested Skills ── */}
                    {selectedRole && allSuggestedSkills.length > 0 && (
                        <motion.div>
                            <div className="section-header">
                                <h3 className="section-title">Role Skills</h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
                                <div style={{ padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-glass)' }}>
                                    <p style={{ margin: 0, marginBottom: 8, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                        Required Skills
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {requiredSuggestedSkills.map(s => {
                                            const isAdded = skills.includes(s);
                                            return (
                                                <button
                                                    key={s} type="button"
                                                    className={`skill-tag interactive ${isAdded ? 'added' : 'required'}`}
                                                    onClick={() => handleToggleSkill(s)}
                                                >
                                                    {s} {isAdded ? <CheckCircle size={14} /> : <Plus size={14} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div style={{ padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-glass)' }}>
                                    <p style={{ margin: 0, marginBottom: 8, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                        Optional / Additional Skills
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {additionalSuggestedSkills.length > 0 ? additionalSuggestedSkills.map(s => {
                                            const isAdded = skills.includes(s);
                                            return (
                                                <button
                                                    key={s} type="button"
                                                    className={`skill-tag interactive ${isAdded ? 'added' : 'required'}`}
                                                    onClick={() => handleToggleSkill(s)}
                                                >
                                                    {s} {isAdded ? <CheckCircle size={14} /> : <Plus size={14} />}
                                                </button>
                                            );
                                        }) : (
                                            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                                No additional skills defined for this role yet.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {!selectedRole && (
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, fontStyle: 'italic' }}>
                            ← Select a target role to see relevant skills
                        </p>
                    )}

                    {/* Custom skill input */}
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Add custom skills</p>
                    <div className="tag-input-container" style={{ marginBottom: 12 }}>
                        {skills.filter(s => {
                            return !allSuggestedSkills.includes(s);
                        }).map(s => (
                            <span key={s} className="tag">
                                {s}
                                <button onClick={() => removeSkill(s)}><X size={12} /></button>
                            </span>
                        ))}
                        <input
                            className="tag-input"
                            placeholder="Type a custom skill and press Enter..."
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                        />
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={analyze}
                        disabled={!selectedRole || skills.length === 0 || loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? (
                            <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Analyzing...</>
                        ) : (
                            <><Sparkles size={16} /> Analyze Skill Gap</>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );

    // ── LOADING VIEW ──
    const renderLoading = () => (
        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }`}</style>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                <SkeletonCard lines={2} height={40} />
                <div className="grid-2" style={{ marginTop: 20 }}>
                    <SkeletonCard lines={4} />
                    <SkeletonCard lines={5} />
                </div>
                <div style={{ marginTop: 20 }}><SkeletonCard lines={6} /></div>
            </div>
        </motion.div>
    );

    // ── RESULTS VIEW ──
    const renderResults = () => (
        <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

            {/* ── 1. HERO: Match Percentage ── */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="glass-card"
                style={{ textAlign: 'center', marginBottom: 24 }}
            >
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 20, fontSize: 16, color: 'var(--text-secondary)' }}>
                    Skill Match for <span style={{ color: 'var(--accent-tertiary)', fontWeight: 700 }}>{result.target_role}</span>
                </h3>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                    <ScoreCircle score={result.match_percentage} size={140} label="Match" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 8 }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--emerald)' }}>
                            {result.matched_skills.length}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Skills Matched</div>
                    </div>
                    <div style={{ width: 1, background: 'var(--border)' }} />
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--rose)' }}>
                            {result.missing_skills.length}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Skills to Learn</div>
                    </div>
                </div>
            </motion.div>

            {/* ── 2 & 3. MATCHED + MISSING SKILLS ── */}
            <div className="grid-2" style={{ marginBottom: 24 }}>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <CollapsibleSection
                        title={`Skills You Have (${result.matched_skills.length})`}
                        icon={<CheckCircle size={18} style={{ color: 'var(--emerald)' }} />}
                        defaultOpen={true}
                    >
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {result.matched_skills.map(s => (
                                <span key={s} className="badge badge-emerald"><CheckCircle size={12} /> {s}</span>
                            ))}
                            {result.matched_skills.length === 0 && (
                                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No matching skills found</p>
                            )}
                        </div>
                    </CollapsibleSection>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                    <CollapsibleSection
                        title={`Skills to Learn (${result.missing_skills.length})`}
                        icon={<AlertCircle size={18} style={{ color: 'var(--rose)' }} />}
                        defaultOpen={true}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {result.missing_skills.map(s => (
                                <div key={s.name} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '10px 14px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)',
                                    borderLeft: `3px solid ${priorityColor[s.priority]}`,
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <AlertCircle size={14} style={{ color: priorityColor[s.priority] }} />
                                        <span style={{ fontSize: 14, fontWeight: 500 }}>{s.name}</span>
                                    </div>
                                    <span className="badge" style={{
                                        background: priorityBg[s.priority],
                                        color: priorityColor[s.priority], fontSize: 11,
                                    }}>
                                        {s.priority}
                                    </span>
                                </div>
                            ))}
                            {result.missing_skills.length === 0 && (
                                <p style={{ color: 'var(--emerald)', fontSize: 14, fontWeight: 500 }}>
                                    🎉 You have all required skills!
                                </p>
                            )}
                        </div>
                    </CollapsibleSection>
                </motion.div>
            </div>

            {/* ── 4. PRIORITY ROADMAP ── */}
            {result.priority_roadmap && result.priority_roadmap.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ marginBottom: 24 }}
                >
                    <CollapsibleSection
                        title="Priority Roadmap"
                        icon={<Rocket size={18} style={{ color: 'var(--accent-tertiary)' }} />}
                        badge={`${result.priority_roadmap.length} phases`}
                        defaultOpen={true}
                    >
                        <div className="roadmap-timeline">
                            {result.priority_roadmap.map((phase, i) => (
                                <div key={i} className="roadmap-phase">
                                    <div className="roadmap-dot" />
                                    <div
                                        onClick={() => setExpandedPhase(expandedPhase === i ? null : i)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            marginBottom: 6,
                                        }}>
                                            <h4 style={{
                                                fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600,
                                                color: 'var(--text-primary)',
                                            }}>
                                                Phase {phase.phase}: {phase.title}
                                            </h4>
                                            <span className="badge badge-purple" style={{ fontSize: 11 }}>
                                                <Clock size={10} /> {phase.duration}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                                            {phase.skills.map(s => (
                                                <span key={s} className="badge badge-cyan" style={{ fontSize: 11 }}>{s}</span>
                                            ))}
                                        </div>
                                        <AnimatePresence>
                                            {expandedPhase === i && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.25 }}
                                                >
                                                    <p style={{
                                                        fontSize: 13, color: 'var(--text-secondary)',
                                                        padding: '10px 14px', background: 'var(--bg-glass)',
                                                        borderRadius: 'var(--radius-sm)', marginTop: 4,
                                                        borderLeft: '3px solid var(--accent-primary)',
                                                    }}>
                                                        {phase.focus}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CollapsibleSection>
                </motion.div>
            )}

            {/* ── 5. LEARNING PLAN ── */}
            {result.learning_plan && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{ marginBottom: 24 }}
                >
                    <CollapsibleSection
                        title="Learning Plan"
                        icon={<BookOpen size={18} style={{ color: 'var(--cyan)' }} />}
                        badge={`${result.learning_plan.daily_hours}h/day`}
                        defaultOpen={false}
                    >
                        {/* Weekly schedule */}
                        <h4 style={{
                            fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
                            color: 'var(--text-secondary)', marginBottom: 12,
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                            <Calendar size={14} /> Weekly Schedule
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                                <div key={day} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 10,
                                    padding: '8px 12px', background: 'var(--bg-glass)',
                                    borderRadius: 'var(--radius-sm)',
                                }}>
                                    <span style={{
                                        fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
                                        color: 'var(--accent-tertiary)', minWidth: 32,
                                        paddingTop: 1,
                                    }}>
                                        {day}
                                    </span>
                                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                        {result.learning_plan.weekly_structure[i] || '—'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Milestones */}
                        <h4 style={{
                            fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
                            color: 'var(--text-secondary)', marginBottom: 12,
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                            <Target size={14} /> Milestones
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                            {result.learning_plan.milestones.map((m, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 10,
                                    fontSize: 13, color: 'var(--text-secondary)',
                                }}>
                                    <div style={{
                                        width: 20, height: 20, borderRadius: '50%',
                                        background: 'color-mix(in srgb, var(--accent-primary) 15%, transparent)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--accent-tertiary)', fontSize: 11, fontWeight: 700,
                                        flexShrink: 0, marginTop: 1,
                                    }}>
                                        {i + 1}
                                    </div>
                                    {m}
                                </div>
                            ))}
                        </div>

                        {/* Tips */}
                        <h4 style={{
                            fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
                            color: 'var(--text-secondary)', marginBottom: 12,
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                            <Lightbulb size={14} /> Tips
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {result.learning_plan.tips.map((t, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 8,
                                    fontSize: 13, color: 'var(--text-secondary)',
                                }}>
                                    <ArrowRight size={14} style={{ color: 'var(--emerald)', marginTop: 2, flexShrink: 0 }} />
                                    {t}
                                </div>
                            ))}
                        </div>
                    </CollapsibleSection>
                </motion.div>
            )}

            {/* ── 6. PROJECT SUGGESTIONS ── */}
            {result.project_suggestions && result.project_suggestions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{ marginBottom: 24 }}
                >
                    <CollapsibleSection
                        title="Project Suggestions"
                        icon={<FolderGit2 size={18} style={{ color: 'var(--emerald)' }} />}
                        badge={`${result.project_suggestions.length} projects`}
                        defaultOpen={true}
                    >
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${result.project_suggestions.length >= 3 ? 3 : result.project_suggestions.length}, 1fr)`,
                            gap: 16,
                        }}>
                            {result.project_suggestions.map((p, i) => {
                                const diff = difficultyBadge[p.difficulty] || difficultyBadge.intermediate;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                        style={{
                                            padding: 18, background: 'var(--bg-glass)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--border)',
                                            display: 'flex', flexDirection: 'column', gap: 10,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <h4 style={{
                                                fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600,
                                                color: 'var(--text-primary)',
                                            }}>
                                                {p.name}
                                            </h4>
                                            <span className="badge" style={{
                                                background: diff.bg, color: diff.color, fontSize: 10,
                                            }}>
                                                {p.difficulty}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>
                                            {p.description}
                                        </p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {p.skills_practiced.map(s => (
                                                <span key={s} className="badge badge-cyan" style={{ fontSize: 10 }}>{s}</span>
                                            ))}
                                        </div>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 4,
                                            fontSize: 12, color: 'var(--text-muted)',
                                        }}>
                                            <Clock size={12} /> {p.estimated_time}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </CollapsibleSection>
                </motion.div>
            )}

            {/* ── 6. INDUSTRY BENCHMARK BANNER ── */}
            {result.industry_benchmarks && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="glass-card"
                    style={{
                        marginBottom: 24,
                        background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-primary) 8%, transparent), color-mix(in srgb, var(--cyan) 8%, transparent))',
                        borderLeft: '3px solid var(--accent-primary)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <BarChart3 size={18} style={{ color: 'var(--accent-tertiary)' }} />
                        <h3 className="section-title" style={{ marginBottom: 0 }}>Industry Benchmark Data</h3>
                        <span className="badge badge-purple" style={{ fontSize: 10 }}>
                            {result.industry_benchmarks.jds_analyzed.toLocaleString()} JDs Analyzed
                        </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                        Skills benchmarked against <strong style={{ color: 'var(--text-primary)' }}>{result.industry_benchmarks.jds_analyzed.toLocaleString()}</strong> real job descriptions from{' '}
                        <strong style={{ color: 'var(--text-primary)' }}>{result.industry_benchmarks.source_platforms.join(', ')}</strong>
                        {' · '} Last updated: {result.industry_benchmarks.last_updated}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                        {result.industry_benchmarks.top_demanded_skills.slice(0, 6).map(s => (
                            <div key={s.skill} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', minWidth: 110 }}>
                                    {s.skill}
                                </span>
                                <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${s.demand_pct}%` }}
                                        transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                                        style={{
                                            height: '100%', borderRadius: 3,
                                            background: s.demand_pct >= 60 ? 'var(--accent-primary)' : s.demand_pct >= 40 ? 'var(--cyan)' : 'var(--text-muted)',
                                        }}
                                    />
                                </div>
                                <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--accent-tertiary)', minWidth: 36, textAlign: 'right' }}>
                                    {s.demand_pct}%
                                </span>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span><TrendingUp size={12} style={{ verticalAlign: 'middle' }} /> {result.industry_benchmarks.avg_openings_per_month.toLocaleString()} openings/month</span>
                        <span>Top hiring: {result.industry_benchmarks.top_hiring_companies.slice(0, 4).join(', ')}</span>
                    </div>
                </motion.div>
            )}

            {/* ── 7. HACKATHON RECOMMENDATIONS ── */}
            {result.hackathon_recommendations && result.hackathon_recommendations.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    style={{ marginBottom: 24 }}
                >
                    <CollapsibleSection
                        title="Recommended Hackathons"
                        icon={<Trophy size={18} style={{ color: 'var(--amber)' }} />}
                        badge={`${result.hackathon_recommendations.length} matches`}
                        defaultOpen={true}
                    >
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(auto-fill, minmax(280px, 1fr))`,
                            gap: 14,
                        }}>
                            {result.hackathon_recommendations.map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.55 + i * 0.08 }}
                                    style={{
                                        padding: 16, background: 'var(--bg-glass)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border)',
                                        display: 'flex', flexDirection: 'column', gap: 8,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                                            {h.name}
                                        </h4>
                                        <a href={h.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-tertiary)', flexShrink: 0 }}>
                                            <ExternalLink size={14} />
                                        </a>
                                    </div>
                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                                        {h.description}
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                        {h.matching_skills.slice(0, 4).map(s => (
                                            <span key={s} className="badge badge-cyan" style={{ fontSize: 10 }}>{s}</span>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)', marginTop: 'auto' }}>
                                        <span>📍 {h.type}</span>
                                        <span>📅 {h.frequency}</span>
                                        <span>👥 {h.team_size}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CollapsibleSection>
                </motion.div>
            )}

            {/* ── 8. CERTIFICATION RECOMMENDATIONS ── */}
            {result.certification_recommendations && result.certification_recommendations.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    style={{ marginBottom: 24 }}
                >
                    <CollapsibleSection
                        title="Recommended Certifications"
                        icon={<Award size={18} style={{ color: 'var(--emerald)' }} />}
                        badge={`${result.certification_recommendations.length} matches`}
                        defaultOpen={true}
                    >
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(auto-fill, minmax(280px, 1fr))`,
                            gap: 14,
                        }}>
                            {result.certification_recommendations.map((c, i) => {
                                const costColor = c.cost.toLowerCase().includes('free') ? 'var(--emerald)' : 'var(--amber)';
                                const costBg = c.cost.toLowerCase().includes('free')
                                    ? 'color-mix(in srgb, var(--emerald) 12%, transparent)'
                                    : 'color-mix(in srgb, var(--amber) 12%, transparent)';
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 + i * 0.08 }}
                                        style={{
                                            padding: 16, background: 'var(--bg-glass)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--border)',
                                            display: 'flex', flexDirection: 'column', gap: 8,
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                                                {c.name}
                                            </h4>
                                            <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-tertiary)', flexShrink: 0 }}>
                                                <ExternalLink size={14} />
                                            </a>
                                        </div>
                                        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                                            {c.provider} · {c.duration}
                                        </p>
                                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                                            {c.description}
                                        </p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {c.matching_skills.slice(0, 4).map(s => (
                                                <span key={s} className="badge badge-cyan" style={{ fontSize: 10 }}>{s}</span>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                                            <span className="badge" style={{ background: costBg, color: costColor, fontSize: 10 }}>
                                                {c.cost}
                                            </span>
                                            <span className="badge" style={{
                                                background: difficultyBadge[c.difficulty.toLowerCase()]?.bg || difficultyBadge.intermediate.bg,
                                                color: difficultyBadge[c.difficulty.toLowerCase()]?.color || difficultyBadge.intermediate.color,
                                                fontSize: 10,
                                            }}>
                                                {c.difficulty}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </CollapsibleSection>
                </motion.div>
            )}

            {/* ── Analyze Again ── */}
            <button className="btn btn-secondary" onClick={reset} style={{ marginTop: 8 }}>
                ← Back
            </button>
        </motion.div>
    );

    return (
        <div>
            <div className="page-header">
                <h1>🧠 Skill Gap Analysis</h1>
                <p>Compare your skills against industry requirements and get a personalized learning roadmap</p>
            </div>

            <AnimatePresence mode="wait">
                {loading ? renderLoading()
                    : result ? renderResults()
                        : renderForm()}
            </AnimatePresence>
        </div>
    );
}
