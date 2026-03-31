import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BASE_API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API = BASE_API.endsWith('/api') ? BASE_API : `${BASE_API}/api`;

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('vm_token');
    if (!token) {
      setLoading(false);
      return;
    }
    axios.get(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('vm_token');
        localStorage.removeItem('vm_refresh');
      })
      .finally(() => setLoading(false));
  }, []);

  const signup = async ({ email, password, role, full_name, company_name, domain }) => {
    const res = await axios.post(`${API}/auth/signup`, {
      email, password, role, full_name, company_name, domain
    });
    const { user: u, access_token, refresh_token } = res.data;
    if (access_token) {
      localStorage.setItem('vm_token', access_token);
      localStorage.setItem('vm_refresh', refresh_token);
    }
    setUser(u);
    return u;
  };

  const login = async ({ email, password }) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    const { user: u, access_token, refresh_token } = res.data;
    if (access_token) {
      localStorage.setItem('vm_token', access_token);
      localStorage.setItem('vm_refresh', refresh_token);
    }
    setUser(u);
    return u;
  };

  const logout = () => {
    const token = localStorage.getItem('vm_token');
    if (token) {
      axios.post(`${API}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem('vm_token');
    localStorage.removeItem('vm_refresh');

    // ── Clear ALL feature caches to prevent cross-account data leaks ──
    // Clear non-scoped legacy keys
    const featureCacheKeys = [
      'resume_mode', 'resume_result', 'resume_builder_step',
      'resume_template', 'resume_form', 'resume_generated',
      'skillgap_role', 'skillgap_skills', 'skillgap_level', 'skillgap_result',
      'vidyamitra_roadmap', 'vidyamitra_roadmap_activities'
    ];
    featureCacheKeys.forEach(key => localStorage.removeItem(key));

    // Clear user-scoped keys (suffixed with _<uid>)
    const uid = user?.id;
    if (uid) {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.endsWith(`_${uid}`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    setUser(null);
  };

  const value = { user, loading, login, signup, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
