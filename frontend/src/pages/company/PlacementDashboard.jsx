import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3, Users, TrendingUp, AlertTriangle, CheckCircle, Clock,
    GraduationCap, FileText, Brain, Award, ChevronDown, ChevronUp,
    Target, Activity, Briefcase, Shield
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const READINESS_COLORS = {
    ready: '#10b981',
    in_progress: '#f59e0b',
    at_risk: '#ef4444',
};

const HEATMAP_COLOR = (pct) => {
    if (pct >= 70) return '#10b981';
    if (pct >= 50) return '#22d3ee';
    if (pct >= 30) return '#f59e0b';
    return '#ef4444';
};

/* ─── Skeleton Loader ─── */
function PlacementSkeleton() {
    return (
        <div>
            <div className="glass-card skeleton-card" style={{ height: 160, marginBottom: 24 }} />
            <div className="grid-3" style={{ marginBottom: 24 }}>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="glass-card skeleton-card" style={{ height: 100 }} />
                ))}
            </div>
            <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="glass-card skeleton-card" style={{ height: 300 }} />
                <div className="glass-card skeleton-card" style={{ height: 300 }} />
            </div>
        </div>
    );
}

/* ─── Cohort Readiness Gauge ─── */
function ReadinessGauge({ readiness }) {
    const pct = readiness.overall_readiness_pct;
    const circumference = 2 * Math.PI * 70;
    const strokeDashoffset = circumference * (1 - pct / 100);
    const gaugeColor = pct >= 65 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';

    return (
        <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: 32 }}
        >
            <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
                color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px',
                marginBottom: 20,
            }}>
                Batch Placement Readiness
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
                {/* Main Gauge */}
                <div style={{ position: 'relative', width: 160, height: 160 }}>
                    <svg width="160" height="160" viewBox="0 0 160 160">
                        <circle cx="80" cy="80" r="70" fill="none" stroke="var(--bg-tertiary)" strokeWidth="10" />
                        <motion.circle
                            cx="80" cy="80" r="70" fill="none"
                            stroke={gaugeColor} strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            transform="rotate(-90 80 80)"
                        />
                    </svg>
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span style={{
                            fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800,
                            color: gaugeColor, lineHeight: 1,
                        }}>
                            {pct}%
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                            Ready
                        </span>
                    </div>
                </div>

                {/* Breakdown Bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 220 }}>
                    {[
                        { label: 'Placement Ready', ...readiness.ready, color: READINESS_COLORS.ready, icon: <CheckCircle size={16} /> },
                        { label: 'In Progress', ...readiness.in_progress, color: READINESS_COLORS.in_progress, icon: <Clock size={16} /> },
                        { label: 'At Risk', ...readiness.at_risk, color: READINESS_COLORS.at_risk, icon: <AlertTriangle size={16} /> },
                    ].map((item) => (
                        <div key={item.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: item.color }}>
                                    {item.icon} {item.label}
                                </span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {item.count} ({item.pct}%)
                                </span>
                            </div>
                            <div style={{
                                height: 8, borderRadius: 4, background: 'var(--bg-tertiary)', overflow: 'hidden',
                            }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.pct}%` }}
                                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                                    style={{ height: '100%', borderRadius: 4, background: item.color }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Total Students */}
                <div style={{
                    padding: '20px 28px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)', textAlign: 'center',
                }}>
                    <div style={{
                        fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800,
                        color: 'var(--accent-primary)',
                    }}>
                        {readiness.total_students}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Total Students</div>
                </div>
            </div>
        </motion.div>
    );
}

/* ─── Engagement Stats ─── */
function EngagementStats({ engagement }) {
    const stats = [
        { label: 'Resumes Uploaded', value: engagement.resumes_uploaded, pct: engagement.resumes_pct, icon: <FileText size={20} />, color: '#7c3aed' },
        { label: 'Interviews Done', value: engagement.interviews_completed, pct: engagement.interviews_pct, icon: <Brain size={20} />, color: '#06b6d4' },
        { label: 'Roadmaps Generated', value: engagement.roadmaps_generated, pct: engagement.roadmaps_pct, icon: <Target size={20} />, color: '#10b981' },
        { label: 'Avg ATS Score', value: engagement.avg_ats_score, pct: engagement.avg_ats_score, icon: <Award size={20} />, color: '#f59e0b' },
    ];

    return (
        <div className="grid-4" style={{ marginBottom: 24 }}>
            {stats.map((s, i) => (
                <motion.div
                    key={s.label}
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 14 }}
                >
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: `color-mix(in srgb, ${s.color} 12%, transparent)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: s.color, flexShrink: 0,
                    }}>
                        {s.icon}
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {s.value}{s.label.includes('Score') ? '%' : ''}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

/* ─── Department Cards ─── */
function DepartmentStats({ deptStats }) {
    return (
        <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <GraduationCap size={18} style={{ color: 'var(--accent-tertiary)' }} /> Department Readiness
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {deptStats.map((dept) => {
                    const readyPct = dept.ready_pct;
                    const barColor = readyPct >= 60 ? '#10b981' : readyPct >= 40 ? '#f59e0b' : '#ef4444';
                    return (
                        <div key={dept.department_key} style={{
                            padding: '14px 18px', background: 'var(--bg-glass)',
                            borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 12, height: 12, borderRadius: 3,
                                        background: dept.color,
                                    }} />
                                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600 }}>
                                        {dept.department}
                                    </span>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        ({dept.total_students} students)
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12 }}>
                                    <span style={{ color: '#10b981' }}>✓ {dept.ready_count}</span>
                                    <span style={{ color: '#f59e0b' }}>◐ {dept.in_progress_count}</span>
                                    <span style={{ color: '#ef4444' }}>⚠ {dept.at_risk_count}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    flex: 1, height: 8, borderRadius: 4,
                                    background: 'var(--bg-tertiary)', overflow: 'hidden',
                                }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${readyPct}%` }}
                                        transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                                        style={{ height: '100%', borderRadius: 4, background: barColor }}
                                    />
                                </div>
                                <span style={{
                                    fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
                                    color: barColor, minWidth: 40, textAlign: 'right',
                                }}>
                                    {readyPct}%
                                </span>
                            </div>
                            {/* Top Gaps */}
                            {dept.top_skill_gaps.length > 0 && (
                                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Top gaps:</span>
                                    {dept.top_skill_gaps.slice(0, 3).map(g => (
                                        <span key={g.skill} className="badge" style={{
                                            background: 'color-mix(in srgb, var(--rose) 10%, transparent)',
                                            color: 'var(--rose)', fontSize: 10,
                                        }}>
                                            {g.skill} ({g.coverage_pct}%)
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

/* ─── Skill Heatmap ─── */
function SkillHeatmap({ heatmap, departments }) {
    // Get unique skills and departments
    const skills = [...new Set(heatmap.map(h => h.skill))];
    const depts = [...new Set(heatmap.map(h => h.department))];

    const getValue = (skill, dept) => {
        const item = heatmap.find(h => h.skill === skill && h.department === dept);
        return item ? item.proficiency_pct : 0;
    };

    return (
        <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={18} style={{ color: 'var(--cyan)' }} /> Skill Heatmap Across Departments
            </h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{
                    width: '100%', borderCollapse: 'separate', borderSpacing: 3,
                    fontSize: 12,
                }}>
                    <thead>
                        <tr>
                            <th style={{
                                padding: '8px 12px', textAlign: 'left', fontSize: 11,
                                color: 'var(--text-muted)', fontWeight: 700,
                            }}>Skill</th>
                            {depts.map(d => (
                                <th key={d} style={{
                                    padding: '8px 10px', textAlign: 'center', fontSize: 11,
                                    color: 'var(--text-muted)', fontWeight: 700, minWidth: 72,
                                }}>{d}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {skills.map(skill => (
                            <tr key={skill}>
                                <td style={{
                                    padding: '6px 12px', fontWeight: 500,
                                    color: 'var(--text-secondary)',
                                    whiteSpace: 'nowrap',
                                }}>{skill}</td>
                                {depts.map(dept => {
                                    const val = getValue(skill, dept);
                                    return (
                                        <td key={dept} style={{
                                            padding: 4, textAlign: 'center',
                                        }}>
                                            <div style={{
                                                padding: '6px 8px',
                                                borderRadius: 6,
                                                background: `color-mix(in srgb, ${HEATMAP_COLOR(val)} 20%, transparent)`,
                                                color: HEATMAP_COLOR(val),
                                                fontWeight: 700, fontSize: 12,
                                                fontFamily: 'var(--font-display)',
                                            }}>
                                                {val}%
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'center', fontSize: 11 }}>
                {[
                    { color: '#ef4444', label: '< 30% Low' },
                    { color: '#f59e0b', label: '30-50% Medium' },
                    { color: '#22d3ee', label: '50-70% Good' },
                    { color: '#10b981', label: '> 70% Strong' },
                ].map(l => (
                    <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
                        {l.label}
                    </span>
                ))}
            </div>
        </motion.div>
    );
}

/* ─── Top Skill Gaps ─── */
function TopSkillGaps({ gaps }) {
    return (
        <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
        >
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} style={{ color: 'var(--rose)' }} /> Biggest Skill Gaps (Batch-Wide)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {gaps.slice(0, 10).map((g, i) => (
                    <div key={g.skill} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                        <span style={{
                            fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
                            color: 'var(--text-muted)', minWidth: 20,
                        }}>{i + 1}</span>
                        <span style={{ fontSize: 13, fontWeight: 500, minWidth: 140, color: 'var(--text-secondary)' }}>
                            {g.skill}
                        </span>
                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%', borderRadius: 3,
                                width: `${g.coverage_pct}%`,
                                background: HEATMAP_COLOR(g.coverage_pct),
                                transition: 'width 1s ease',
                            }} />
                        </div>
                        <span style={{
                            fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
                            color: HEATMAP_COLOR(g.coverage_pct), minWidth: 40, textAlign: 'right',
                        }}>
                            {g.coverage_pct}%
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

/* ─── At-Risk Students Table ─── */
function AtRiskStudents({ students }) {
    const [expanded, setExpanded] = useState(false);
    const shown = expanded ? students : students.slice(0, 8);

    return (
        <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={18} style={{ color: 'var(--rose)' }} /> Students Requiring Attention
                <span className="badge" style={{
                    background: 'color-mix(in srgb, var(--rose) 12%, transparent)',
                    color: 'var(--rose)', fontSize: 11, marginLeft: 4,
                }}>{students.length} students</span>
            </h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            {['Student', 'Department', 'Readiness', 'ATS Score', 'Skill Match', 'Resume'].map(h => (
                                <th key={h} style={{
                                    padding: '10px 12px', textAlign: 'left', fontSize: 11,
                                    color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase',
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {shown.map((s, i) => (
                            <tr key={i} style={{
                                borderBottom: '1px solid var(--border)',
                                background: i % 2 === 0 ? 'transparent' : 'var(--bg-glass)',
                            }}>
                                <td style={{ padding: '10px 12px', fontWeight: 500 }}>{s.name}</td>
                                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{s.department}</td>
                                <td style={{ padding: '10px 12px' }}>
                                    <span style={{
                                        fontFamily: 'var(--font-display)', fontWeight: 700,
                                        color: s.readiness_score < 25 ? '#ef4444' : '#f59e0b',
                                    }}>{s.readiness_score}%</span>
                                </td>
                                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{s.ats_score}%</td>
                                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{s.skill_match}%</td>
                                <td style={{ padding: '10px 12px' }}>
                                    {s.resume_uploaded ? (
                                        <span style={{ color: '#10b981', fontSize: 12 }}>✓ Uploaded</span>
                                    ) : (
                                        <span style={{ color: '#ef4444', fontSize: 12 }}>✗ Missing</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {students.length > 8 && (
                <button
                    className="btn btn-ghost"
                    onClick={() => setExpanded(!expanded)}
                    style={{ marginTop: 8, fontSize: 12, width: '100%' }}
                >
                    {expanded ? <><ChevronUp size={14} /> Show Less</> : <><ChevronDown size={14} /> Show All {students.length}</>}
                </button>
            )}
        </motion.div>
    );
}

/* ─── Department Readiness Bar Chart ─── */
function DeptBarChart({ deptStats }) {
    const data = deptStats.map(d => ({
        name: d.department,
        'ATS Score': d.avg_ats_score,
        'Skill Match': d.avg_skill_match,
        'Interview Score': d.avg_interview_score,
    }));

    return (
        <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
        >
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={18} style={{ color: 'var(--accent-primary)' }} /> Department Performance Comparison
            </h3>
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} domain={[0, 100]} />
                    <Tooltip
                        contentStyle={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 8, fontSize: 12,
                        }}
                    />
                    <Bar dataKey="ATS Score" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Skill Match" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Interview Score" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PLACEMENT DASHBOARD
   ═══════════════════════════════════════════════════════════════ */

export default function PlacementDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('vm_token');
                const res = await axios.get(`${API}/api/placement/analytics`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setData(res.data);
            } catch (err) {
                console.error('Placement analytics error:', err);
                setError(err.message);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div>
            {/* Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1>📊 Placement Analytics</h1>
                    <p>Cohort-level readiness insights and actionable analytics for placement teams</p>
                </div>
                {data && (
                    <div style={{
                        padding: '8px 16px', background: 'var(--bg-glass)',
                        borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                        fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                        <Briefcase size={14} /> {data.batch_name} · {data.total_students} students · {data.departments.length} departments
                    </div>
                )}
            </div>

            {loading && <PlacementSkeleton />}

            {error && !data && (
                <div className="glass-card" style={{ textAlign: 'center', padding: 48 }}>
                    <AlertTriangle size={32} style={{ color: 'var(--rose)', marginBottom: 12 }} />
                    <h3>Failed to Load Analytics</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{error}</p>
                </div>
            )}

            {!loading && data && (
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* 1. Cohort Readiness Gauge */}
                        <ReadinessGauge readiness={data.readiness} />

                        <div style={{ height: 24 }} />

                        {/* 2. Engagement Stats */}
                        <EngagementStats engagement={data.engagement} />

                        {/* 3. Department Bar Chart + Department Stats */}
                        <div className="grid-2" style={{ marginBottom: 24 }}>
                            <DeptBarChart deptStats={data.department_stats} />
                            <DepartmentStats deptStats={data.department_stats} />
                        </div>

                        {/* 4. Skill Heatmap */}
                        <div style={{ marginBottom: 24 }}>
                            <SkillHeatmap heatmap={data.skill_heatmap} departments={data.departments} />
                        </div>

                        {/* 5. Top Skill Gaps + At-Risk Students */}
                        <div className="grid-2" style={{ marginBottom: 24 }}>
                            <TopSkillGaps gaps={data.top_skill_gaps} />
                            <AtRiskStudents students={data.at_risk_students} />
                        </div>
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
}
