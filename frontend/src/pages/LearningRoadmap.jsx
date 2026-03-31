import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, BookOpen, Clock, ExternalLink, ChevronDown, ChevronUp, Sparkles, ArrowRight, Lightbulb, Check, AlertCircle, HelpCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getDomainData } from '../utils/domainData';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const phaseColors = ['var(--accent-primary)', 'var(--cyan)', 'var(--emerald)', 'var(--amber)'];

// Utilities
const isValidHttpsUrl = (urlString) => {
    if (!urlString) return false;
    try {
        const url = new URL(urlString);
        return url.protocol === "https:";
    } catch {
        return false;
    }
};

const validateRoadmapData = (data) => {
    if (!data || typeof data !== 'object') {
        throw new Error("Invalid response format received from the server.");
    }
    const phases = data.phases || data.roadmap?.phases;
    if (!phases || !Array.isArray(phases) || phases.length === 0) {
        throw new Error("Roadmap payload contains no meaningful phases.");
    }
    const validPhases = phases.filter(p => p && p.title && p.duration);
    if (validPhases.length === 0) {
        throw new Error("Roadmap phases are missing critical required fields (title, duration).");
    }
    return { ...(data.roadmap || data), phases: validPhases };
};

// Modular Components
const SkeletonLoader = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="skeleton-container">
        <div className="glass-card" style={{ marginBottom: 24, padding: 24 }}>
            <motion.div style={{ height: 28, width: '50%', background: 'var(--border)', borderRadius: 4, marginBottom: 16 }} animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} />
            <motion.div style={{ height: 20, width: '30%', background: 'var(--border)', borderRadius: 4 }} animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.1 }} />
        </div>
        {[1, 2, 3].map(i => (
            <div key={i} className="roadmap-phase" style={{ opacity: 0.6 }}>
                <div className="roadmap-dot" style={{ background: 'var(--border)' }} />
                <motion.div className="glass-card" style={{ marginBottom: 16 }} animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}>
                    <div style={{ height: 24, width: '40%', background: 'var(--border)', borderRadius: 4, marginBottom: 12 }} />
                    <div style={{ height: 16, width: '25%', background: 'var(--border)', borderRadius: 4, marginBottom: 16 }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ height: 26, width: 70, background: 'var(--border)', borderRadius: 12 }} />
                        <div style={{ height: 26, width: 90, background: 'var(--border)', borderRadius: 12 }} />
                    </div>
                </motion.div>
            </div>
        ))}
    </motion.div>
);

const RoadmapFormSkeleton = ({ 
    role, setRole, currentLevel, setCurrentLevel, missingSkills, setMissingSkills, 
    months, setMonths, dailyCommitment, setDailyCommitment, generate, loading, roleOptions
}) => (
    <div className="glass-card" style={{ maxWidth: 650, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
                <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>Target Role</label>
                <select className="select" value={role} onChange={e => setRole(e.target.value)} disabled={loading}>
                    <option value="">Select a role...</option>
                    {roleOptions.map((item) => (
                        <option key={item.id} value={item.name}>{item.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>Current Level</label>
                <select className="select" value={currentLevel} onChange={e => setCurrentLevel(e.target.value)} disabled={loading}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>
            </div>
            <div>
                <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>Skills to Learn (comma-separated)</label>
                <input
                    className="input"
                    placeholder={`e.g., ${roleOptions[0]?.suggestedSkills?.[0] || 'Core Skill'}, ${roleOptions[0]?.suggestedSkills?.[1] || 'Advanced Skill'}`}
                    value={missingSkills}
                    onChange={e => setMissingSkills(e.target.value)}
                    disabled={loading}
                />
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Leave empty for default suggestions based on role</p>
            </div>
            
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                    <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>Timeline: {months} months</label>
                    <input
                        type="range" min={2} max={12} value={months}
                        onChange={e => setMonths(Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                        disabled={loading}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                        <span>2m</span><span>12m</span>
                    </div>
                </div>
                <div style={{ flex: '1 1 200px' }}>
                    <label style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>Daily Commitment: {dailyCommitment} hours</label>
                    <input
                        type="range" min={1} max={8} value={dailyCommitment}
                        onChange={e => setDailyCommitment(Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                        disabled={loading}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                        <span>1h</span><span>8h</span>
                    </div>
                </div>
            </div>

            <button className="btn btn-primary" onClick={generate} disabled={!role || loading}>
                <Sparkles size={16} style={{ marginRight: loading ? 0 : 8 }} /> {loading ? 'Resolving dependencies & generating plan...' : 'Generate Roadmap'}
            </button>
        </div>
    </div>
);

// Count total activities in a phase (daily_plan items + project)
const getPhaseActivityCount = (phase) => {
    let count = (phase.daily_plan || []).length;
    if (phase.project_to_build) count += 1;
    return Math.max(count, 1);
};

// Count checked activities in a phase
const getPhaseCheckedCount = (phase, phaseIdx, checkedActivities) => {
    let count = 0;
    (phase.daily_plan || []).forEach((_, idx) => {
        if (checkedActivities[`${phaseIdx}-daily-${idx}`]) count++;
    });
    if (phase.project_to_build && checkedActivities[`${phaseIdx}-project`]) count++;
    return count;
};

const ProgressBar = ({ roadmap, checkedActivities }) => {
    let totalActivities = 0;
    let totalChecked = 0;
    (roadmap.phases || []).forEach((phase, i) => {
        totalActivities += getPhaseActivityCount(phase);
        totalChecked += getPhaseCheckedCount(phase, i, checkedActivities);
    });
    const progress = totalActivities > 0 ? Math.round((totalChecked / totalActivities) * 100) : 0;

    return (
        <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Overall Progress</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-primary)' }}>{totalChecked}/{totalActivities} activities · {progress}%</span>
            </div>
            <div style={{ height: 8, width: '100%', background: 'var(--bg-glass)', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${progress}%` }} 
                    style={{ height: '100%', background: progress >= 100 ? 'var(--emerald)' : 'var(--accent-primary)', borderRadius: 4 }} 
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            </div>
        </div>
    );
};

const PhaseProgressBar = ({ phase, phaseIdx, checkedActivities }) => {
    const total = getPhaseActivityCount(phase);
    const checked = getPhaseCheckedCount(phase, phaseIdx, checkedActivities);
    const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
    const isComplete = pct >= 100;

    return (
        <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phase Progress</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: isComplete ? 'var(--emerald)' : 'var(--accent-primary)' }}>{checked}/{total} · {pct}%</span>
            </div>
            <div style={{ height: 4, width: '100%', background: 'var(--bg-tertiary)', borderRadius: 2, overflow: 'hidden' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    style={{ height: '100%', background: isComplete ? 'var(--emerald)' : 'var(--accent-primary)', borderRadius: 2 }}
                    transition={{ duration: 0.4 }}
                />
            </div>
        </div>
    );
};

const ActivityCheckbox = ({ checked, onChange, label, strikethrough = true }) => (
    <div
        onClick={onChange}
        style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
            padding: '8px 10px', borderRadius: 'var(--radius-sm)',
            background: checked ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
            transition: 'background 0.2s',
        }}
    >
        <div style={{
            width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
            border: `2px solid ${checked ? 'var(--emerald)' : 'var(--border)'}`,
            background: checked ? 'var(--emerald)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
        }}>
            {checked && <Check size={12} color="#fff" />}
        </div>
        <span style={{
            fontSize: 13, color: checked ? 'var(--text-muted)' : 'var(--text-secondary)',
            textDecoration: strikethrough && checked ? 'line-through' : 'none',
            lineHeight: 1.5, transition: 'all 0.2s',
        }}>
            {label}
        </span>
    </div>
);

const RoadmapPhaseCard = ({ phase, i, expandedPhase, setExpandedPhase, checkedActivities, toggleActivity }) => {
    const isExpanded = expandedPhase === i;
    const validResources = (phase.resources || []).filter(r => isValidHttpsUrl(r.url));
    const phaseTotal = getPhaseActivityCount(phase);
    const phaseChecked = getPhaseCheckedCount(phase, i, checkedActivities);
    const isCompleted = phaseChecked >= phaseTotal && phaseTotal > 0;
    const logicOrReasoning = phase.reasoning || phase.why_this_phase;

    return (
        <motion.div
            className="roadmap-phase"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
        >
            <div className="roadmap-dot" style={{ background: phaseColors[i % 4], boxShadow: isCompleted ? `0 0 10px ${phaseColors[i % 4]}` : 'none' }} />
            <div
                className="glass-card"
                style={{ 
                    cursor: 'pointer',
                    borderColor: isCompleted ? 'var(--accent-primary-transparent)' : undefined,
                    transition: 'border-color 0.3s'
                }}
            >
                <div onClick={() => setExpandedPhase(isExpanded ? null : i)} style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
                    {/* Phase completion indicator */}
                    <div style={{
                        width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                        border: `2px solid ${isCompleted ? 'var(--emerald)' : 'var(--border)'}`,
                        background: isCompleted ? 'var(--emerald)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.3s',
                    }}>
                        {isCompleted && <Check size={14} color="#fff" />}
                    </div>

                    <div style={{ flex: 1 }}>
                        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                            {phase.title}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                                <Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                {phase.duration}
                            </span>
                            <span style={{ fontSize: 12, color: isCompleted ? 'var(--emerald)' : 'var(--text-muted)', fontWeight: 600 }}>
                                {phaseChecked}/{phaseTotal} done
                            </span>
                        </div>
                    </div>

                    <div style={{ padding: 8 }}>
                        {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                    </div>
                </div>

                {/* Per-phase progress bar (visible in collapsed state too) */}
                {!isExpanded && phaseTotal > 0 && (
                    <div style={{ marginTop: 8 }}>
                        <div style={{ height: 3, width: '100%', background: 'var(--bg-tertiary)', borderRadius: 2, overflow: 'hidden' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.round((phaseChecked / phaseTotal) * 100)}%` }}
                                style={{ height: '100%', background: isCompleted ? 'var(--emerald)' : phaseColors[i % 4], borderRadius: 2 }}
                                transition={{ duration: 0.4 }}
                            />
                        </div>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                                {phase.description && (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>{phase.description}</p>
                                )}
                                
                                {logicOrReasoning && (
                                    <div style={{ marginBottom: 16, background: 'rgba(56, 189, 248, 0.05)', padding: 12, borderRadius: 8, borderLeft: '3px solid var(--cyan)' }}>
                                        <h5 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <HelpCircle size={14} /> Why this phase?
                                        </h5>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>{logicOrReasoning}</p>
                                    </div>
                                )}

                                <div>
                                    <h5 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>🛠 Skills Covered</h5>
                                    {(!phase.skills || phase.skills.length === 0) ? (
                                        <p style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic', marginBottom: 20 }}>No specific skills highlighted for this phase.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                                            {phase.skills.map((s, idx) => <span key={idx} className="badge badge-purple">{s}</span>)}
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginBottom: 16 }}>
                                    <h5 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>📅 Action Plan</h5>
                                    {(!phase.daily_plan || phase.daily_plan.length === 0) ? (
                                        <p style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>No structured plan was provided by the AI.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {phase.daily_plan.map((item, idx) => (
                                                <ActivityCheckbox
                                                    key={idx}
                                                    checked={!!checkedActivities[`${i}-daily-${idx}`]}
                                                    onChange={() => toggleActivity(`${i}-daily-${idx}`)}
                                                    label={item}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginBottom: 16, background: 'var(--bg-glass)', padding: 12, borderRadius: 8 }}>
                                    <h5 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--emerald)' }}>🚀 Project to Build</h5>
                                    {phase.project_to_build ? (
                                        <ActivityCheckbox
                                            checked={!!checkedActivities[`${i}-project`]}
                                            onChange={() => toggleActivity(`${i}-project`)}
                                            label={phase.project_to_build}
                                        />
                                    ) : (
                                        <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0, fontStyle: 'italic' }}>No explicit project required for this phase.</p>
                                    )}
                                </div>

                                <div style={{ marginBottom: 20 }}>
                                    <h5 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--amber)' }}>🎯 Real-world Capability</h5>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
                                        {phase.expected_outcome || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Outcome was not definitively specified.</span>}
                                    </p>
                                </div>

                                <div>
                                    <h5 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>
                                        <BookOpen size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Curated Resources
                                    </h5>
                                    {validResources.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>No active validated resources available for this phase.</p>
                                    ) : (
                                        validResources.map((r, ri) => (
                                            <a
                                                key={ri}
                                                href={r.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                                                    background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)',
                                                    color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13,
                                                    marginBottom: 8, transition: 'var(--transition-fast)',
                                                    border: '1px solid transparent'
                                                }}
                                                className="resource-link-hover"
                                            >
                                                <ExternalLink size={14} style={{ color: 'var(--accent-tertiary)', flexShrink: 0 }} />
                                                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</span>
                                                {r.platform && <span className="badge badge-cyan" style={{ fontSize: 11, flexShrink: 0 }}>{r.platform}</span>}
                                            </a>
                                        ))
                                    )}
                                </div>

                                {/* Per-phase detailed progress */}
                                <PhaseProgressBar phase={phase} phaseIdx={i} checkedActivities={checkedActivities} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default function LearningRoadmap() {
    const { user } = useAuth();
    const domainData = getDomainData(user?.domain);
    const roleOptions = domainData.targetRoles || [];
    const uid = user?.id || 'anon';
    const ck = (k) => `${k}_${uid}`;

    const [role, setRole] = useState(() => roleOptions[0]?.name || '');
    const [currentLevel, setCurrentLevel] = useState('Beginner');
    const [missingSkills, setMissingSkills] = useState('');
    const [months, setMonths] = useState(6);
    const [dailyCommitment, setDailyCommitment] = useState(2);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [roadmap, setRoadmap] = useState(null);
    
    const [expandedPhase, setExpandedPhase] = useState(0);
    const [checkedActivities, setCheckedActivities] = useState({});

    useEffect(() => {
        if (!roleOptions.length) {
            setRole('');
            return;
        }
        const isCurrentRoleValid = roleOptions.some((r) => r.name === role);
        if (!isCurrentRoleValid) {
            setRole(roleOptions[0].name);
        }
    }, [roleOptions, role]);

    // Persist checked activities to localStorage (user-scoped)
    useEffect(() => {
        if (roadmap) {
            localStorage.setItem(ck('vidyamitra_roadmap_activities'), JSON.stringify(checkedActivities));
        }
    }, [checkedActivities, roadmap, uid]);

    // Initial persistence sync from localStorage (user-scoped)
    useEffect(() => {
        const storedRoadmap = localStorage.getItem(ck('vidyamitra_roadmap'));
        const storedActivities = localStorage.getItem(ck('vidyamitra_roadmap_activities'));
        
        if (storedRoadmap) {
            try {
                const parsed = JSON.parse(storedRoadmap);
                if (validateRoadmapData(parsed)) {
                    setRoadmap(parsed);
                    setRole(parsed.target_role || 'Continuing...');
                    setExpandedPhase(0);
                }
            } catch (err) {
                console.warn('Cleared invalid stored roadmap.', err);
                localStorage.removeItem(ck('vidyamitra_roadmap'));
            }
        }
        
        if (storedActivities) {
            try {
                setCheckedActivities(JSON.parse(storedActivities));
            } catch {
                localStorage.removeItem(ck('vidyamitra_roadmap_activities'));
            }
        }
    }, [uid]);

    // ── Supabase Hydration (cross-device persistence) ──
    useEffect(() => {
        if (!user) return;
        const token = localStorage.getItem('vm_token');
        if (!token) return;
        const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        // Only hydrate if no local roadmap was loaded
        if (!roadmap) {
            axios.get(`${BASE}/api/user-data/latest`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                const data = res.data;
                if (data.roadmap?.phases) {
                    try {
                        const roadmapData = {
                            target_role: data.roadmap.target_role,
                            total_duration: data.roadmap.total_duration,
                            phases: data.roadmap.phases,
                            tips: data.roadmap.tips || [],
                        };
                        const validated = validateRoadmapData(roadmapData);
                        setRoadmap(validated);
                        setRole(validated.target_role || '');
                        setExpandedPhase(0);
                    } catch {
                        // Invalid data, ignore
                    }
                }
            })
            .catch(() => {});
        }
    }, [uid]);

    const generate = async () => {
        if (!role) return;
        setLoading(true);
        setError(null);
        setRoadmap(null);
        setCheckedActivities({});
        localStorage.removeItem(ck('vidyamitra_roadmap'));
        localStorage.removeItem(ck('vidyamitra_roadmap_activities'));
        
        const skillsList = missingSkills.split(',').map(s => s.trim()).filter(Boolean);
        
        try {
            const token = localStorage.getItem('vm_token');
            const res = await axios.post(`${API}/api/roadmap/generate`, {
                target_role: role,
                current_level: currentLevel,
                missing_skills: skillsList.length ? skillsList : undefined,
                timeline_months: months,
                daily_time_commitment: dailyCommitment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const validatedRoadmap = validateRoadmapData(res.data);
            setRoadmap(validatedRoadmap);
            setExpandedPhase(0);
            localStorage.setItem(ck('vidyamitra_roadmap'), JSON.stringify(validatedRoadmap));
        } catch (err) {
            console.error(err);
            setError(err.message === "Invalid response format received from the server." || 
                     err.message.includes("meaningful phases") || 
                     err.message.includes("critical required fields") 
                        ? err.message 
                        : (err.response?.data?.error || 'Failed to generate roadmap. Please check your backend connection.'));
        } finally {
            setLoading(false);
        }
    };

    const toggleActivity = (key) => {
        setCheckedActivities(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleStartOver = () => {
        setRoadmap(null);
        setCheckedActivities({});
        setRole(roleOptions[0]?.name || '');
        localStorage.removeItem(ck('vidyamitra_roadmap'));
        localStorage.removeItem(ck('vidyamitra_roadmap_activities'));
    };

    return (
        <div>
            <div className="page-header" style={{ textAlign: 'center', marginBottom: 40 }}>
                <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <Map size={36} color="var(--accent-primary)" />
                    Learning Roadmap
                </h1>
                <p>Generate a production-ready, personalized learning plan powered by AI</p>
            </div>

            <AnimatePresence mode="wait">
                {loading && (
                    <motion.div key="loading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <SkeletonLoader />
                    </motion.div>
                )}

                {!loading && !roadmap && (
                    <motion.div key="form" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                        {error && (
                            <div className="glass-card" style={{ maxWidth: 650, margin: '0 auto 20px', borderLeft: '4px solid var(--destructive)', background: 'rgba(239, 68, 68, 0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <AlertCircle color="var(--destructive)" size={20} />
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--destructive)' }}>Generation Failed</h4>
                                        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <RoadmapFormSkeleton 
                            role={role} setRole={setRole}
                            currentLevel={currentLevel} setCurrentLevel={setCurrentLevel}
                            missingSkills={missingSkills} setMissingSkills={setMissingSkills}
                            months={months} setMonths={setMonths}
                            dailyCommitment={dailyCommitment} setDailyCommitment={setDailyCommitment}
                            generate={generate} loading={loading}
                            roleOptions={roleOptions}
                        />
                    </motion.div>
                )}

                {!loading && roadmap && (
                    <motion.div key="roadmap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        {/* Header */}
                        <div className="glass-card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                            <div>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>
                                    Roadmap to <span style={{ color: 'var(--accent-primary)' }}>{roadmap.target_role || role}</span>
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {roadmap.total_duration || `${months} months`}</span>
                                    <span>•</span>
                                    <span>{roadmap.phases?.length || 0} phases</span>
                                    {roadmap.cached && <span className="badge badge-cyan" style={{ fontSize: 11 }}>⚡ Cached</span>}
                                </p>
                            </div>
                            <button className="btn btn-secondary" onClick={handleStartOver}>← Start Over</button>
                        </div>

                        {/* Progress */}
                        {roadmap.phases && roadmap.phases.length > 0 && (
                            <ProgressBar roadmap={roadmap} checkedActivities={checkedActivities} />
                        )}

                        {/* Timeline */}
                        <div className="roadmap-timeline" style={{ marginBottom: 32 }}>
                            {roadmap.phases?.map((phase, i) => (
                                <RoadmapPhaseCard 
                                    key={i} phase={phase} i={i} 
                                    expandedPhase={expandedPhase} setExpandedPhase={setExpandedPhase}
                                    checkedActivities={checkedActivities} toggleActivity={toggleActivity}
                                />
                            ))}
                        </div>

                        {/* Tips */}
                        {roadmap.tips && roadmap.tips.length > 0 && (
                            <div className="glass-card" style={{ marginBottom: 24, borderTop: '3px solid var(--amber)' }}>
                                <h3 style={{ fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                    <Lightbulb size={20} color="var(--amber)" /> Learning Tips
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {roadmap.tips.map((t, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
                                            <ArrowRight size={16} style={{ color: 'var(--accent-tertiary)', marginTop: 2, flexShrink: 0 }} />
                                            <span style={{ lineHeight: 1.5 }}>{t}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                    </motion.div>
                )}
            </AnimatePresence>
            
            <style jsx="true">{`
                .resource-link-hover:hover {
                    background: var(--bg-card) !important;
                    border-color: var(--border) !important;
                    transform: translateY(-1px);
                }
            `}</style>
        </div>
    );
}
