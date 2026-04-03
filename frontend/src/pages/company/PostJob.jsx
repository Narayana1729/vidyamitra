import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, MapPin, DollarSign, List, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function PostJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    job_type: 'Full-time',
    salary_range: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);

  const handleAddSkill = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = skillInput.trim();
      if (val && !skills.includes(val)) {
        setSkills([...skills, val]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (sk) => {
    setSkills(skills.filter(s => s !== sk));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('vm_token');
      await axios.post(`${API}/api/jobs`, {
        ...formData,
        skills_required: skills,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      setTimeout(() => navigate('/company/postings'), 2000);
    } catch (err) {
      alert('Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <motion.div 
          className="glass-card" 
          style={{ padding: '48px', textAlign: 'center', maxWidth: '400px' }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--emerald)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Check size={32} />
          </div>
          <h2 style={{ marginBottom: '12px' }}>Job Posted Successfully!</h2>
          <p style={{ color: 'var(--text-muted)' }}>Redirecting to your postings...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="dashboard-container max-w-3xl" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Post a New Job</h1>
          <p className="dashboard-subtitle">Create a listing to find your ideal candidate</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="auth-field">
            <label>Job Title</label>
            <div className="auth-input-wrap">
              <input name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Senior Frontend Engineer" />
            </div>
          </div>

          <div className="grid-2">
            <div className="auth-field">
              <label>Location</label>
              <div className="auth-input-wrap">
                <MapPin size={16} />
                <input name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Remote, New York" />
              </div>
            </div>

            <div className="auth-field">
              <label>Job Type</label>
              <select name="job_type" value={formData.job_type} onChange={handleChange} className="form-select" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-lighter)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>

          <div className="auth-field">
            <label>Salary Range (Optional)</label>
            <div className="auth-input-wrap">
              <DollarSign size={16} />
              <input name="salary_range" value={formData.salary_range} onChange={handleChange} placeholder="e.g. $100k - $120k" />
            </div>
          </div>

          <div className="auth-field">
            <label>Required Skills (Press Enter to add)</label>
            <div className="auth-input-wrap">
              <input 
                value={skillInput} 
                onChange={e => setSkillInput(e.target.value)} 
                onKeyDown={handleAddSkill} 
                placeholder="e.g. React" 
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
              <AnimatePresence>
                {skills.map(sk => (
                  <motion.div key={sk} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    style={{ padding: '6px 12px', background: 'var(--accent-primary)', color: '#fff', borderRadius: '16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {sk}
                    <button type="button" onClick={() => removeSkill(sk)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}>&times;</button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="auth-field">
            <label>Job Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              required 
              rows={6}
              placeholder="Describe the role, responsibilities, and requirements..."
              style={{ width: '100%', padding: '16px', borderRadius: '8px', background: 'var(--bg-lighter)', border: '1px solid var(--border)', color: 'var(--text-primary)', resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ justifyContent: 'center' }}>
            {loading ? 'Posting...' : <>Post Job <ArrowRight size={18} /></>}
          </button>
        </div>
      </form>
    </div>
  );
}
