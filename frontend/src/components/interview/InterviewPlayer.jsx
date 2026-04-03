import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { Sparkles, CameraOff, AlertTriangle, Play, Terminal, Send } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';

const MAX_ATTEMPTS = 3;
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function InterviewPlayer({ question, interviewType, isFollowup, isLast, loading, onSubmit }) {
    const [answer, setAnswer] = useState('');
    const [code, setCode] = useState('// Write your solution here\n\n');
    const [stream, setStream] = useState(null);
    const [language, setLanguage] = useState('javascript');

    // Coding round: attempts & output
    const [runsUsed, setRunsUsed] = useState(0);
    const [runOutput, setRunOutput] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [stdin, setStdin] = useState('');  // Test input for code

    // AI Proctoring States
    const [model, setModel] = useState(null);
    const [warning, setWarning] = useState('');
    const [isModelLoading, setIsModelLoading] = useState(false);

    const videoRef = useRef(null);
    const requestRef = useRef();

    // Reset attempts when question changes
    useEffect(() => {
        setRunsUsed(0);
        setRunOutput(null);
        setAnswer('');
        setCode('// Write your solution here\n\n');
        setStdin('');
    }, [question?.question]);

    // 1. Setup Camera and Load TF Model
    useEffect(() => {
        let active = true;

        const setup = async () => {
            try {
                const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                if (!active) {
                    s.getTracks().forEach(t => t.stop());
                    return;
                }
                setStream(s);
                if (videoRef.current) videoRef.current.srcObject = s;

                setIsModelLoading(true);
                await tf.ready();
                const loadedModel = await cocossd.load();
                if (!active) return;
                setModel(loadedModel);
                setIsModelLoading(false);
            } catch (err) {
                console.log('Camera/Model setup failed:', err);
                setIsModelLoading(false);
            }
        };

        if (interviewType === 'behavioral') {
            setup();
        } else {
            stopCamera();
        }

        return () => {
            active = false;
            stopCamera();
        };
    }, [interviewType]);

    // 2. Continuous Proctoring Video Loop
    useEffect(() => {
        if (!model || !stream || interviewType !== 'behavioral') return;

        const loop = async () => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
                try {
                    const predictions = await model.detect(videoRef.current);
                    let foundPhone = false;
                    let personCount = 0;

                    predictions.forEach(p => {
                        if (p.class === 'cell phone') foundPhone = true;
                        if (p.class === 'person') personCount++;
                    });

                    if (foundPhone) {
                        setWarning('🚨 Cell phone detected! This is a proctoring violation.');
                    } else if (personCount === 0) {
                        setWarning('⚠️ No face detected. Please stay in frame.');
                    } else if (personCount > 1) {
                        setWarning('🚨 Multiple people detected!');
                    } else {
                        setWarning('');
                    }
                } catch (e) {
                    console.error('Detection error:', e);
                }
            }
            requestRef.current = requestAnimationFrame(loop);
        };

        loop();
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [model, stream, interviewType]);

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            setStream(null);
        }
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };

    // ── Run Code via backend /api/code/run ──
    const handleRunCode = async () => {
        setIsRunning(true);
        setRunOutput(null);

        try {
            const res = await fetch(`${API}/api/code/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language,
                    code,
                    stdin: stdin || '',
                }),
            });

            const data = await res.json();
            setRunOutput({
                success: data.success,
                output: data.output || '(No output)',
            });
        } catch {
            // Fallback: local JS execution if backend unreachable
            if (language === 'javascript') {
                const logs = [];
                const origLog = console.log;
                console.log = (...args) => logs.push(args.map(a => {
                    try { return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a); }
                    catch { return String(a); }
                }).join(' '));
                try {
                     
                    const fn = new Function(code);
                    const result = fn();
                    if (result !== undefined) logs.push(String(result));
                    setRunOutput({ success: true, output: logs.join('\n') || '(No output)' });
                } catch (err) {
                    setRunOutput({ success: false, output: err.message });
                }
                console.log = origLog;
            } else {
                setRunOutput({ success: false, output: 'Could not reach the code execution server.' });
            }
        }

        setIsRunning(false);

        // Track runs and auto-submit on 3rd run
        const newRunCount = runsUsed + 1;
        setRunsUsed(newRunCount);
        if (newRunCount >= MAX_ATTEMPTS) {
            // Auto-submit after a brief delay so user can see output
            setTimeout(() => {
                onSubmit(code, code);
            }, 1500);
        }
    };

    // (Submit button removed — auto-submits on 3rd run)

    // ── Submit Text Answer (non-coding) ──
    const handleSubmitText = () => {
        if (!answer.trim()) return;
        onSubmit(answer, '');
        setAnswer('');
    };

    const runsRemaining = MAX_ATTEMPTS - runsUsed;
    const isCoding = interviewType === 'coding';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Question Section */}
            <div className="glass-card" style={{ padding: 24, borderLeft: '4px solid var(--primary)' }}>
                {isFollowup && <span className="badge badge-amber" style={{ marginBottom: 12 }}>Follow-up Question</span>}
                <span className="badge badge-cyan" style={{ marginBottom: 12, marginLeft: isFollowup ? 8 : 0 }}>
                    {question.category || 'Topic'}
                </span>
                {isCoding && (
                    <span className="badge badge-purple" style={{ marginBottom: 12, marginLeft: 8 }}>
                        {runsRemaining} run{runsRemaining !== 1 ? 's' : ''} remaining
                    </span>
                )}
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, lineHeight: 1.5 }}>
                    {question.question}
                </h3>
            </div>

            {/* — CODING MODE: Full-width code editor with run/submit — */}
            {isCoding && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Editor toolbar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <select
                                value={language}
                                onChange={e => setLanguage(e.target.value)}
                                style={{
                                    padding: '6px 12px', background: 'var(--bg-glass)', border: '1px solid var(--border)',
                                    borderRadius: 6, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer'
                                }}
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="typescript">TypeScript</option>
                            </select>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                Use <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: 4 }}>
                                    {language === 'python' ? 'print()' : 'console.log()'}
                                </code> to see output
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {/* Attempt indicators */}
                            {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                                <div key={i} style={{
                                    width: 10, height: 10, borderRadius: '50%',
                                    background: i < runsUsed ? 'var(--rose)' : 'var(--emerald)',
                                    opacity: i < runsUsed ? 0.5 : 1,
                                    transition: 'all 0.3s',
                                }} />
                            ))}
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
                                {runsRemaining}/{MAX_ATTEMPTS}
                            </span>
                        </div>
                    </div>

                    {/* Code editor */}
                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: 10 }}>
                        <div style={{
                            padding: '8px 16px', background: '#1e1e1e', color: '#9ca3af',
                            fontSize: 12, fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <span>Code Editor</span>
                            <span style={{ fontSize: 11 }}>{language}</span>
                        </div>
                        <Editor
                            height="380px"
                            language={language}
                            theme="vs-dark"
                            value={code}
                            onChange={(val) => setCode(val || '')}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: 'on',
                                padding: { top: 12 },
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                            }}
                        />
                    </div>

                    {/* Stdin / Test Input */}
                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden', borderRadius: 8 }}>
                        <div style={{
                            padding: '6px 16px', background: 'var(--bg-tertiary)',
                            fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <span>📥 Test Input (stdin)</span>
                            <span style={{ fontSize: 11, fontWeight: 400 }}>One value per line — used by input() / cin / Scanner</span>
                        </div>
                        <textarea
                            value={stdin}
                            onChange={e => setStdin(e.target.value)}
                            placeholder={language === 'python' ? 'e.g.\n5\nhello world\napple' : 'e.g.\n5\nhello'}
                            style={{
                                width: '100%', minHeight: 60, maxHeight: 120, padding: '10px 16px',
                                fontSize: 13, fontFamily: 'var(--font-mono, monospace)',
                                background: 'var(--bg-card)', color: 'var(--text-secondary)',
                                border: 'none', outline: 'none', resize: 'vertical',
                            }}
                        />
                    </div>

                    {/* Output panel */}
                    {runOutput && (
                        <div className="glass-card" style={{
                            padding: 0, overflow: 'hidden',
                            border: `1px solid ${runOutput.success ? 'var(--emerald)' : 'var(--rose)'}30`,
                        }}>
                            <div style={{
                                padding: '8px 16px',
                                background: runOutput.success ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                                fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
                                color: runOutput.success ? 'var(--emerald)' : 'var(--rose)',
                            }}>
                                <Terminal size={14} />
                                {runOutput.success ? 'Output' : 'Error'}
                            </div>
                            <pre style={{
                                margin: 0, padding: '12px 16px', fontSize: 13,
                                fontFamily: 'var(--font-mono, "Fira Code", monospace)',
                                color: runOutput.success ? 'var(--text-secondary)' : 'var(--rose)',
                                background: 'var(--bg-card)', whiteSpace: 'pre-wrap',
                                maxHeight: 160, overflow: 'auto',
                            }}>
                                {runOutput.output}
                            </pre>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            className="btn btn-secondary"
                            onClick={handleRunCode}
                            disabled={isRunning || loading || runsRemaining <= 0 || !code.trim()}
                            style={{ flex: 1, padding: '14px 20px', fontSize: 15 }}
                        >
                            {isRunning ? (
                                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Running...</>
                            ) : runsRemaining <= 0 ? (
                                <><Sparkles size={16} /> Runs Exhausted</>
                            ) : (
                                <><Play size={16} /> Run Code ({runsRemaining} left)</>
                            )}
                        </button>
                        
                        <button
                            className="btn btn-primary"
                            onClick={() => onSubmit(code, code)}
                            disabled={loading || isRunning || !code.trim()}
                            style={{ flex: 1, padding: '14px 20px', fontSize: 15 }}
                        >
                            {loading ? (
                                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Submitting...</>
                            ) : (
                                <><Send size={16} /> Submit Code</>
                            )}
                        </button>
                    </div>

                    {/* Auto-submit notice */}
                    {runsRemaining === 1 && (
                        <div style={{
                            padding: '10px 16px', background: 'rgba(251,191,36,0.08)',
                            border: '1px solid rgba(251,191,36,0.25)', borderRadius: 8,
                            fontSize: 13, color: 'var(--amber)', textAlign: 'center',
                        }}>
                            ⚠️ Next run is your last — your code will be automatically submitted for evaluation.
                        </div>
                    )}

                    {/* Submitted notice */}
                    {runsRemaining <= 0 && (
                        <div style={{
                            padding: '12px 16px', background: 'rgba(16,185,129,0.06)',
                            border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8,
                            fontSize: 13, color: 'var(--emerald)', textAlign: 'center',
                        }}>
                            ✅ All {MAX_ATTEMPTS} runs used — your code has been submitted for AI evaluation.
                        </div>
                    )}
                </div>
            )}

            {/* — NON-CODING MODE: Text + optional video proctoring — */}
            {!isCoding && (
                <div style={{ display: 'grid', gridTemplateColumns: interviewType === 'behavioral' ? '1fr 1fr' : '1fr', gap: 20 }}>
                    {/* Behavioral: camera panel */}
                    {interviewType === 'behavioral' && (
                        <div className="glass-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', height: 400, position: 'relative' }}>
                            {warning && (
                                <div style={{
                                    position: 'absolute', top: 32, left: '50%', transform: 'translateX(-50%)',
                                    background: 'rgba(239, 68, 68, 0.9)', color: '#fff', padding: '8px 16px', borderRadius: 8,
                                    display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, zIndex: 10,
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)', whiteSpace: 'nowrap'
                                }}>
                                    <AlertTriangle size={16} />
                                    {warning}
                                </div>
                            )}
                            <div style={{ width: '100%', height: '100%', background: '#000', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {stream ? (
                                    <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ color: '#666', textAlign: 'center' }}>
                                        <CameraOff size={48} style={{ margin: '0 auto', marginBottom: 12 }} />
                                        <p>Camera access denied or disabled...</p>
                                    </div>
                                )}
                            </div>
                            {isModelLoading && (
                                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <div className="spinner" style={{ width: 12, height: 12, animationDuration: '1s' }} /> Initializing AI Proctoring...
                                </div>
                            )}
                            {model && !isModelLoading && (
                                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--emerald)', textAlign: 'center' }}>
                                    ✓ AI Proctoring Active
                                </div>
                            )}
                        </div>
                    )}

                    {/* Text answer */}
                    <div style={{ display: 'flex', flexDirection: 'column', height: interviewType === 'behavioral' ? 400 : 'auto' }}>
                        <textarea
                            className="interview-textarea glass-card"
                            placeholder="Type your answer here..."
                            value={answer}
                            onChange={e => setAnswer(e.target.value)}
                            style={{ flex: 1, minHeight: 200, padding: 20, fontSize: 15, resize: 'none', marginBottom: 16 }}
                        />
                        {/* Speech-to-text tip */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 14px', marginBottom: 12,
                            background: 'color-mix(in srgb, var(--cyan) 6%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--cyan) 15%, transparent)',
                            borderRadius: 8, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5,
                        }}>
                            <span style={{ fontSize: 18, flexShrink: 0 }}>🎙️</span>
                            <span>
                                <strong style={{ color: 'var(--cyan)' }}>Want to speak your answer?</strong>{' '}
                                Use your built-in speech-to-text — press{' '}
                                <kbd style={{
                                    padding: '2px 6px', background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border)', borderRadius: 4,
                                    fontFamily: 'var(--font-primary)', fontSize: 11, fontWeight: 600,
                                    color: 'var(--text-primary)',
                                }}>Fn + F5</kbd>{' '}
                                on Mac or{' '}
                                <kbd style={{
                                    padding: '2px 6px', background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border)', borderRadius: 4,
                                    fontFamily: 'var(--font-primary)', fontSize: 11, fontWeight: 600,
                                    color: 'var(--text-primary)',
                                }}>Win + H</kbd>{' '}
                                on Windows, then start speaking.
                            </span>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={handleSubmitText}
                            disabled={loading || !answer.trim()}
                            style={{ padding: '14px 24px', fontSize: 16 }}
                        >
                            {loading ? (
                                <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Evaluating...</>
                            ) : isLast ? (
                                <><Sparkles size={18} /> Submit & Finish</>
                            ) : (
                                <><Send size={18} /> Submit Answer</>
                            )}
                        </button>
                        {warning && interviewType === 'behavioral' && (
                            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--amber)', textAlign: 'center' }}>
                                Submitting while proctoring warnings are active may flag your interview.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
