import { motion } from 'framer-motion';
import { FileText, Brain, Mic, Flame } from 'lucide-react';

const STAT_CONFIG = [
  { key: 'resume_score', label: 'Resume Score', icon: FileText, color: 'var(--accent-primary)', format: (v) => `${v}/100` },
  { key: 'skills', label: 'Skills', icon: Brain, color: 'var(--cyan)', format: (_, s) => `${s.skills_mastered}/${s.total_skills}` },
  { key: 'interviews_completed', label: 'Interviews', icon: Mic, color: 'var(--amber)', format: (v) => v },
  { key: 'streak_days', label: 'Streak', icon: Flame, color: 'var(--rose)', format: (v) => `${v} 🔥` },
];

export default function StatsGrid({ stats, trends }) {
  const getTrend = (key) => {
    if (key === 'resume_score') return trends?.resume;
    if (key === 'skills') return trends?.skill;
    return null;
  };

  return (
    <div className="grid-4" style={{ marginBottom: 24 }}>
      {STAT_CONFIG.map((s, i) => {
        const Icon = s.icon;
        const trend = getTrend(s.key);
        const value = s.format(stats[s.key], stats);

        return (
          <motion.div
            key={s.key}
            className="glass-card stat-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <div className="stat-icon" style={{ color: s.color }}>
              <Icon size={24} />
            </div>
            <div>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{s.label}</div>
              {trend && (
                <div style={{
                  fontSize: 12, fontWeight: 600, marginTop: 2,
                  color: trend.delta >= 0 ? 'var(--emerald)' : 'var(--rose)',
                }}>
                  {trend.delta >= 0 ? '↑' : '↓'} {Math.abs(trend.delta_pct)}%
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
