import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Briefcase, CheckCircle, ExternalLink, TrendingUp, TrendingDown, Minus, BarChart3, Globe, DollarSign, Flame, Zap, Filter, SlidersHorizontal, IndianRupee, ChevronDown, ChevronUp } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { getDomainData } from '../utils/domainData';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api';

// ── Market Trend Data ──
// These are dynamically loaded inside the component based on user domain

const MARKET_STATS = [
  { label: 'Remote Positions', value: '42%', icon: Globe, color: 'var(--cyan)' },
  { label: 'Avg Salary Growth', value: '+12%', icon: DollarSign, color: 'var(--emerald)' },
  { label: 'New Openings (Monthly)', value: '1.2M', icon: Zap, color: 'var(--amber)' },
  { label: 'Hiring Rate', value: '68%', icon: TrendingUp, color: 'var(--primary)' },
];

const statusConfig = {
  hot:      { label: '🔥 Hot',     bg: 'rgba(239,68,68,0.1)',  color: 'var(--rose)',    border: 'rgba(239,68,68,0.25)' },
  growing:  { label: '📈 Growing', bg: 'rgba(16,185,129,0.1)', color: 'var(--emerald)', border: 'rgba(16,185,129,0.25)' },
  stable:   { label: '➡️ Stable',  bg: 'rgba(99,102,241,0.1)', color: 'var(--primary)', border: 'rgba(99,102,241,0.25)' },
  declining:{ label: '📉 Declining',bg:'rgba(245,158,11,0.1)', color: 'var(--amber)',   border: 'rgba(245,158,11,0.25)' },
};

export default function JobBoard() {
  const { user } = useAuth();
  const domainData = getDomainData(user?.domain);
  const TOP_SKILLS = domainData.topSkills;
  const ROLE_TRENDS = domainData.roleTrends;

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeJob, setActiveJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [hoveredRole, setHoveredRole] = useState(null);
  const [trendsExpanded, setTrendsExpanded] = useState(false);
  const [generatingMock, setGeneratingMock] = useState(null);
  const [mockInterviewData, setMockInterviewData] = useState(null);

  useEffect(() => {
    fetchJobs();
    fetchMyApps();
  }, [search]);

  const fetchJobs = async () => {
    try {
      // Fetch internal and external jobs in parallel
      const [internalRes, externalRes] = await Promise.allSettled([
        axios.get(`${API}/jobs`, { params: { search } }),
        axios.get(`${API}/jobs/external`, { params: { search } })
      ]);

      let fetchedJobs = [];
      if (internalRes.status === 'fulfilled') {
        fetchedJobs = [...fetchedJobs, ...(internalRes.value.data.jobs || [])];
      }
      if (externalRes.status === 'fulfilled') {
        const extJobs = externalRes.value.data.jobs || [];
        // Map any null arrays to empty arrays to prevent errors
        fetchedJobs = [...fetchedJobs, ...extJobs.map(j => ({...j, skills_required: j.skills_required || []}))];
      }

      // Get user's skills for match scoring
      const uid = user?.id;
      let userSkills = [];
      try {
        const cached = localStorage.getItem(`vidyamitra_skillgap_skills_${uid}`);
        if (cached) userSkills = JSON.parse(cached).map(s => s.toLowerCase());
      } catch (e) {}

      // Calculate match score
      const jobsWithScores = fetchedJobs.map(job => {
        if (!userSkills.length || !job.skills_required?.length) {
          return { ...job, matchScore: 0 };
        }
        const required = job.skills_required.map(s => s.toLowerCase());
        const matchCount = required.filter(s => userSkills.includes(s)).length;
        const score = Math.round((matchCount / required.length) * 100);
        return { ...job, matchScore: score };
      });

      // Sort by match score descending
      jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);

      setJobs(jobsWithScores);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApps = async () => {
    try {
      const token = localStorage.getItem('vm_token');
      const res = await axios.get(`${API}/applications/student/mine`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ids = new Set((res.data.applications || []).map(a => a.job_id));
      setAppliedJobs(ids);
    } catch (err) {
      console.debug('Skipping existing applications fetch:', err?.message);
    }
  };

  const handleApply = async (jobId) => {
    setApplying(true);
    try {
      const token = localStorage.getItem('vm_token');
      await axios.post(`${API}/applications`, { job_id: jobId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppliedJobs(prev => new Set(prev).add(jobId));
      setActiveJob(null);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleMockInterview = async (job) => {
    setGeneratingMock(job.id);
    try {
      const res = await axios.post(`${API}/jobs/mock-interview`, {
        job_title: job.title,
        job_description: job.description || "",
        skills_required: job.skills_required || [],
        experience_level: job.experience_level || ""
      });
      setMockInterviewData(res.data);
    } catch (err) {
      alert("Failed to generate mock interview");
    } finally {
      setGeneratingMock(null);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ marginBottom: 8 }}>
        <div>
          <h1 className="dashboard-title">Job Board</h1>
          <p className="dashboard-subtitle">Find and apply to roles matching your skills</p>
        </div>
      </header>

      {/* ── Enhanced Search Bar ── */}
      <div style={{
        padding: 3, borderRadius: 14, marginBottom: 28,
        background: 'linear-gradient(135deg, var(--primary), var(--cyan), var(--emerald))',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
          background: 'var(--bg-card)', borderRadius: 12,
        }}>
          <Search size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by role, company, skill, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, border: 'none', outline: 'none', fontSize: 15,
              background: 'transparent', color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, padding: '0 4px' }}
            >
              ×
            </button>
          )}
          <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {['Remote', 'Full-time', 'Internship'].map(tag => (
              <button
                key={tag}
                onClick={() => setSearch(tag.toLowerCase())}
                style={{
                  padding: '5px 12px', fontSize: 12, fontWeight: 500, borderRadius: 6,
                  border: '1px solid var(--border)', background: search.toLowerCase() === tag.toLowerCase() ? 'var(--primary)' : 'var(--bg-glass)',
                  color: search.toLowerCase() === tag.toLowerCase() ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ── JOB MARKET TRENDS SECTION ── */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: trendsExpanded ? 28 : 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BarChart3 size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>Job Market Trends</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 2 }}>Current hiring landscape & in-demand skills</p>
            </div>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={() => setTrendsExpanded(!trendsExpanded)}
          >
            {trendsExpanded ? <><ChevronUp size={18} style={{ marginRight: 6 }}/> Hide</> : <><ChevronDown size={18} style={{ marginRight: 6 }}/> Show</>}
          </button>
        </div>

        <AnimatePresence>
          {trendsExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ paddingBottom: '24px' }}>
                {/* ── Market Stats Row ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                  {MARKET_STATS.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className="glass-card"
                      style={{ padding: '20px 24px', textAlign: 'center' }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <stat.icon size={22} style={{ color: stat.color, marginBottom: 8 }} />
                      <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)', color: stat.color }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {/* ── Left: Top In-Demand Skills ── */}
                  <div className="glass-card" style={{ padding: 28 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Flame size={18} style={{ color: 'var(--amber)' }} /> Top In-Demand Skills
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {TOP_SKILLS.map((skill, i) => (
                        <div key={skill.name} style={{ position: 'relative' }}
                          onMouseEnter={() => setHoveredSkill(skill.name)}
                          onMouseLeave={() => setHoveredSkill(null)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, cursor: 'pointer' }}>
                            <span style={{ fontSize: 14, fontWeight: 500 }}>{skill.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>{skill.demand}%</span>
                              <span style={{
                                fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                                background: skill.change > 10 ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.12)',
                                color: skill.change > 10 ? 'var(--emerald)' : 'var(--primary)',
                              }}>
                                +{skill.change}%
                              </span>
                            </div>
                          </div>
                          <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.demand}%` }}
                              transition={{ duration: 0.8, delay: i * 0.08 }}
                              style={{
                                height: '100%', borderRadius: 3,
                                background: `linear-gradient(90deg, var(--primary), ${skill.change > 10 ? 'var(--emerald)' : 'var(--cyan)'})`,
                              }}
                            />
                          </div>
                          {/* Tooltip */}
                          {hoveredSkill === skill.name && (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              style={{
                                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, zIndex: 20,
                                padding: '10px 14px', borderRadius: 8, fontSize: 12, lineHeight: 1.5,
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.15)', color: 'var(--text-secondary)',
                              }}
                            >
                              💡 {skill.tip}
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Right: Role Trends Table ── */}
                  <div className="glass-card" style={{ padding: 28 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <TrendingUp size={18} style={{ color: 'var(--emerald)' }} /> Role Demand & Salary
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {/* Table header */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.7fr 0.6fr 0.6fr 0.6fr', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Growth</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Pay (LPA)</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Openings</span>
                      </div>
                      {/* Table rows */}
                      {ROLE_TRENDS.map((item, i) => {
                        const sc = statusConfig[item.status];
                        return (
                          <div key={item.role} style={{ position: 'relative' }}
                            onMouseEnter={() => setHoveredRole(item.role)}
                            onMouseLeave={() => setHoveredRole(null)}
                          >
                            <motion.div
                              style={{
                                display: 'grid', gridTemplateColumns: '1.4fr 0.7fr 0.6fr 0.6fr 0.6fr', gap: 8,
                                padding: '10px 8px', borderRadius: 6, alignItems: 'center', cursor: 'pointer',
                              }}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.06 }}
                              whileHover={{ background: 'var(--bg-glass)' }}
                            >
                              <span style={{ fontSize: 13, fontWeight: 600 }}>{item.role}</span>
                              <span style={{
                                fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
                                background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                                textAlign: 'center', whiteSpace: 'nowrap',
                              }}>
                                {sc.label}
                              </span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--emerald)' }}>{item.growth}</span>
                              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{item.avgSalary}</span>
                              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.openings}</span>
                            </motion.div>
                            {/* Tooltip */}
                            {hoveredRole === item.role && (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                  padding: '10px 14px', borderRadius: 8, fontSize: 12, lineHeight: 1.5,
                                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)', color: 'var(--text-secondary)',
                                  marginBottom: 4,
                                }}
                              >
                                💼 {item.tip}
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── Insight Banner ── */}
                <div className="glass-card" style={{
                  marginTop: 20, padding: '16px 24px',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(16,185,129,0.06))',
                  borderLeft: '4px solid var(--primary)',
                  display: 'flex', alignItems: 'center', gap: 16,
                }}>
                  <Zap size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>Pro Tip: </span>
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                      AI/ML and Cloud roles are growing 3× faster than average. Consider upskilling via the{' '}
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Learning Roadmap</span>{' '}
                      to target these high-demand areas.
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ padding: '0 2px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-secondary)' }}>Latest Postings</h2>
      </div>

      {loading ? (
        <div className="loading-state">Loading jobs...</div>
      ) : (
        <div className="grid-3">
          {jobs.map((job) => {
            const isApplied = appliedJobs.has(job.id);
            return (
              <motion.div
                key={job.id}
                className="glass-card"
                style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}
                whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
              >
                <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  {job.matchScore > 0 && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: '12px',
                      background: job.matchScore >= 70 ? 'rgba(16,185,129,0.1)' : job.matchScore >= 40 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                      color: job.matchScore >= 70 ? 'var(--emerald)' : job.matchScore >= 40 ? 'var(--amber)' : 'var(--rose)',
                      border: `1px solid ${job.matchScore >= 70 ? 'rgba(16,185,129,0.2)' : job.matchScore >= 40 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`
                    }}>
                      <BarChart3 size={11} /> {job.matchScore}% Match
                    </div>
                  )}
                  {isApplied && (
                    <div style={{ color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500 }}>
                      <CheckCircle size={14} /> Applied
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '8px',
                    background: 'var(--bg-lighter)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-primary)'
                  }}>
                    {job.profiles?.company_name?.[0]?.toUpperCase() || 'C'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{job.title}</h3>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{job.profiles?.company_name}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} /> {job.location || 'Remote'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Briefcase size={14} /> {job.job_type}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto' }}>
                  {(job.skills_required || []).slice(0, 3).map(skill => (
                    <span key={skill} style={{
                      padding: '4px 8px', borderRadius: '4px', background: 'var(--bg-lighter)',
                      fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)'
                    }}>{skill}</span>
                  ))}
                  {(job.skills_required?.length > 3) && (
                    <span style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      +{job.skills_required.length - 3} more
                    </span>
                  )}
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '8px', background: 'var(--primary)', color: '#fff' }}
                  onClick={() => handleMockInterview(job)}
                  disabled={generatingMock === job.id}
                >
                  {generatingMock === job.id ? 'Generating Mock Interview...' : 'Take Mock Interview'}
                </button>

                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', marginTop: '8px' }}
                  onClick={() => {
                    if (job.external_link) {
                      window.open(job.external_link, '_blank');
                    } else {
                      setActiveJob(job);
                    }
                  }}
                  disabled={isApplied && !job.external_link}
                >
                  {job.external_link ? 'Apply Externally ↗' : (isApplied ? 'Applied' : 'View Details')}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}



      {/* Modal for Job Details */}
      {activeJob && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <motion.div
            className="glass-card"
            style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', padding: '32px' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', marginBottom: '4px' }}>{activeJob.title}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>{activeJob.profiles?.company_name}</p>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => setActiveJob(null)}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
              <div className="glass-card glass-card-sm" style={{ padding: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Location</div>
                <div style={{ fontWeight: '500' }}>{activeJob.location || 'Remote'}</div>
              </div>
              <div className="glass-card glass-card-sm" style={{ padding: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Type</div>
                <div style={{ fontWeight: '500' }}>{activeJob.job_type}</div>
              </div>
              <div className="glass-card glass-card-sm" style={{ padding: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Salary</div>
                <div style={{ fontWeight: '500' }}>{activeJob.salary_range || 'Not specified'}</div>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Description</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {activeJob.description}
              </p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Required Skills</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(activeJob.skills_required || []).map(skill => (
                  <span key={skill} style={{
                    padding: '6px 12px', borderRadius: '6px', background: 'var(--bg-lighter)',
                    fontSize: '13px', fontWeight: '500'
                  }}>{skill}</span>
                ))}
              </div>
            </div>

            {activeJob.external_link ? (
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={() => window.open(activeJob.external_link, '_blank')}
              >
                Apply Externally on LinkedIn/Indeed
              </button>
            ) : (
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={() => handleApply(activeJob.id)}
                disabled={applying || appliedJobs.has(activeJob.id)}
              >
                {applying ? 'Applying...' : appliedJobs.has(activeJob.id) ? 'Already Applied' : 'Apply Now with Resume'}
              </button>
            )}
          </motion.div>
        </div>
      )}

      {/* Modal for Mock Interview */}
      {mockInterviewData && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 110,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <motion.div
            className="glass-card"
            style={{ width: '100%', maxWidth: '800px', maxHeight: '85vh', overflowY: 'auto', padding: '32px' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', marginBottom: '4px' }}>Generated Mock Interview</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>{mockInterviewData.job_title}</p>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => setMockInterviewData(null)}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {(mockInterviewData.questions || []).map((q, i) => (
                <div key={i} className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                     <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase' }}>{q.type}</span>
                     <span style={{ fontSize: '12px', fontWeight: 'bold', color: q.difficulty === 'Hard' ? 'var(--rose)' : q.difficulty === 'Medium' ? 'var(--amber)' : 'var(--emerald)' }}>{q.difficulty}</span>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', lineHeight: '1.5' }}>Q{i + 1}: {q.question}</h4>
                  <div style={{ background: 'var(--bg-lighter)', padding: '16px', borderRadius: '8px' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 'bold' }}>Expected Answer:</p>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{q.expected_answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
