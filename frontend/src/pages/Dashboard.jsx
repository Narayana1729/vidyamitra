import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, WifiOff, Calendar, FileText, X } from 'lucide-react';
import { fetchDashboard } from '../services/dashboardService';

import ReadinessCard from '../components/dashboard/ReadinessCard';
import StatsGrid from '../components/dashboard/StatsGrid';
import InsightsSection from '../components/dashboard/InsightsSection';
import ChartsSection from '../components/dashboard/ChartsSection';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import DailyPlan from '../components/dashboard/DailyPlan';

const PERIODS = [
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
];

/* ────────────────────────── SKELETON ────────────────────────── */

function DashboardSkeleton() {
  return (
    <div style={{ padding: 0 }}>
      <div className="glass-card skeleton-card" style={{ height: 180, marginBottom: 24 }} />
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card skeleton-card" style={{ height: 90 }} />
        ))}
      </div>
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="glass-card skeleton-card" style={{ height: 300 }} />
        <div className="glass-card skeleton-card" style={{ height: 300 }} />
      </div>
      <div className="grid-2">
        <div className="glass-card skeleton-card" style={{ height: 220 }} />
        <div className="glass-card skeleton-card" style={{ height: 220 }} />
      </div>
    </div>
  );
}

/* ────────────────────────── ERROR STATE ────────────────────────── */

function ErrorState({ error, onRetry }) {
  return (
    <div className="glass-card" style={{
      textAlign: 'center', padding: 48,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'color-mix(in srgb, var(--rose) 12%, transparent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <WifiOff size={24} style={{ color: 'var(--rose)' }} />
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
        Unable to Load Dashboard
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 400 }}>
        {error || 'Could not connect to the server. Using cached data may be available.'}
      </p>
      <button className="btn btn-primary" onClick={onRetry} style={{ marginTop: 8 }}>
        <RefreshCw size={14} /> Try Again
      </button>
    </div>
  );
}

/* ────────────────────────── MAIN DASHBOARD ────────────────────────── */

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromFallback, setFromFallback] = useState(false);
  const [showResume, setShowResume] = useState(false);

  const loadData = useCallback(async (p) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDashboard(p);
      setData(result.data);
      setFromFallback(result.fromFallback);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData(period);
  }, [period, loadData]);

  /* Memoize props to avoid unnecessary re-renders */
  const readiness = useMemo(() => data?.readiness, [data]);
  const stats = useMemo(() => data?.stats, [data]);
  const trends = useMemo(() => data?.trend_analysis, [data]);
  const insights = useMemo(() => data?.insights || [], [data]);
  const recommendations = useMemo(() => data?.recommendations || [], [data]);
  const weakAreas = useMemo(() => data?.weak_areas || [], [data]);
  const focusArea = useMemo(() => data?.focus_area, [data]);
  const weeklyProgress = useMemo(() => data?.weekly_progress || [], [data]);
  const skillDistribution = useMemo(() => data?.skill_distribution || [], [data]);
  const recentActivity = useMemo(() => data?.recent_activity || [], [data]);

  const resumeAnalysis = useMemo(() => data?.resume_analysis, [data]);
  const resumeBuild = useMemo(() => data?.resume_build, [data]);
  const hasResume = !!(resumeAnalysis?.raw_result?.extracted_text || resumeBuild?.resume_data);

  return (
    <div>
      {/* ── HEADER ── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>📊 Progress Dashboard</h1>
          <p>Track your career growth with real-time intelligence</p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {hasResume && (
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowResume(true)}
              style={{ background: 'var(--bg-glass)', borderColor: 'var(--border)' }}
            >
              <FileText size={16} style={{ marginRight: 6 }} /> View My Resume
            </button>
          )}

          {/* Time Period Filter */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', padding: 3, border: '1px solid var(--border)' }}>
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: period === p.key ? 700 : 500,
                fontFamily: 'var(--font-display)',
                background: period === p.key ? 'var(--accent-primary)' : 'transparent',
                color: period === p.key ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.2s ease',
              }}
            >
              {p.label}
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* Fallback banner */}
      {fromFallback && !loading && (
        <div style={{
          padding: '8px 16px', marginBottom: 16,
          background: 'color-mix(in srgb, var(--amber) 10%, transparent)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid color-mix(in srgb, var(--amber) 25%, transparent)',
          fontSize: 12, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <WifiOff size={14} /> Showing cached data — backend is unreachable
          <button className="btn btn-ghost" onClick={() => loadData(period)}
            style={{ marginLeft: 'auto', fontSize: 11, padding: '3px 8px' }}>
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* ── STATES ── */}
      {loading && <DashboardSkeleton />}

      {!loading && error && !data && (
        <ErrorState error={error} onRetry={() => loadData(period)} />
      )}

      {!loading && data && (
        <AnimatePresence mode="wait">
          <motion.div
            key={period}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* 0. Smart Daily To-Do */}
            <DailyPlan />

            {/* 1. Placement Readiness */}
            {readiness && <ReadinessCard readiness={readiness} />}

            {/* 2. Stats Grid */}
            {stats && <StatsGrid stats={stats} trends={trends} />}

            {/* 3. AI Insights + Recommendations */}
            <InsightsSection
              insights={insights}
              recommendations={recommendations}
              focusArea={focusArea}
              weakAreas={weakAreas}
            />

            {/* 4. Charts */}
            <ChartsSection
              weeklyProgress={weeklyProgress}
              skillDistribution={skillDistribution}
            />

            {/* 5. Activity Feed + Key Metrics */}
            <ActivityFeed activity={recentActivity} stats={stats} />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Resume Viewer Modal */}
      {showResume && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <motion.div
            className="glass-card"
            style={{ width: '100%', maxWidth: '800px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <FileText size={24} style={{ color: 'var(--primary)' }} /> 
                My Saved Resume
              </h2>
              <button onClick={() => setShowResume(false)} className="btn btn-ghost" style={{ padding: 4 }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              {resumeAnalysis?.raw_result?.extracted_text ? (
                <div>
                  <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--bg-lighter)', borderRadius: 8, fontSize: 13, borderLeft: '3px solid var(--primary)' }}>
                    This is the raw text extracted from your most recently uploaded resume.
                  </div>
                  {resumeAnalysis.raw_result.extracted_text}
                </div>
              ) : resumeBuild?.resume_data ? (
                <div>
                  <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--bg-lighter)', borderRadius: 8, fontSize: 13, borderLeft: '3px solid var(--primary)' }}>
                    This is the data from your most recently built resume.
                  </div>
                  <pre style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', background: 'var(--bg-darker)', padding: 16, borderRadius: 8, color: 'var(--text-primary)' }}>
                    {JSON.stringify(resumeBuild.resume_data, null, 2)}
                  </pre>
                </div>
              ) : (
                <p>No resume text available. Upload or build a resume to see it here.</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}