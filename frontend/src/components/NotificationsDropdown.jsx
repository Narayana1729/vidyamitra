import { useState, useEffect, useRef } from 'react';
import { Bell, Activity, CheckCircle, FileText, Zap, Award } from 'lucide-react';
import axios from 'axios';

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchActivities();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('vm_token');
      const res = await axios.get('http://localhost:8000/api/dashboard/activity?limit=10', {
          headers: { Authorization: `Bearer ${token}` }
      });
      // Treat logic for unread as demo - if recent, it's unread
      const data = res.data.activities || [];
      setActivities(data);
      setUnread(Math.min(data.length, 3)); 
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Clear unread badge when opened
      setUnread(0);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'resume': return <FileText size={16} color="var(--cyan)" />;
      case 'skill': return <Zap size={16} color="var(--amber)" />;
      case 'interview': return <Award size={16} color="var(--accent-primary)" />;
      default: return <Activity size={16} color="var(--emerald)" />;
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `Just now`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button 
        className={`btn btn-ghost notification-btn ${isOpen ? 'active' : ''}`}
        onClick={handleOpenDropdown}
      >
        <Bell size={18} />
        {unread > 0 && <span className="notification-dot">{unread}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown glass-card">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unread > 0 && <span className="badge badge-purple">{unread} New</span>}
          </div>
          
          <div className="notification-list">
            {loading ? (
              <div className="notification-empty">Loading...</div>
            ) : activities.length === 0 ? (
              <div className="notification-empty">
                <CheckCircle size={32} style={{ opacity: 0.5, margin: '0 auto 8px' }} />
                <p>All caught up!</p>
              </div>
            ) : (
              activities.map((item) => (
                <div key={item.id} className="notification-item">
                  <div className="notification-icon-bg">
                     {getIcon(item.activity_type)}
                  </div>
                  <div className="notification-content">
                    <p>{item.action}</p>
                    <span>{getTimeAgo(item.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
