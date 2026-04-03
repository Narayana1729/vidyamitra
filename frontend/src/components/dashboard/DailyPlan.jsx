import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Circle, RefreshCw, Target, Clock, Flame,
  Code2, BookOpen, FileText, Send, Mic, Lightbulb, ChevronDown,
  ChevronUp, Calendar, Zap, X,
} from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const CATEGORY_CONFIG = {
  coding: { icon: Code2, color: '#f89f1b', label: 'Coding' },
  learning: { icon: BookOpen, color: '#8b5cf6', label: 'Learning' },
  resume: { icon: FileText, color: '#06b6d4', label: 'Resume' },
  apply: { icon: Send, color: '#10b981', label: 'Apply' },
  interview: { icon: Mic, color: '#ef4444', label: 'Interview' },
};

const URGENCY_CONFIG = {
  low: { color: 'var(--emerald)', label: 'On Track', bg: 'color-mix(in srgb, var(--emerald) 10%, transparent)' },
  medium: { color: 'var(--amber)', label: 'Pick Up Pace', bg: 'color-mix(in srgb, var(--amber) 10%, transparent)' },
  high: { color: 'var(--rose)', label: 'Urgent', bg: 'color-mix(in srgb, var(--rose) 10%, transparent)' },
};

function GoalModal({ onClose, onSave }) {
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSave = () => {
    if (!goal.trim() || !deadline) return;
    onSave(goal.trim(), deadline);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <motion.div
        className="glass-card modal-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ width: '100%', maxWidth: 440 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={20} style={{ color: 'var(--accent-primary)' }} /> Set Your Goal
          </h3>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 4 }}><X size={18} /></button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            CAREER GOAL
          </label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., SDE Internship at FAANG"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'var(--bg-glass)',
              color: 'var(--text-primary)', fontSize: 14, outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            TARGET DEADLINE
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'var(--bg-glass)',
              color: 'var(--text-primary)', fontSize: 14, outline: 'none',
            }}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!goal.trim() || !deadline}
          style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 700 }}
        >
          <Zap size={16} style={{ marginRight: 6 }} /> Save Goal & Generate Plan
        </button>
      </motion.div>
    </div>
  );
}

export default function DailyPlan() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);

  const fetchPlan = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const token = localStorage.getItem('vm_token');
      const res = await axios.get(`${API}/api/daily-plan/today`, {
        params: { refresh },
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000,
      });
      setPlan(res.data);
      setCompletedTasks(res.data?.completed_tasks || []);
    } catch (err) {
      console.error('Daily plan fetch failed:', err);
      // Show fallback plan
      setPlan({
        greeting: "Good morning! Set a goal to get your personalized daily plan.",
        focus_theme: "Getting Started",
        urgency: "low",
        tasks: [
          { id: 1, category: "coding", task: "Solve 2 LeetCode problems", detail: "Build your coding foundation", priority: "high", est_minutes: 40 },
          { id: 2, category: "resume", task: "Update your resume with recent projects", detail: "A strong resume opens doors", priority: "medium", est_minutes: 25 },
          { id: 3, category: "learning", task: "Learn one new concept from your roadmap", detail: "Continuous learning compounds", priority: "medium", est_minutes: 30 },
        ],
        pro_tip: "Set your career goal to get AI-personalized daily plans!",
        estimated_total_minutes: 95,
        from_cache: false,
      });
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  const handleComplete = async (taskId) => {
    // Only allow completing (not un-completing), matching backend behavior
    if (completedTasks.includes(taskId)) return;
    const newCompleted = [...completedTasks, taskId];
    setCompletedTasks(newCompleted);

    try {
      const token = localStorage.getItem('vm_token');
      await axios.post(`${API}/api/daily-plan/complete-task`, { task_id: taskId }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
    } catch (err) {
      console.error('Task complete failed:', err);
    }
  };

  const handleSaveGoal = async (goal, deadline) => {
    try {
      const token = localStorage.getItem('vm_token');
      await axios.post(`${API}/api/daily-plan/set-goal`, { goal, deadline }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      fetchPlan(true);
    } catch (err) {
      console.error('Goal save failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="glass-card skeleton-card" style={{ height: 200, marginBottom: 24 }} />
    );
  }

  if (!plan) return null;

  const tasks = plan.tasks || [];
  const totalTasks = tasks.length;
  const completedCount = completedTasks.length;
  const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  const urgencyConf = URGENCY_CONFIG[plan.urgency] || URGENCY_CONFIG.low;

  return (
    <>
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: 0, marginBottom: 24, overflow: 'hidden',
          borderTop: `3px solid ${urgencyConf.color}`,
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ flex: '1 1 200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
              <Flame size={18} style={{ color: urgencyConf.color }} />
              <h3 style={{ margin: 0, fontSize: 16, fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                Today's Action Plan
              </h3>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                background: urgencyConf.bg, color: urgencyConf.color,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {urgencyConf.label}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {plan.greeting}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className="btn btn-ghost"
              onClick={() => setShowGoalModal(true)}
              style={{ padding: '6px 10px', fontSize: 11 }}
              title="Set Goal"
            >
              <Target size={14} />
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => fetchPlan(true)}
              disabled={refreshing}
              style={{ padding: '6px 10px', fontSize: 11 }}
              title="Regenerate"
            >
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            </button>
          </div>
        </div>

        {/* Focus Theme */}
        {plan.focus_theme && (
          <div style={{
            margin: '12px 24px 0', padding: '8px 14px', borderRadius: 'var(--radius-sm)',
            background: 'color-mix(in srgb, var(--accent-primary) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent-primary) 20%, transparent)',
            fontSize: 12, color: 'var(--accent-primary)', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Target size={13} /> Focus: {plan.focus_theme}
          </div>
        )}

        {/* Progress Bar */}
        <div style={{ padding: '12px 24px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
            <span>{completedCount}/{totalTasks} tasks done</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} /> ~{plan.estimated_total_minutes || 90} min
            </span>
          </div>
          <div style={{ height: 4, borderRadius: 4, background: 'var(--bg-lighter)', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5 }}
              style={{
                height: '100%', borderRadius: 4,
                background: progressPct >= 100 ? 'var(--emerald)' : 'var(--accent-primary)',
              }}
            />
          </div>
        </div>

        {/* Task List */}
        <div style={{ padding: '12px 24px 16px' }}>
          <AnimatePresence>
            {tasks.map((task, idx) => {
              const isCompleted = completedTasks.includes(task.id);
              const catConf = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.coding;
              const CatIcon = catConf.icon;

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  onClick={() => handleComplete(task.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '10px 12px', marginBottom: 6, borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: isCompleted ? 'color-mix(in srgb, var(--emerald) 6%, transparent)' : 'transparent',
                    opacity: isCompleted ? 0.65 : 1,
                  }}
                  onMouseEnter={(e) => { if (!isCompleted) e.currentTarget.style.background = 'var(--bg-lighter)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = isCompleted ? 'color-mix(in srgb, var(--emerald) 6%, transparent)' : 'transparent'; }}
                >
                  {/* Checkbox */}
                  <div style={{ marginTop: 2, flexShrink: 0 }}>
                    {isCompleted
                      ? <CheckCircle2 size={18} style={{ color: 'var(--emerald)' }} />
                      : <Circle size={18} style={{ color: 'var(--text-muted)' }} />
                    }
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                      textDecoration: isCompleted ? 'line-through' : 'none',
                      marginBottom: 2,
                    }}>
                      {task.task}
                    </div>
                    {task.detail && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {task.detail}
                      </div>
                    )}
                  </div>

                  {/* Meta */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 8,
                      background: `color-mix(in srgb, ${catConf.color} 12%, transparent)`,
                      color: catConf.color,
                    }}>
                      {catConf.label}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {task.est_minutes}m
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Pro Tip */}
        {plan.pro_tip && (
          <div style={{
            padding: '12px 24px', borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic',
            background: 'color-mix(in srgb, var(--accent-primary) 3%, transparent)',
          }}>
            <Lightbulb size={14} style={{ color: 'var(--amber)', flexShrink: 0 }} />
            {plan.pro_tip}
          </div>
        )}
      </motion.div>

      {/* Goal Modal */}
      {showGoalModal && (
        <GoalModal
          onClose={() => setShowGoalModal(false)}
          onSave={handleSaveGoal}
        />
      )}
    </>
  );
}
