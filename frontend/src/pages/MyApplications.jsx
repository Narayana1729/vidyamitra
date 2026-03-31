import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, GripVertical, FileText, Target, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BASE_API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API = BASE_API.endsWith('/api') ? BASE_API : `${BASE_API}/api`;

const COLUMNS = ['Wishlist', 'Applied', 'Interviewing', 'Offered', 'Rejected'];

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  // New application form state
  const [newApp, setNewApp] = useState({ company: '', position: '', job_description: '', status: 'Wishlist' });

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const token = localStorage.getItem('vm_token');
      const res = await axios.get(`${API}/tracked-applications/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApps(res.data || []);
    } catch (err) {
      console.error('Failed to fetch tracked applications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddApp = async (e) => {
    e.preventDefault();
    if (!newApp.company || !newApp.position) return;
    try {
      const token = localStorage.getItem('vm_token');
      const res = await axios.post(`${API}/tracked-applications/`, newApp, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApps([res.data, ...apps]);
      setIsAdding(false);
      setNewApp({ company: '', position: '', job_description: '', status: 'Wishlist' });
    } catch (err) {
      console.error('Failed to add app', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('vm_token');
      await axios.delete(`${API}/tracked-applications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApps(apps.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to delete app', err);
    }
  };

  const updateStatus = async (appId, newStatus) => {
    try {
      const token = localStorage.getItem('vm_token');
      await axios.put(`${API}/tracked-applications/${appId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApps(apps.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // --- HTML5 Drag and Drop ---
  const handleDragStart = (e, app) => {
    e.dataTransfer.setData('appId', app.id);
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('appId');
    const appInfo = apps.find(a => a.id === appId);
    if (appInfo && appInfo.status !== status) {
      // Optimistic UI update
      setApps(apps.map(a => a.id === appId ? { ...a, status } : a));
      updateStatus(appId, status);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Routing handlers
  const handleTailor = (app) => {
    // Navigate to Resume Tailor prepopulated
    navigate('/resume', { state: { company: app.company, position: app.position, job_description: app.job_description } });
  };

  const handlePrep = (app) => {
    navigate('/interview', { state: { target_role: app.position, company: app.company } });
  };

  if (loading) return <div className="loading-state">Loading board...</div>;

  return (
    <div className="dashboard-container" style={{ maxWidth: '1600px', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
        <div>
          <h1 className="dashboard-title">My Applications</h1>
          <p className="dashboard-subtitle">Intelligent Kanban CRM</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={18} /> Add Job
        </button>
      </header>

      {/* --- Add New App Modal --- */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setIsAdding(false)}
          >
            <motion.div 
              className="glass-card"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              style={{ width: '500px', maxWidth: '90%', padding: '32px' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Track New Job</h2>
              <form onSubmit={handleAddApp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Company Name</label>
                  <input required className="input" placeholder="e.g. Google" value={newApp.company} onChange={e => setNewApp({...newApp, company: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Position Title</label>
                  <input required className="input" placeholder="e.g. Frontend Engineer" value={newApp.position} onChange={e => setNewApp({...newApp, position: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Job Description (Optional, for ATS Engine)</label>
                  <textarea className="input" style={{ minHeight: '120px', resize: 'vertical' }} placeholder="Paste the JD here for automatic AI scoring..." value={newApp.job_description} onChange={e => setNewApp({...newApp, job_description: e.target.value})} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setIsAdding(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save to Board</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Kanban Board --- */}
      <div style={{ display: 'flex', gap: '24px', flex: 1, overflowX: 'auto', paddingBottom: '32px' }}>
        {COLUMNS.map(col => {
          const colApps = apps.filter(a => a.status === col);
          return (
            <div 
              key={col} 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col)}
              style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', padding: '16px', border: '1px solid var(--border)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '0 8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600' }}>{col}</h3>
                <span style={{ fontSize: '12px', background: 'var(--bg-card)', padding: '2px 8px', borderRadius: '12px', color: 'var(--text-muted)' }}>{colApps.length}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
                {colApps.map(app => (
                  <motion.div
                    layout
                    key={app.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app)}
                    className="glass-card"
                    style={{ padding: '16px', cursor: 'grab', position: 'relative' }}
                    whileHover={{ scale: 1.02 }}
                    whileDrag={{ scale: 1.05, boxShadow: 'var(--shadow-glow)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{app.position}</h4>
                        <div style={{ fontSize: '13px', color: 'var(--accent-tertiary)' }}>{app.company}</div>
                      </div>
                      <GripVertical size={16} style={{ color: 'var(--text-muted)', cursor: 'grab' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <div className={`badge ${app.match_score > 75 ? 'badge-emerald' : app.match_score > 50 ? 'badge-amber' : 'badge-rose'}`} style={{ fontSize: '11px' }}>
                        ATS Match: {app.match_score}%
                      </div>
                    </div>

                    {/* Integrated AI Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button onClick={() => handleTailor(app)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', width: '100%', justifyContent: 'flex-start' }}>
                        <FileText size={14} /> Tailor Resume
                      </button>
                      <button onClick={() => handlePrep(app)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', width: '100%', justifyContent: 'flex-start' }}>
                        <Target size={14} /> Prep Interview
                      </button>
                    </div>

                    <button 
                      onClick={() => handleDelete(app.id)}
                      style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.5 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
