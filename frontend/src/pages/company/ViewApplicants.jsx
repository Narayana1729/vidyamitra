import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Award, CheckCircle, XCircle, Clock } from 'lucide-react';

const API = 'http://localhost:8000/api';

export default function ViewApplicants() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [minScore, setMinScore] = useState('');

  useEffect(() => {
    fetchData();
  }, [statusFilter, minScore]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('vm_token');
      
      // Fetch Job Details
      const jobRes = await axios.get(`${API}/jobs/${jobId}`);
      setJob(jobRes.data.job);

      // Fetch Applicants
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (minScore) params.min_score = minScore;

      const appRes = await axios.get(`${API}/applications/job/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setApplicants(appRes.data.applicants || []);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const token = localStorage.getItem('vm_token');
      await axios.patch(`${API}/applications/${appId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplicants(applicants.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="loading-state">Loading applicants...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div style={{ marginBottom: '16px' }}>
          <Link to="/company/postings" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', marginBottom: '12px' }}>
            <ArrowLeft size={16} /> Back to Postings
          </Link>
          <h1 className="dashboard-title">Applicants: {job?.title}</h1>
          <p className="dashboard-subtitle">Review and manage candidates for this role</p>
        </div>
      </header>

      {/* Filters */}
      <div className="glass-card" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 600 }}>Filters:</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select" style={{ padding: '6px 12px', borderRadius: '4px', background: 'var(--bg-lighter)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
            <option value="">All</option>
            <option value="applied">Applied</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Min ATS Score:</label>
          <input 
            type="number" 
            value={minScore} 
            onChange={(e) => setMinScore(e.target.value)} 
            placeholder="0" 
            style={{ padding: '6px 12px', width: '80px', borderRadius: '4px', background: 'var(--bg-lighter)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {applicants.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No applicants found matching this criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {applicants.map((app) => (
            <motion.div 
              key={app.id} 
              className="glass-card" 
              style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: '300px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 'bold', flexShrink: 0 }}>
                  {app.profiles?.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                    {app.profiles?.full_name || 'Anonymous Applicant'}
                  </h3>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14}/> {app.profiles?.email}</div>
                    <div>Applied {new Date(app.created_at).toLocaleDateString()}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div style={{ background: 'var(--bg-lighter)', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={16} color="var(--accent-primary)" />
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ATS Score</div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{app.resume_score ? `${app.resume_score}/100` : 'N/A'}</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Matched Skills ({app.matched_skills?.length || 0})</div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                        {(app.matched_skills || []).map(s => (
                          <span key={s} style={{ fontSize: '11px', padding: '2px 6px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald)', borderRadius: '4px' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                <div style={{ 
                  padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase',
                  background: app.status === 'applied' ? 'rgba(59, 130, 246, 0.1)' : 
                              app.status === 'shortlisted' ? 'rgba(16, 185, 129, 0.1)' :
                              app.status === 'hired' ? 'rgba(124, 58, 237, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: app.status === 'applied' ? 'var(--blue)' : 
                         app.status === 'shortlisted' ? 'var(--emerald)' :
                         app.status === 'hired' ? 'var(--accent-primary)' : 'var(--red)'
                }}>
                  {app.status}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {app.status !== 'shortlisted' && app.status !== 'hired' && (
                    <button onClick={() => handleUpdateStatus(app.id, 'shortlisted')} className="btn" style={{ padding: '8px 16px', background: 'var(--emerald)', color: '#fff' }}>
                      <CheckCircle size={16} style={{ marginRight: '6px' }}/> Shortlist
                    </button>
                  )}
                  {app.status !== 'rejected' && app.status !== 'hired' && (
                    <button onClick={() => handleUpdateStatus(app.id, 'rejected')} className="btn" style={{ padding: '8px 16px', background: 'var(--bg-lighter)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                      <XCircle size={16} style={{ marginRight: '6px' }}/> Reject
                    </button>
                  )}
                  {app.status === 'shortlisted' && (
                    <button onClick={() => handleUpdateStatus(app.id, 'hired')} className="btn" style={{ padding: '8px 16px', background: 'var(--accent-primary)', color: '#fff' }}>
                      <Award size={16} style={{ marginRight: '6px' }}/> Mark as Hired
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
