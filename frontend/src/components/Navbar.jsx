import { useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import NotificationsDropdown from './NotificationsDropdown';
import GlobalSearch from './GlobalSearch';

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
      <GlobalSearch />

      <NotificationsDropdown />

      <ThemeToggle />
    </div>
  </header>
);
}
