import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, Search, Info, CheckCircle2, Activity, Play,
  LayoutDashboard, FileText, Brain, Map, Mic, Sparkles,
  Briefcase, ClipboardList, ArrowRightLeft, GraduationCap, Link2, BrainCircuit,
  ArrowRight, Command, CornerDownLeft
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const BASE_API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API = BASE_API.endsWith('/api') ? BASE_API : `${BASE_API}/api`;

const pageTitles = {
    '/dashboard': 'Dashboard',
    '/resume': 'AI Resume Analyzer',
    '/skills': 'Skill Gap Detection',
    '/roadmap': 'Learning Roadmap',
    '/higher-studies': 'Higher Studies',
    '/interview': 'Mock Interview',
    '/ai-insights': 'AI Insights',
    '/jobs': 'Browse Jobs',
    '/applications': 'My Applications',
    '/domain-switch': 'Domain Switch',
    '/coding-profile': 'Coding Profile',
};

/* ── Searchable items ─────────────────────────────────── */
const searchItems = [
  { path: '/dashboard',      label: 'Dashboard',        desc: 'Overview of your progress and stats',      icon: LayoutDashboard, keywords: ['home', 'overview', 'stats', 'progress'] },
  { path: '/ai-insights',    label: 'AI Insights',      desc: 'ML-powered career predictions',            icon: BrainCircuit,    keywords: ['machine learning', 'prediction', 'career', 'archetype', 'placement'] },
  { path: '/resume',         label: 'Resume Analyzer',  desc: 'AI-powered resume analysis and scoring',   icon: FileText,        keywords: ['cv', 'resume', 'analysis', 'score', 'upload'] },
  { path: '/skills',         label: 'Skill Gap',        desc: 'Detect and bridge your skill gaps',        icon: Brain,           keywords: ['skills', 'gap', 'analysis', 'assessment', 'competency'] },
  { path: '/roadmap',        label: 'Learning Roadmap', desc: 'Personalized learning path and resources',  icon: Map,             keywords: ['learn', 'path', 'resources', 'courses', 'plan'] },
  { path: '/higher-studies', label: 'Higher Studies',    desc: 'GATE prep, timetable and study planner',   icon: GraduationCap,   keywords: ['gate', 'exam', 'study', 'timetable', 'preparation', 'masters'] },
  { path: '/interview',      label: 'Mock Interview',   desc: 'Practice interviews with AI feedback',     icon: Mic,             keywords: ['interview', 'practice', 'mock', 'behavioral', 'technical'] },
  { path: '/jobs',           label: 'Browse Jobs',      desc: 'Explore job opportunities',                icon: Briefcase,       keywords: ['job', 'openings', 'apply', 'opportunity', 'hiring'] },
  { path: '/applications',   label: 'My Applications',  desc: 'Track your job applications',              icon: ClipboardList,   keywords: ['applied', 'application', 'status', 'track'] },
  { path: '/domain-switch',  label: 'Domain Switch',    desc: 'Explore career domain transitions',        icon: ArrowRightLeft,  keywords: ['switch', 'career', 'transition', 'domain', 'change'] },
  { path: '/coding-profile', label: 'Coding Profile',   desc: 'LeetCode, GFG, CodeChef stats',            icon: Link2,           keywords: ['leetcode', 'codechef', 'gfg', 'coding', 'competitive', 'hackerrank'] },
];

const formatTime = (dateString) => {
   const date = new Date(dateString);
   const now = new Date();
   const diff = Math.floor((now - date) / 1000);
   if (diff < 60) return `${diff}s ago`;
   if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
   if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
   return `${Math.floor(diff / 86400)}d ago`;
};

const getIconForActivity = (type) => {
   if (type === 'higher_studies') return <Activity size={14} color="var(--emerald)" />;
   if (type === 'resume') return <CheckCircle2 size={14} color="var(--cyan)" />;
   if (type === 'interview') return <Play size={14} color="var(--amber)" />;
   return <Info size={14} color="var(--accent-primary)" />;
};

/* ── Highlight matched text ───────────────────────────── */
function HighlightText({ text, query }) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{
        color: 'var(--accent-tertiary)',
        fontWeight: 700,
        textDecoration: 'underline',
        textDecorationColor: 'var(--accent-primary)',
        textUnderlineOffset: 2,
      }}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   NAVBAR
   ══════════════════════════════════════════════════════════ */

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const title = pageTitles[location.pathname] || 'VidyaMitra';

  /* ── Notifications ─────────────────────────────────── */
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
     const fetchNotifications = async () => {
         const token = localStorage.getItem('vm_token');
         if (!token) return;
         try {
             const res = await axios.get(`${API}/dashboard/activity?limit=5`, {
                 headers: { Authorization: `Bearer ${token}` }
             });
             if (res.data && res.data.activities) {
                const fetched = res.data.activities.map((a, i) => ({
                   id: a.id || i,
                   title: a.activity_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                   desc: a.action,
                   time: formatTime(a.created_at),
                   icon: getIconForActivity(a.activity_type)
                }));
                setNotifications(fetched);
             }
         } catch (e) {
             console.error("Failed to load notifications", e);
         }
     };
     fetchNotifications();
     const interval = setInterval(fetchNotifications, 120000);
     return () => clearInterval(interval);
  }, []);

  /* ── Search state ──────────────────────────────────── */
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setQuery('');
    setActiveIdx(0);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setQuery('');
    setActiveIdx(0);
  }, []);

  /* Filter results */
  const results = useMemo(() => {
    if (!query.trim()) return searchItems;
    const q = query.toLowerCase().trim();
    return searchItems.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.keywords.some(k => k.includes(q))
    );
  }, [query]);

  /* Keyboard shortcut: ⌘K / Ctrl+K */
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (searchOpen) closeSearch();
        else openSearch();
      }
      if (e.key === 'Escape' && searchOpen) {
        closeSearch();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen, openSearch, closeSearch]);

  /* Focus input when opened */
  useEffect(() => {
    if (searchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  /* Reset active index when results change */
  useEffect(() => {
    setActiveIdx(0);
  }, [results]);

  /* Scroll active option into view */
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector('[data-active="true"]');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  /* Navigate to result */
  const goTo = useCallback((path) => {
    navigate(path);
    closeSearch();
  }, [navigate, closeSearch]);

  /* Keyboard nav inside palette */
  const handleSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      goTo(results[activeIdx].path);
    }
  };

  /* Detect OS for shortcut display */
  const isMac = navigator.platform?.toUpperCase().includes('MAC') || navigator.userAgent?.includes('Mac');

  return (
    <>
    <header className="header">
      <h2 className="header-title">{title}</h2>

      <div className="header-actions">
        {/* Search trigger button */}
        <button
          className="btn btn-ghost search-trigger"
          onClick={openSearch}
          title="Search (⌘K)"
          style={{ gap: 8, borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', padding: '6px 14px' }}
        >
          <Search size={15} />
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400, marginRight: 8 }}>Search…</span>
          <kbd style={{
            fontSize: 11, fontFamily: 'var(--font-primary)', color: 'var(--text-muted)',
            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
            borderRadius: 4, padding: '2px 6px', lineHeight: 1.3,
          }}>
            {isMac ? '⌘' : 'Ctrl+'}K
          </kbd>
        </button>

        {/* Notification bell */}
        <div style={{ position: 'relative' }}>
          <button className="btn btn-ghost notification-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={18} />
            {notifications.length > 0 && (
                <span className="notification-dot" style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: 'var(--emerald)', borderRadius: '50%', boxShadow: '0 0 8px var(--emerald)' }} />
            )}
          </button>
          
          {showNotifications && (
            <>
              <div 
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} 
                onClick={() => setShowNotifications(false)} 
              />
              <div className="glass-card" style={{ 
                position: 'absolute', top: '120%', right: -10, width: 340, padding: 0, zIndex: 100,
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)', overflow: 'hidden'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600 }}>Activity Center</h4>
                  <span style={{ fontSize: 11, color: 'var(--accent-primary)', cursor: 'pointer' }} onClick={() => setNotifications([])}>Clear all</span>
                </div>
                <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No recent activity.</div>
                  ) : notifications.map(n => (
                    <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, transition: 'background 0.2s', cursor: 'pointer' }}
                         onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                         onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ marginTop: 2 }}>{n.icon}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{n.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.desc}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px 16px', textAlign: 'center', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
                  <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 8px', width: '100%' }}>View All Analytics</button>
                </div>
              </div>
            </>
          )}
        </div>

        <ThemeToggle />
      </div>
    </header>

    {/* ── Command Palette Search Overlay ────────────── */}
    {searchOpen && (
      <div className="search-overlay" onClick={closeSearch}>
        <div
          className="search-palette"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search input row */}
          <div className="search-palette-input-row">
            <Search size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              className="search-palette-input"
              type="text"
              placeholder="Search pages, features, tools…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              autoComplete="off"
              spellCheck={false}
            />
            <kbd className="search-palette-kbd" onClick={closeSearch}>ESC</kbd>
          </div>

          {/* Results */}
          <div className="search-palette-results" ref={listRef}>
            {results.length === 0 ? (
              <div className="search-palette-empty">
                <Search size={32} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: 8 }} />
                <div>No results for "<strong>{query}</strong>"</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Try a different keyword</div>
              </div>
            ) : (
              <>
                <div className="search-palette-section-label">
                  {query.trim() ? `${results.length} result${results.length !== 1 ? 's' : ''}` : 'Pages'}
                </div>
                {results.map((item, i) => {
                  const Icon = item.icon;
                  const isActive = i === activeIdx;
                  const isCurrent = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      data-active={isActive}
                      className={`search-palette-item ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                      onClick={() => goTo(item.path)}
                      onMouseEnter={() => setActiveIdx(i)}
                    >
                      <div className="search-palette-item-icon">
                        <Icon size={18} />
                      </div>
                      <div className="search-palette-item-text">
                        <div className="search-palette-item-label">
                          <HighlightText text={item.label} query={query} />
                          {isCurrent && <span className="search-palette-current-badge">Current</span>}
                        </div>
                        <div className="search-palette-item-desc">
                          <HighlightText text={item.desc} query={query} />
                        </div>
                      </div>
                      <ArrowRight size={14} className="search-palette-item-arrow" />
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer hints */}
          <div className="search-palette-footer">
            <div className="search-palette-hint">
              <kbd>↑</kbd><kbd>↓</kbd> Navigate
            </div>
            <div className="search-palette-hint">
              <kbd><CornerDownLeft size={10} /></kbd> Open
            </div>
            <div className="search-palette-hint">
              <kbd>ESC</kbd> Close
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
