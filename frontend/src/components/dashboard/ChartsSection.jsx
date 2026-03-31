import { useState, useMemo } from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const PIE_COLORS = [
  'var(--accent-primary)',
  'var(--cyan)',
  'var(--emerald)',
  'var(--amber)',
  'var(--blue)',
];

export default function ChartsSection({ weeklyProgress, skillDistribution }) {
  const [selectedPoint, setSelectedPoint] = useState(null);

  const chartData = useMemo(() => weeklyProgress, [weeklyProgress]);
  const pieData = useMemo(() => skillDistribution, [skillDistribution]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    return (
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 12,
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
            <span style={{ color: 'var(--text-secondary)' }}>{p.name}:</span>
            <span style={{ fontWeight: 600 }}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const handleChartClick = (data) => {
    if (data?.activePayload) {
      setSelectedPoint(data.activePayload[0]?.payload);
    }
  };

  return (
    <div className="grid-2" style={{ marginBottom: 24 }}>

      {/* Area Chart */}
      <div className="glass-card">
        <h3 className="section-title">
          <TrendingUp size={16} /> Weekly Progress
        </h3>

        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} onClick={handleChartClick} style={{ cursor: 'pointer' }}>
            <defs>
              <linearGradient id="gradScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="week" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="score" name="Score" stroke="var(--accent-primary)" fill="url(#gradScore)" />
            <Area type="monotone" dataKey="skills" name="Skills" stroke="var(--cyan)" fillOpacity={0} />
          </AreaChart>
        </ResponsiveContainer>

        {/* Drill-down on click */}
        {selectedPoint && (
          <div style={{
            marginTop: 10, padding: '8px 14px',
            background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)',
            fontSize: 12, color: 'var(--text-secondary)',
            display: 'flex', gap: 16,
          }}>
            <span><strong>{selectedPoint.week}</strong></span>
            <span>Score: <strong style={{ color: 'var(--accent-tertiary)' }}>{selectedPoint.score}</strong></span>
            <span>Skills: <strong style={{ color: 'var(--cyan)' }}>{selectedPoint.skills}</strong></span>
            <span>Interviews: <strong style={{ color: 'var(--amber)' }}>{selectedPoint.interviews}</strong></span>
          </div>
        )}
      </div>

      {/* Pie Chart */}
      <div className="glass-card">
        <h3 className="section-title">
          <BarChart3 size={16} /> Skill Distribution
        </h3>

        <div style={{ display: 'flex', gap: 24 }}>
          <ResponsiveContainer width="50%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="count" innerRadius={40} outerRadius={75}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
            {pieData.map((s, i) => {
              const pct = s.total > 0 ? Math.round((s.count / s.total) * 100) : 0;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: 2,
                    background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0,
                  }} />
                  <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{s.category}</span>
                  <span style={{ fontWeight: 600 }}>{s.count}/{s.total}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 35 }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}