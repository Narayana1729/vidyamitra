/**
 * ML Service — Calls VidyaMitra ML prediction endpoints.
 * All endpoints require auth token.
 */
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function authHeaders() {
  const token = localStorage.getItem('vm_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Predict placement probability with SHAP explanations.
 */
export async function predictPlacement(data) {
  const res = await axios.post(`${API}/api/ml/predict-placement`, data, {
    headers: authHeaders(),
    timeout: 15000,
  });
  return res.data;
}

/**
 * Classify student into one of 6 career archetypes.
 */
export async function predictArchetype(data) {
  const res = await axios.post(`${API}/api/ml/career-archetype`, data, {
    headers: authHeaders(),
    timeout: 15000,
  });
  return res.data;
}

/**
 * Classify skills text into best-fit job roles.
 */
export async function predictRole(skillsText) {
  const res = await axios.post(
    `${API}/api/ml/predict-role`,
    { skills_text: skillsText },
    { headers: authHeaders(), timeout: 15000 }
  );
  return res.data;
}

/**
 * Analyze skill portfolio health & market trends.
 */
export async function analyzeSkillHealth(skills, monthsAgo = 0) {
  const res = await axios.post(
    `${API}/api/ml/skill-health`,
    { skills, months_ago: monthsAgo },
    { headers: authHeaders(), timeout: 15000 }
  );
  return res.data;
}

/**
 * Predict readiness timeline from weekly scores.
 */
export async function predictTimeline(weeklyScores) {
  const res = await axios.post(
    `${API}/api/ml/readiness-timeline`,
    { weekly_scores: weeklyScores },
    { headers: authHeaders(), timeout: 15000 }
  );
  return res.data;
}
