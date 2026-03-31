import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MapPin, Users, Edit, Trash2, Settings, ExternalLink } from 'lucide-react';

const API = 'http://localhost:8000/api';

export default function MyPostings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('vm_token');
      const res = await axios.get(`${API}/jobs/company/mine`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this posting?')) return;
    try {
      const token = localStorage.getItem('vm_token');
      await axios.delete(`${API}/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(jobs.filter(j => j.id !== id));
    } catch (err) {
      alert('Failed to delete job');
    }
  };

  const handleToggleStatus = async (job) => {
    try {
      const newStatus = job.status === 'active' ? 'closed' : 'active';
      const token = localStorage.getItem('vm_token');
      await axios.put(`${API}/jobs/${job.id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(jobs.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="loading-state">Loading postings...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="dashboard-title">My Postings</h1>
          <p className="dashboard-subtitle">Manage your job listings and view applicants</p>
        </div>
        <Link to="/company/post-job" className="btn btn-primary">
          Post New Job
        </Link>
      </header>

      {jobs.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '8px' }}>No jobs posted yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Create your first job listing to start receiving applications.</p>
          <Link to="/company/post-job" className="btn btn-primary" style={{ margin: '0 auto' }}>Post a Job</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {jobs.map((job) => (
            <motion.div 
              key={job.id} 
              className="glass-card" 
              style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div style={{ flex: 1, minWidth: '300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{job.title}</h3>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase',
                    background: job.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: job.status === 'active' ? 'var(--emerald)' : 'var(--red)'
                  }}>
                    {job.status}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {job.location || 'Remote'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{job.job_type}</div>
                  <div>Posted on {new Date(job.created_at).toLocaleDateString()}</div>
                </div>

                <Link to={`/company/applicants/${job.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--blue)', borderRadius: '8px', fontWeight: '600', fontSize: '14px' }}>
                    <Users size={16} />
                    {job.applicant_count} Applicants <ExternalLink size={14} style={{ marginLeft: '4px' }}/>
                  </div>
                </Link>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => handleToggleStatus(job)}
                  className="btn btn-secondary" 
                  style={{ padding: '8px' }}
                  title={job.status === 'active' ? 'Close Job' : 'Reopen Job'}
                >
                  <Settings size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(job.id)}
                  className="btn" 
                  style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
