import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Brain, Map, Mic, Sparkles,
  Briefcase, ClipboardList, LogOut, ArrowRightLeft, GraduationCap, Link2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/resume', icon: FileText, label: 'Resume Analyzer' },
  { to: '/skills', icon: Brain, label: 'Skill Gap' },
  { to: '/roadmap', icon: Map, label: 'Learning Roadmap' },
  { to: '/gate-prep', icon: GraduationCap, label: 'GATE Prep' },
  { to: '/interview', icon: Mic, label: 'Mock Interview' },
  { to: '/jobs', icon: Briefcase, label: 'Browse Jobs' },
  { to: '/applications', icon: ClipboardList, label: 'My Applications' },
  { to: '/domain-switch', icon: ArrowRightLeft, label: 'Domain Switch' },
  { to: '/coding-profile', icon: Link2, label: 'Coding Profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'S';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Sparkles size={22} />
        </div>
        <div>
          <h1>VidyaMitra</h1>
          <span>AI Career Intelligence</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="glass-card glass-card-sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--accent-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#fff',
            flexShrink: 0,
          }}>{initials}</div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.full_name || 'Student'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Student</div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: 4,
              display: 'flex', alignItems: 'center',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
