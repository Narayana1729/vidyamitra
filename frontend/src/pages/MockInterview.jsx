import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, RotateCcw, Sparkles, ChevronRight, Video, Code, FileText, Cpu, Clock } from 'lucide-react';
import axios from 'axios';
import InterviewPlayer from '../components/interview/InterviewPlayer';

import { getDomainData } from '../utils/domainData';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const INTERVIEW_TYPES = [
    { id: 'technical', name: 'Technical', icon: <Cpu size={20} />, desc: 'Standard technical Q&A' },
    { id: 'behavioral', name: 'Behavioral/HR', icon: <Video size={20} />, desc: 'Situational & cultural fit' },
    { id: 'coding', name: 'Live Coding', icon: <Code size={20} />, desc: 'Write code to solve problems' },
    { id: 'case_study', name: 'Case Study', icon: <FileText size={20} />, desc: 'Solve business scenarios' },
];

export default function MockInterview() {
    const { user } = useAuth();
    const domainData = getDomainData(user?.domain);
    const ROLES = domainData.targetRoles;

    const [step, setStep] = useState('select'); // select | interview | review
    
    // Setup state
    const [selectedRole, setSelectedRole] = useState(ROLES[0].id);
    const [selectedType, setSelectedType] = useState(INTERVIEW_TYPES[0].id);
    const [selectedDifficulty, setSelectedDifficulty] = useState('intermediate');
    
    // Session state
    const [session, setSession] = useState(null);
    const [currentQ, setCurrentQ] = useState(null); // The current question object
    const [isFollowup, setIsFollowup] = useState(false);
    const [questionNumber, setQuestionNumber] = useState(1);
    
    const [loading, setLoading] = useState(false);
    
    // Results & review state
    const [previousFeedback, setPreviousFeedback] = useState(null);
    const [report, setReport] = useState(null);
    const [error, setError] = useState(null);

    // Interview timer
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef(null);

    const startInterview = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('vm_token');
            const res = await axios.post(`${API}/api/interview/start`, {
                role: selectedRole,
                interview_type: selectedType,
                difficulty: selectedDifficulty,
                num_questions: 5
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSession(res.data);
            setCurrentQ(res.data.question);
            setQuestionNumber(1);
            setStep('interview');
            setPreviousFeedback(null);
            setError(null);
            setElapsedTime(0);
            // Start timer
            timerRef.current = setInterval(() => setElapsedTime(t => t + 1), 1000);
        } catch (err) {
            console.error("Start interview failed", err);
            setError(err.response?.data?.detail || "Failed to start interview. Make sure the backend is running.");
        }
        setLoading(false);
    };

    const submitAnswer = async (answerText, codeSnippet = '') => {
        setLoading(true);
        try {
            const token = localStorage.getItem('vm_token');
            const res = await axios.post(`${API}/api/interview/evaluate`, {
                session_id: session.session_id,
                question: currentQ.question,
                answer: answerText,
                is_followup: isFollowup,
                code_snippet: codeSnippet,
                video_url: '' // Future implementation for video uploads
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const data = res.data;
            setPreviousFeedback({
                score: data.score,
                feedback: data.feedback
            });

            if (data.is_finished) {
                // Fetch final report
                const reportRes = await axios.post(`${API}/api/interview/report`, { session_id: session.session_id }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReport(reportRes.data);
                setStep('review');
                // Stop timer
                if (timerRef.current) clearInterval(timerRef.current);
            } else {
                // We have a next question or followup
                setCurrentQ(data.next_question);
                setIsFollowup(data.is_followup_next);
                if (!data.is_followup_next) {
                    setQuestionNumber(prev => prev + 1);
                }
            }
        } catch (err) {
            console.error("Evaluate failed", err);
            setError(err.response?.data?.detail || "Failed to submit answer. Please try again.");
        }
        setLoading(false);
    };

    const reset = () => {
        setStep('select');
        setSession(null);
        setCurrentQ(null);
        setReport(null);
        setPreviousFeedback(null);
        setQuestionNumber(1);
        setIsFollowup(false);
        setError(null);
        setElapsedTime(0);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div>
            <div className="page-header">
                <h1>🎤 Mock Interview</h1>
                <p>Adaptive AI-powered interviews with code execution and behavioral tracking</p>
            </div>

            {/* Error banner */}
            {error && (
                <div className="glass-card" style={{ marginBottom: 20, padding: '12px 20px', borderLeft: '3px solid var(--rose)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--rose)', fontSize: 14 }}>{error}</span>
                    <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
                </div>
            )}

            <AnimatePresence mode="wait">
                {step === 'select' && (
                    <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div className="glass-card" style={{ maxWidth: 700, margin: '0 auto', padding: 32 }}>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, marginBottom: 24 }}>
                                Configure Interview Session
                            </h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Target Role</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                                        {ROLES.map(role => (
                                            <button
                                                key={role.id}
                                                onClick={() => setSelectedRole(role.id)}
                                                style={{
                                                    padding: 16, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', textAlign: 'center',
                                                    background: selectedRole === role.id ? 'rgba(79, 70, 229, 0.1)' : 'var(--bg-glass)',
                                                    border: `2px solid ${selectedRole === role.id ? 'var(--primary)' : 'var(--border)'}`,
                                                    borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ fontSize: '1.5rem', marginBottom: '8px', color: selectedRole === role.id ? 'var(--primary)' : 'var(--text-secondary)' }}>{role.icon}</div>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>{role.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Interview Type</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                                        {INTERVIEW_TYPES.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => setSelectedType(t.id)}
                                                style={{
                                                    padding: 16, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', textAlign: 'center',
                                                    background: selectedType === t.id ? 'rgba(79, 70, 229, 0.1)' : 'var(--bg-glass)',
                                                    border: `2px solid ${selectedType === t.id ? 'var(--primary)' : 'var(--border)'}`,
                                                    borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ color: selectedType === t.id ? 'var(--primary)' : 'var(--text-secondary)' }}>{t.icon}</div>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Difficulty</label>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        {['beginner', 'intermediate', 'advanced'].map(d => (
                                            <button
                                                key={d}
                                                onClick={() => setSelectedDifficulty(d)}
                                                style={{
                                                    flex: 1, padding: '10px 16px', capitalize: 'capitalize',
                                                    background: selectedDifficulty === d ? 'var(--text-primary)' : 'var(--bg-glass)',
                                                    color: selectedDifficulty === d ? 'var(--bg-card)' : 'var(--text-secondary)',
                                                    border: '1px solid var(--border)', borderRadius: 6, fontWeight: 500, cursor: 'pointer'
                                                }}
                                            >
                                                {d.charAt(0).toUpperCase() + d.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button 
                                className="btn btn-primary" 
                                onClick={startInterview} 
                                disabled={loading}
                                style={{ width: '100%', marginTop: 32, padding: 16, fontSize: 16 }}
                            >
                                {loading ? <div className="spinner" /> : <><Sparkles size={18} /> Start Custom Interview</>}
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 'interview' && session && currentQ && (
                    <motion.div key="interview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        {/* Progress Header */}
                        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>
                                {session.interview_type} • {session.difficulty}
                            </span>
                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                Question {questionNumber} of {session.total_questions} {isFollowup && '(Follow-up)'}
                            </span>
                            <div style={{ flex: 1 }}>
                                <div className="progress-bar">
                                    <div className="progress-bar-fill" style={{
                                        width: `${(questionNumber / session.total_questions) * 100}%`,
                                        background: 'var(--accent-gradient)',
                                    }} />
                                </div>
                            </div>
                            <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono, monospace)' }}>
                                <Clock size={14} /> {formatTime(elapsedTime)}
                            </span>
                        </div>

                        {/* Previous Feedback Banner */}
                        {previousFeedback && (
                            <motion.div
                                className="glass-card"
                                style={{ marginBottom: 20, borderLeft: `3px solid ${previousFeedback.score >= 70 ? 'var(--emerald)' : 'var(--amber)'}` }}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Previous Answer Score</span>
                                    <span style={{
                                        fontWeight: 800, fontSize: 16,
                                        color: previousFeedback.score >= 70 ? 'var(--emerald)' : 'var(--amber)'
                                    }}>
                                        {previousFeedback.score}/100
                                    </span>
                                </div>
                                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{previousFeedback.feedback}</p>
                            </motion.div>
                        )}

                        <InterviewPlayer
                            question={currentQ}
                            interviewType={session.interview_type}
                            isFollowup={isFollowup}
                            isLast={questionNumber === session.total_questions && !isFollowup}
                            loading={loading}
                            onSubmit={submitAnswer}
                        />

                    </motion.div>
                )}

                {step === 'review' && report && (
                    <motion.div key="review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="glass-card" style={{ padding: 40, textAlign: 'center', marginBottom: 24, background: 'var(--accent-gradient)', color: '#fff' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 16, fontSize: 32 }}>Interview Completed</h2>
                            <p style={{ fontSize: 16, opacity: 0.9, maxWidth: 600, margin: '0 auto' }}>
                                Here's your final comprehensive review.
                            </p>
                        </div>
                        
                        <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>Overall Performance</h3>
                            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{report.overall_summary}</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                            <div className="glass-card" style={{ borderLeft: '4px solid var(--emerald)' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--emerald)', marginBottom: 16 }}><CheckCircle size={18}/> Key Strengths</h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {(report.key_strengths || []).map((str, i) => (
                                        <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                            <ChevronRight size={16} style={{ color: 'var(--emerald)', marginTop: 2, flexShrink: 0 }} />
                                            <span style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>{str}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="glass-card" style={{ borderLeft: '4px solid var(--amber)' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--amber)', marginBottom: 16 }}><AlertTriangle size={18}/> Areas for Focus</h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {(report.areas_for_focus || []).map((area, i) => (
                                        <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                            <ChevronRight size={16} style={{ color: 'var(--amber)', marginTop: 2, flexShrink: 0 }} />
                                            <span style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>{area}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: 32 }}>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>Recommended Next Steps</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {(report.recommended_next_steps || []).map((s, i) => (
                                    <div key={i} style={{ padding: 16, background: 'var(--bg-glass)', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 15 }}>
                                        {i+1}. {s}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="btn btn-primary" onClick={reset} style={{ marginTop: 24, padding: '14px 24px' }}>
                            <RotateCcw size={16} /> Start New Interview
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
