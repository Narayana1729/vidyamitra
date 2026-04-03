import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, LayoutDashboard, FileText, Target, Map, BookOpen, Video, Briefcase, FolderKanban, Code, ArrowRightLeft, GraduationCap, ArrowRight } from 'lucide-react';

const searchIndex = [
  { title: 'Dashboard', path: '/dashboard', description: 'Overview of your learning progress and goals', icon: LayoutDashboard, keywords: 'home overview stats summary' },
  { title: 'AI Resume Analyzer', path: '/resume', description: 'Analyze and improve your resume using AI', icon: FileText, keywords: 'cv ats score analyze upload pdf' },
  { title: 'Skill Gap Detection', path: '/skills', description: 'Identify missing skills for your target role', icon: Target, keywords: 'skills gap missing match percentage' },
  { title: 'Learning Roadmap', path: '/roadmap', description: 'Generate personalized learning roadmaps', icon: Map, keywords: 'learn path plan study guide' },
  { title: 'GATE Preparation', path: '/gate-prep', description: 'Subject-wise modules and mock tests for GATE', icon: BookOpen, keywords: 'gate exam cse ece subjects quiz mtech' },
  { title: 'Mock Interview', path: '/interview', description: 'Practice interviews with AI feedback', icon: Video, keywords: 'interview practice behavioral technical' },
  { title: 'Job Board', path: '/jobs', description: 'Search and apply for jobs and internships', icon: Briefcase, keywords: 'jobs openings hiring apply company internship' },
  { title: 'My Applications', path: '/applications', description: 'Track your submitted job applications', icon: FolderKanban, keywords: 'applications kanban tracker status applied' },
  { title: 'Coding Profile', path: '/coding-profile', description: 'Connect LeetCode & GitHub stats', icon: Code, keywords: 'leetcode github coding problems solved repos' },
  { title: 'Higher Studies Hub', path: '/higher-studies', description: 'Command center for all higher education exams', icon: GraduationCap, keywords: 'higher studies exam prep command center hub' },
  { title: 'Switch Domain', path: '/domain-switch', description: 'Change your main engineering branch', icon: ArrowRightLeft, keywords: 'domain branch cse ece eee mech civil' },
  // ── Higher Studies Sub-Tracks ──
  { title: 'Masters (MS/MA/MSc)', path: '/higher-studies?track=MASTERS', description: 'Global universities, GRE, TOEFL prep', icon: GraduationCap, keywords: 'masters ms ma msc gre toefl abroad university phd' },
  { title: 'M.Tech / GATE Prep', path: '/higher-studies?track=GATE', description: 'IISc, IITs, NITs, PSU predictor', icon: BookOpen, keywords: 'gate mtech iisc iit nit psu engineering' },
  { title: 'UPSC Civil Services', path: '/higher-studies?track=UPSC', description: 'Prelims, Mains, Interview preparation', icon: Map, keywords: 'upsc ias ips civil services prelims mains interview government' },
  { title: 'MBA / CAT', path: '/higher-studies?track=MBA', description: 'IIMs, top B-Schools, specializations', icon: Briefcase, keywords: 'mba cat iim bschool management xat snap mat' },
  { title: 'Groups & Gov Exams', path: '/higher-studies?track=GROUPS', description: 'Central + State + PSU government exams', icon: Target, keywords: 'groups government exam state central psu ssc cgl chsl appsc tspsc' },
  { title: 'Banking Exams', path: '/higher-studies?track=BANKING', description: 'IBPS, SBI, RBI exam preparation', icon: Briefcase, keywords: 'banking ibps sbi rbi po clerk bank exam' },
  { title: 'Railways', path: '/higher-studies?track=RAILWAYS', description: 'RRB NTPC, Group D, ALP preparation', icon: Map, keywords: 'railways rrb ntpc group d alp technician' },
  { title: 'NEET PG / Research', path: '/higher-studies?track=NEET', description: 'PhD, JRF, NET exam preparation', icon: BookOpen, keywords: 'neet pg phd jrf net research ugc csir' },
  { title: 'Study Abroad', path: '/higher-studies?track=ABROAD', description: 'GRE, GMAT, IELTS, TOEFL prep', icon: GraduationCap, keywords: 'abroad gre gmat ielts toefl study overseas visa university' },
];

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  // Ctrl+K to open, Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Filter results with keyword matching for better accuracy
  const filteredResults = searchIndex.filter(item => {
    if (!query) return true; // Show all when empty
    const q = query.toLowerCase();
    const haystack = `${item.title} ${item.description} ${item.keywords}`.toLowerCase();
    return q.split('').every(char => haystack.includes(char)) && haystack.includes(q.charAt(0));
  }).sort((a, b) => {
    // Sort by best match — title match first, then description, then keywords
    const q = query.toLowerCase();
    const aTitle = a.title.toLowerCase().indexOf(q);
    const bTitle = b.title.toLowerCase().indexOf(q);
    if (aTitle !== -1 && bTitle === -1) return -1;
    if (bTitle !== -1 && aTitle === -1) return 1;
    if (aTitle !== -1 && bTitle !== -1) return aTitle - bTitle;
    return 0;
  });

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('.search-result-item.selected');
      if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const handleSelect = useCallback((path) => {
    setIsOpen(false);
    // Small delay so the modal closes smoothly before navigating
    setTimeout(() => navigate(path), 50);
  }, [navigate]);

  const handleKeyDownInput = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, filteredResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[activeIndex]) {
        handleSelect(filteredResults[activeIndex].path);
      }
    }
  };

  if (!isOpen) {
    return (
      <button
        className="btn btn-ghost search-trigger-btn"
        onClick={() => setIsOpen(true)}
        title="Search (Ctrl+K)"
      >
        <Search size={18} />
        <span style={{ fontSize: '11px', opacity: 0.5, border: '1px solid currentColor', borderRadius: '4px', padding: '1px 4px', marginLeft: '6px' }}>Ctrl K</span>
      </button>
    );
  }

  return (
    <>
      <button className="btn btn-ghost search-trigger-btn" style={{ color: 'var(--accent-tertiary)' }}>
        <Search size={18} />
      </button>

      <div className="search-modal-overlay" onMouseDown={() => setIsOpen(false)}>
        <div
          className="search-modal-content glass-card"
          onMouseDown={e => e.stopPropagation()}
        >
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Where do you want to go?"
              className="search-input-large"
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDownInput}
              autoComplete="off"
            />
            <button className="btn btn-ghost btn-sm close-search" onMouseDown={(e) => { e.stopPropagation(); setIsOpen(false); }}>
              <X size={18} />
            </button>
          </div>

          <div className="search-results-container" ref={listRef}>
            {filteredResults.length > 0 ? (
              <div className="search-results-list">
                <div className="search-results-header">
                  {query ? `Results for "${query}"` : 'Quick Navigation'}
                </div>
                {filteredResults.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.path}
                      className={`search-result-item ${activeIndex === index ? 'selected' : ''}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelect(item.path);
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <div className="search-result-icon">
                        <Icon size={18} />
                      </div>
                      <div className="search-result-text">
                        <div className="search-result-title">{item.title}</div>
                        <div className="search-result-desc">{item.description}</div>
                      </div>
                      <ArrowRight size={14} style={{ opacity: activeIndex === index ? 0.6 : 0, marginLeft: 'auto', transition: '0.15s' }} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="search-no-results">
                <Search size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p>No results for "<strong>{query}</strong>"</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>Try a shorter search term</p>
              </div>
            )}
          </div>

          <div className="search-footer">
            <span>
              <b>↑↓</b> navigate &nbsp; <b>Enter</b> select &nbsp; <b>Esc</b> close
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
