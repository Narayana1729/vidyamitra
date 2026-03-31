import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* ── Fallback data if backend fails ── */
const FALLBACK = {
  stats: {
    resume_score: 72, skills_mastered: 12, total_skills: 20,
    interviews_completed: 5, average_interview_score: 68,
    learning_progress: 60, streak_days: 7,
  },
  readiness: {
    score: 66, level: 'moderate', verdict: "You're NOT ready for SDE roles yet.",
    target_role: 'SDE',
    breakdown: [
      { label: 'Resume', score: 72, weight: 30, icon: 'resume' },
      { label: 'Skill Match', score: 60, weight: 40, icon: 'skill' },
      { label: 'Interview', score: 68, weight: 30, icon: 'interview' },
    ],
    predicted: { predicted_score: 70, weeks_ahead: 2, avg_weekly_growth: 2.0, confidence: 'low', direction: 'improving' },
  },
  trend_analysis: {
    resume: { direction: 'stable', delta: 0, delta_pct: 0, current: 72, previous: 72 },
    skill: { direction: 'stable', delta: 0, delta_pct: 0, current: 60, previous: 60 },
    interview: { direction: 'stable', delta: 0, delta_pct: 0, current: 68, previous: 68 },
    overall_direction: 'mixed',
  },
  insights: [
    { type: 'info', severity: 'medium', message: 'Backend offline — showing cached data', detail: 'Connect to see real-time insights.', metric: 'overall' },
  ],
  recommendations: [
    { action: 'Reconnect to see personalized recommendations', priority: 'medium', category: 'general', reason: 'Backend unavailable' },
  ],
  weak_areas: [],
  focus_area: { label: 'Connect', reason: 'Backend offline', action: 'Start the backend server to see real insights' },
  weekly_progress: [
    { week: 'Week 1', score: 60, skills: 1, interviews: 0 },
    { week: 'Week 2', score: 64, skills: 2, interviews: 1 },
    { week: 'Week 3', score: 68, skills: 1, interviews: 0 },
    { week: 'Week 4', score: 72, skills: 2, interviews: 1 },
  ],
  skill_distribution: [
    { category: 'Frontend', count: 5, total: 7 },
    { category: 'Backend', count: 3, total: 6 },
    { category: 'Database', count: 2, total: 4 },
    { category: 'DevOps', count: 1, total: 3 },
    { category: 'Soft Skills', count: 1, total: 2 },
  ],
  recent_activity: [],
};

/**
 * Fetch dashboard data with retry logic and fallback.
 * @param {string} period - "week" | "month" | "all"
 * @param {number} retries - number of retries on failure
 */
export async function fetchDashboard(period = 'week', retries = 2) {
  let lastError = null;

  for (let i = 0; i <= retries; i++) {
    try {
      const token = localStorage.getItem('vm_token');
      const res = await axios.get(`${API}/api/dashboard/summary`, {
        params: { period },
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000,
      });
      return { data: res.data, fromFallback: false };
    } catch (err) {
      lastError = err;
      if (i < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }

  console.error('Dashboard API failed after retries:', lastError);
  return { data: FALLBACK, fromFallback: true };
}
