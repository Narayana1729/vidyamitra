import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const pageTitles = {
    '/dashboard': 'Dashboard',
    '/resume': 'AI Resume Analyzer',
    '/skills': 'Skill Gap Detection',
    '/roadmap': 'Learning Roadmap',
    '/gate-prep': 'GATE Preparation',
    '/interview': 'Mock Interview',
};

export default function Navbar() {
    const location = useLocation();
    const title = pageTitles[location.pathname] || 'VidyaMitra';

    return (
  <header className="header">
    <h2 className="header-title">{title}</h2>

    <div className="header-actions">
      <button className="btn btn-ghost">
        <Search size={18} />
      </button>

      <button className="btn btn-ghost notification-btn">
        <Bell size={18} />
        <span className="notification-dot" />
      </button>

      <ThemeToggle />
    </div>
  </header>
);
}
