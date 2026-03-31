import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Briefcase, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:8000/api';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ jobs: 0, applicants: 0, shortlisted: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('vm_token');
        const jobsRes = await axios.get(`${API}/jobs/company/mine`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const myJobs = jobsRes.data.jobs || [];
        
        const totalJobs = myJobs.length;
        const totalApplicants = myJobs.reduce((acc, job) => acc + (job.applicant_count || 0), 0);
        
        setStats({ jobs: totalJobs, applicants: totalApplicants, shortlisted: 0 });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome back, {user?.company_name}</h1>
          <p className="dashboard-subtitle">Here is what is happening with your job postings today.</p>
        </div>
      </header>

      <div className="grid-3">
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: 'var(--blue)' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <div className="stat-label">Active Postings</div>
            <div className="stat-value">{stats.jobs}</div>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(124, 58, 237, 0.12)', color: 'var(--accent-primary)' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-label">Total Applicants</div>
            <div className="stat-value">{stats.applicants}</div>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--emerald)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="stat-label">Avg. Engagement</div>
            <div className="stat-value">Good</div>
          </div>
        </div>
      </div>
    </div>
  );
}
