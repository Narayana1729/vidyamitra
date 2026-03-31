import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronDown, ChevronUp, TrendingUp, Zap, Target } from 'lucide-react';
import ScoreCircle from '../ScoreCircle';

export default function ReadinessCard({ readiness }) {
  const [expanded, setExpanded] = useState(false);

  const colorMap = {
    ready: 'var(--emerald)',
    almost: 'var(--amber)',
    moderate: 'var(--rose)',
    low: 'var(--rose)',
  };
  const glowMap = {
    ready: 'rgba(16,185,129,0.12)',
    almost: 'rgba(245,158,11,0.12)',
    moderate: 'rgba(244,63,94,0.12)',
    low: 'rgba(244,63,94,0.12)',
  };
  const badgeMap = {
    ready: 'badge-emerald',
    almost: 'badge-amber',
    moderate: 'badge-rose',
    low: 'badge-rose',
  };

  const accentColor = colorMap[readiness.level] || 'var(--rose)';
  const pred = readiness.predicted;

  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        marginBottom: 24,
        border: `1px solid ${accentColor}`,
        boxShadow: `0 0 24px ${glowMap[readiness.level]}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>

        {/* Score Circle */}
        <div style={{ flexShrink: 0 }}>
          <ScoreCircle
            score={readiness.score}
            size={120}
            label="Readiness"
            color={accentColor}
          />
        </div>

        {/* Verdict + Breakdown */}
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Shield size={20} style={{ color: accentColor }} />
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
              color: 'var(--text-primary)',
            }}>
              Placement Readiness
            </h3>
            <span className={`badge ${badgeMap[readiness.level]}`} style={{ fontSize: 11 }}>
              {readiness.target_role}
            </span>
          </div>

          <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: accentColor }}>
            {readiness.verdict}
          </p>

          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
            Estimated readiness: <strong style={{ color: 'var(--text-primary)' }}>{readiness.score}%</strong>
          </p>

          {/* Breakdown bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {readiness.breakdown?.map((b, i) => {
              const barColor = b.score >= 80 ? 'var(--emerald)' : b.score >= 60 ? 'var(--amber)' : 'var(--rose)';
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 80, fontWeight: 500 }}>
                    {b.label}
                  </span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg-tertiary)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${b.score}%` }}
                      transition={{ duration: 0.8, delay: 0.2 * i }}
                      style={{ height: '100%', borderRadius: 3, background: barColor }}
                    />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: barColor, minWidth: 32, textAlign: 'right' }}>
                    {b.score}%
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>({b.weight}%)</span>
                </div>
              );
            })}
          </div>

          {/* Expand toggle */}
          <button
            className="btn btn-ghost"
            onClick={() => setExpanded(!expanded)}
            style={{ marginTop: 10, fontSize: 12, color: 'var(--accent-tertiary)', padding: '4px 8px' }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Hide prediction' : 'Show 2-week prediction'}
          </button>
        </div>
      </div>

      {/* Expanded prediction section */}
      <AnimatePresence>
        {expanded && pred && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              marginTop: 16, padding: 16,
              background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              display: 'flex', gap: 24, flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={16} style={{ color: 'var(--cyan)' }} />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Predicted in {pred.weeks_ahead} weeks</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{pred.predicted_score}%</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} style={{ color: 'var(--amber)' }} />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Avg weekly growth</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: pred.avg_weekly_growth >= 0 ? 'var(--emerald)' : 'var(--rose)' }}>
                    {pred.avg_weekly_growth > 0 ? '+' : ''}{pred.avg_weekly_growth}%
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Target size={16} style={{ color: 'var(--accent-tertiary)' }} />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Confidence</div>
                  <div style={{
                    fontSize: 14, fontWeight: 600,
                    color: pred.confidence === 'high' ? 'var(--emerald)' : pred.confidence === 'medium' ? 'var(--amber)' : 'var(--text-muted)',
                    textTransform: 'capitalize',
                  }}>
                    {pred.confidence}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
