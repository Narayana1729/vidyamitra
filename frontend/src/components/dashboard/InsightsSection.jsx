import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb, AlertTriangle, CheckCircle, Info,
  ArrowRight, Target, ChevronDown, ChevronUp,
} from 'lucide-react';

const severityColors = {
  high: 'var(--rose)',
  medium: 'var(--amber)',
  low: 'var(--emerald)',
};

const typeIcons = {
  positive: CheckCircle,
  warning: AlertTriangle,
  info: Info,
};

const priorityBadge = {
  high: 'badge-rose',
  medium: 'badge-amber',
  low: 'badge-emerald',
};

const categoryIcons = {
  resume: '📄',
  skill: '🧠',
  interview: '🎤',
  general: '⚡',
};

export default function InsightsSection({ insights, recommendations, focusArea, weakAreas }) {
  const [expandedInsight, setExpandedInsight] = useState(null);

  return (
    <div style={{ marginBottom: 24 }}>
      <div className="grid-2">

        {/* ── AI Insights ── */}
        <div className="glass-card">
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lightbulb size={16} style={{ color: 'var(--amber)' }} /> AI Insights
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {insights.map((ins, i) => {
              const Icon = typeIcons[ins.type] || Info;
              const isExpanded = expandedInsight === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setExpandedInsight(isExpanded ? null : i)}
                  style={{
                    padding: '10px 14px',
                    background: 'var(--bg-glass)',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: `3px solid ${severityColors[ins.severity]}`,
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                  }}
                  whileHover={{ background: 'var(--bg-glass-hover)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon size={14} style={{ color: severityColors[ins.severity], flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1, fontWeight: 500 }}>
                      {ins.message}
                    </span>
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p style={{
                          fontSize: 12, color: 'var(--text-secondary)',
                          marginTop: 8, lineHeight: 1.5,
                          paddingLeft: 22,
                        }}>
                          {ins.detail}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Weak Areas */}
          {weakAreas.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <p style={{
                fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px',
                color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6,
              }}>
                Weak Areas
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {weakAreas.map((w, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 12, color: 'var(--text-secondary)',
                    padding: '6px 10px', background: 'var(--bg-glass)',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    <span style={{
                      fontWeight: 700, color: w.score < 50 ? 'var(--rose)' : 'var(--amber)',
                      minWidth: 32,
                    }}>
                      {w.score}%
                    </span>
                    <span style={{ flex: 1 }}>{w.suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── What To Do Next ── */}
        <div className="glass-card">
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={16} style={{ color: 'var(--cyan)' }} /> What To Do Next
          </h3>

          {/* Focus Area */}
          {focusArea && (
            <div style={{
              padding: '12px 16px', marginBottom: 14,
              background: 'color-mix(in srgb, var(--accent-primary) 8%, transparent)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid color-mix(in srgb, var(--accent-primary) 20%, transparent)',
            }}>
              <div style={{ fontSize: 11, color: 'var(--accent-tertiary)', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🎯 Your Focus This Week
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                {focusArea.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{focusArea.reason}</div>
              <div style={{ fontSize: 12, color: 'var(--accent-tertiary)', marginTop: 4, fontWeight: 500 }}>
                → {focusArea.action}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  padding: '10px 14px',
                  background: 'var(--bg-glass)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                }}
              >
                <span style={{ fontSize: 16, marginTop: -1 }}>
                  {categoryIcons[rec.category] || '⚡'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {rec.action}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {rec.reason}
                  </div>
                </div>
                <span className={`badge ${priorityBadge[rec.priority]}`} style={{ fontSize: 10, flexShrink: 0 }}>
                  {rec.priority}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
