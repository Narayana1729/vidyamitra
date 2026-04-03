import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, FileText, Brain, Mic, TrendingUp, Award, Code, Zap } from 'lucide-react';
import ScoreCircle from '../ScoreCircle';

const activityIcons = {
  resume: <FileText size={16} />,
  skill: <Brain size={16} />,
  interview: <Mic size={16} />,
  roadmap: <TrendingUp size={16} />,
  placement_prediction: <Award size={16} />,
  archetype_prediction: <Zap size={16} />,
  coding_profile_update: <Code size={16} />,
};

const activityColors = {
  resume: 'var(--accent-primary)',
  skill: 'var(--cyan)',
  interview: 'var(--amber)',
  roadmap: 'var(--emerald)',
  placement_prediction: 'var(--rose)',
  archetype_prediction: 'var(--amber)',
  coding_profile_update: 'var(--cyan)',
};

export default function ActivityFeed({ activity, stats }) {
  const [expanded, setExpanded] = useState(false);
  const displayedActivity = expanded ? activity : activity.slice(0, 3);
  const hasMore = activity.length > 3;

  return (
    <div className="grid-2">
      {/* Key Metrics */}
      <div className="glass-card">
        <h3 className="section-title">
          <Award size={16} /> Key Metrics
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <ScoreCircle score={stats.resume_score} label="Resume" />
          <ScoreCircle score={stats.average_interview_score} label="Interview" color="var(--cyan)" />
          <ScoreCircle score={stats.learning_progress} label="Learning" color="var(--emerald)" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card">
        <h3 className="section-title">
          <Clock size={16} /> Recent Activity
        </h3>

        {activity.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 24,
            color: 'var(--text-muted)', fontSize: 13,
          }}>
            No recent activity
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {displayedActivity.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  display: 'flex', gap: 12,
                  padding: '8px 12px',
                  background: 'var(--bg-glass)',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'background 0.2s ease',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                  background: `color-mix(in srgb, ${activityColors[a.type] || 'var(--accent-primary)'} 15%, transparent)`,
                  color: activityColors[a.type],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {activityIcons[a.type] || <Clock size={16} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{a.action}</div>
                  <small style={{ color: 'var(--text-muted)', fontSize: 11 }}>{a.date}</small>
                </div>
              </motion.div>
            ))}
            {hasMore && (
              <button
                onClick={() => setExpanded(!expanded)}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--accent-primary)', fontSize: 13,
                  cursor: 'pointer', marginTop: 8, padding: 8,
                  fontWeight: 500, transition: 'color 0.2s',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%',
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-light)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
              >
                {expanded ? 'Show Less' : `View All (${activity.length})`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
