import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2, Github, Code2, Award, Loader2, RefreshCw,
  Star, GitFork, Trophy, Zap, ChevronRight, AlertCircle,
  CheckCircle2, TrendingUp, Braces, Terminal,
} from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const PLATFORMS = [
  { key: 'leetcode', label: 'LeetCode', icon: Code2, color: '#f89f1b', placeholder: 'e.g. neal_wu' },
  { key: 'codeforces', label: 'Codeforces', icon: Terminal, color: '#1890ff', placeholder: 'e.g. tourist' },
  { key: 'github', label: 'GitHub', icon: Github, color: '#8b5cf6', placeholder: 'e.g. torvalds' },
  { key: 'hackerrank', label: 'HackerRank', icon: Award, color: '#00ea64', placeholder: 'e.g. hr_username' },
];

function PlatformInput({ platform, value, onChange }) {
  const Icon = platform.icon;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', borderRadius: 'var(--radius-md)',
      background: 'var(--bg-glass)', border: '1px solid var(--border)',
      transition: 'border-color 0.2s',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 'var(--radius-sm)',
        background: `color-mix(in srgb, ${platform.color} 15%, transparent)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={20} style={{ color: platform.color }} />
      </div>
      <div style={{ flex: 1 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {platform.label}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={platform.placeholder}
          style={{
            width: '100%', padding: '6px 0', border: 'none', outline: 'none',
            background: 'transparent', color: 'var(--text-primary)',
            fontSize: 14, fontFamily: 'var(--font-body)',
          }}
        />
      </div>
    </div>
  );
}

function ScoreRing({ score, size = 120, label }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'var(--emerald)' : score >= 60 ? 'var(--amber)' : score >= 35 ? 'var(--orange, #f97316)' : 'var(--rose)';

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth="6" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div style={{ marginTop: -size / 2 - 16, position: 'relative', textAlign: 'center' }}>
        <div style={{ fontSize: size / 3.5, fontWeight: 800, fontFamily: 'var(--font-display)', color }}>
          {score}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>/100</div>
      </div>
      {label && <div style={{ marginTop: size / 2 - 20, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</div>}
    </div>
  );
}

function LeetCodeCard({ data }) {
  if (data?.error) return <ErrorCard platform="LeetCode" error={data.error} color="#f89f1b" />;
  return (
    <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Code2 size={20} style={{ color: '#f89f1b' }} />
        <h3 style={{ margin: 0, fontSize: 16, fontFamily: 'var(--font-display)' }}>LeetCode</h3>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>@{data.username}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Easy', count: data.easy, color: 'var(--emerald)' },
          { label: 'Medium', count: data.medium, color: 'var(--amber)' },
          { label: 'Hard', count: data.hard, color: 'var(--rose)' },
        ].map(d => (
          <div key={d.label} style={{
            textAlign: 'center', padding: '12px 8px', borderRadius: 'var(--radius-sm)',
            background: `color-mix(in srgb, ${d.color} 8%, transparent)`,
            border: `1px solid color-mix(in srgb, ${d.color} 20%, transparent)`,
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: d.color, fontFamily: 'var(--font-display)' }}>{d.count}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
        <span>Total: <strong>{data.total_solved}</strong></span>
        {data.contest_rating > 0 && <span>Contest: <strong>{data.contest_rating}</strong></span>}
        {data.contests_attended > 0 && <span>Contests: <strong>{data.contests_attended}</strong></span>}
      </div>
    </motion.div>
  );
}

function CodeforcesCard({ data }) {
  if (data?.error) return <ErrorCard platform="Codeforces" error={data.error} color="#1890ff" />;
  const rankColors = {
    'newbie': '#808080', 'pupil': '#00a500', 'specialist': '#03a89e',
    'expert': '#0000ff', 'candidate master': '#a0a', 'master': '#ff8c00',
    'international master': '#ff8c00', 'grandmaster': '#ff0000',
  };
  const rankColor = rankColors[data.rank?.toLowerCase()] || 'var(--text-primary)';

  return (
    <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Terminal size={20} style={{ color: '#1890ff' }} />
        <h3 style={{ margin: 0, fontSize: 16, fontFamily: 'var(--font-display)' }}>Codeforces</h3>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>@{data.username}</span>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-display)', color: rankColor }}>{data.rating || 'Unrated'}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: rankColor, textTransform: 'capitalize' }}>{data.rank}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
        <span>Max: <strong>{data.max_rating}</strong></span>
        <span>Contests: <strong>{data.contests_count}</strong></span>
      </div>
    </motion.div>
  );
}

function GitHubCard({ data }) {
  if (data?.error) return <ErrorCard platform="GitHub" error={data.error} color="#8b5cf6" />;
  return (
    <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Github size={20} style={{ color: '#8b5cf6' }} />
        <h3 style={{ margin: 0, fontSize: 16, fontFamily: 'var(--font-display)' }}>GitHub</h3>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>@{data.username}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Repos', value: data.public_repos, icon: Braces },
          { label: 'Stars', value: data.total_stars, icon: Star },
          { label: 'Forks', value: data.total_forks, icon: GitFork },
        ].map(d => (
          <div key={d.label} style={{ textAlign: 'center', padding: '10px 6px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-lighter)' }}>
            <d.icon size={14} style={{ color: 'var(--text-muted)', marginBottom: 4 }} />
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{d.value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.label}</div>
          </div>
        ))}
      </div>
      {data.top_languages?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {data.top_languages.slice(0, 6).map(l => (
            <span key={l.language} style={{
              padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)',
              color: 'var(--accent-primary)', border: '1px solid color-mix(in srgb, var(--accent-primary) 25%, transparent)',
            }}>
              {l.language}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function HackerRankCard({ data }) {
  if (data?.error) return <ErrorCard platform="HackerRank" error={data.error} color="#00ea64" />;
  return (
    <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Award size={20} style={{ color: '#00ea64' }} />
        <h3 style={{ margin: 0, fontSize: 16, fontFamily: 'var(--font-display)' }}>HackerRank</h3>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>@{data.username}</span>
      </div>
      {data.badges?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Badges</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {data.badges.map((b, i) => (
              <span key={i} style={{
                padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: 'color-mix(in srgb, #00ea64 10%, transparent)',
                color: '#00ea64', border: '1px solid color-mix(in srgb, #00ea64 25%, transparent)',
              }}>
                🏅 {b.name} {b.stars > 0 ? `(${b.stars}⭐)` : ''}
              </span>
            ))}
          </div>
        </div>
      )}
      {data.domains?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Domains</div>
          {data.domains.filter(d => d.score > 0).slice(0, 5).map((d, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span style={{ textTransform: 'capitalize' }}>{d.domain.replace(/_/g, ' ')}</span>
              <strong>{d.score}</strong>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 12, fontSize: 14, fontWeight: 700, color: '#00ea64' }}>
        Total Score: {data.total_score}
      </div>
    </motion.div>
  );
}

function ErrorCard({ platform, error, color }) {
  return (
    <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
      padding: 24, borderLeft: `3px solid color-mix(in srgb, ${color} 50%, transparent)`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <AlertCircle size={16} style={{ color: 'var(--rose)' }} />
        <span style={{ fontWeight: 600, fontSize: 14 }}>{platform}</span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{error}</p>
    </motion.div>
  );
}

export default function CodingProfile() {
  const [usernames, setUsernames] = useState({ leetcode: '', codeforces: '', github: '', hackerrank: '' });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCached, setLoadingCached] = useState(true);

  // Load cached profile on mount
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('vm_token');
        const res = await axios.get(`${API}/api/coding-profile/cached`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        });
        if (res.data?.cached) {
          setProfile(res.data.profile);
          setUsernames(res.data.usernames || {});
        }
      } catch { }
      setLoadingCached(false);
    })();
  }, []);

  const handleFetch = async () => {
    if (!Object.values(usernames).some(v => v.trim())) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('vm_token');
      const res = await axios.post(`${API}/api/coding-profile/fetch`, usernames, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 20000,
      });
      setProfile(res.data);
    } catch (err) {
      console.error('Fetch failed:', err);
    }
    setLoading(false);
  };

  const computed = profile?.computed;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1>🔗 Coding Profile Aggregator</h1>
        <p>Connect your coding platforms — your entire skill profile auto-builds in seconds</p>
      </div>

      {/* Username Inputs */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 20 }}>
          {PLATFORMS.map(p => (
            <PlatformInput
              key={p.key}
              platform={p}
              value={usernames[p.key] || ''}
              onChange={(v) => setUsernames(prev => ({ ...prev, [p.key]: v }))}
            />
          ))}
        </div>
        <button
          className="btn btn-primary"
          onClick={handleFetch}
          disabled={loading || !Object.values(usernames).some(v => v.trim())}
          style={{ width: '100%', padding: '14px 24px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {loading ? (
            <><Loader2 size={18} className="spin" /> Fetching profiles... (3-5 seconds)</>
          ) : (
            <><Zap size={18} /> Build My Profile</>
          )}
        </button>
      </div>

      {/* Loading skeleton */}
      {loadingCached && !profile && (
        <div className="grid-2" style={{ gap: 16 }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="glass-card skeleton-card" style={{ height: 200 }} />)}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {profile && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {/* Unified Score Card */}
            {computed && (
              <motion.div
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: 32, marginBottom: 24, textAlign: 'center',
                  background: 'var(--bg-glass)',
                  borderImage: 'var(--accent-gradient) 1',
                  borderWidth: '2px 0 0 0', borderStyle: 'solid',
                }}
              >
                <h2 style={{ margin: '0 0 4px', fontSize: 20, fontFamily: 'var(--font-display)' }}>
                  Unified Coding Score
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px' }}>
                  Aggregated from {computed.platforms_connected} connected platform{computed.platforms_connected !== 1 ? 's' : ''}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <ScoreRing score={Math.round(computed.coding_score)} size={140} />
                </div>

                <div style={{
                  display: 'inline-block', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                  background: computed.coding_score >= 80 ? 'color-mix(in srgb, var(--emerald) 15%, transparent)' :
                    computed.coding_score >= 60 ? 'color-mix(in srgb, var(--amber) 15%, transparent)' :
                      'color-mix(in srgb, var(--rose) 15%, transparent)',
                  color: computed.coding_score >= 80 ? 'var(--emerald)' :
                    computed.coding_score >= 60 ? 'var(--amber)' : 'var(--rose)',
                }}>
                  <TrendingUp size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  {computed.level}
                </div>

                {/* Auto-detected skills */}
                {computed.skills_auto_detected?.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>AUTO-DETECTED SKILLS</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                      {computed.skills_auto_detected.map(s => (
                        <span key={s} style={{
                          padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                          background: 'var(--bg-lighter)', color: 'var(--text-secondary)',
                          border: '1px solid var(--border)',
                        }}>
                          <CheckCircle2 size={11} style={{ marginRight: 4, color: 'var(--emerald)', verticalAlign: 'middle' }} />
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Score breakdown */}
                {computed.breakdown && Object.keys(computed.breakdown).length > 0 && (
                  <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
                    {Object.entries(computed.breakdown).map(([platform, score]) => (
                      <div key={platform} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{score}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{platform}</div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Platform Cards */}
            <div className="grid-2" style={{ gap: 16 }}>
              {profile.leetcode && <LeetCodeCard data={profile.leetcode} />}
              {profile.codeforces && <CodeforcesCard data={profile.codeforces} />}
              {profile.github && <GitHubCard data={profile.github} />}
              {profile.hackerrank && <HackerRankCard data={profile.hackerrank} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading animation while fetching */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            style={{ display: 'inline-block', marginBottom: 16 }}
          >
            <Loader2 size={40} style={{ color: 'var(--accent-primary)' }} />
          </motion.div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Fetching profiles from all platforms in parallel...
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
            {PLATFORMS.filter(p => usernames[p.key]?.trim()).map(p => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.key}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: PLATFORMS.indexOf(p) * 0.2 }}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: `color-mix(in srgb, ${p.color} 15%, transparent)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Icon size={16} style={{ color: p.color }} />
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
