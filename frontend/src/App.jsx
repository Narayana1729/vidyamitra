import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Sidebar from './components/Sidebar';
import CompanySidebar from './components/CompanySidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import SkillGap from './pages/SkillGap';
import LearningRoadmap from './pages/LearningRoadmap';
import MockInterview from './pages/MockInterview';
import Dashboard from './pages/Dashboard';
import JobBoard from './pages/JobBoard';
import MyApplications from './pages/MyApplications';
import DomainSwitch from './pages/DomainSwitch';
import CodingProfile from './pages/CodingProfile';
import MentorixChat from './components/MentorixChat';

import CompanyDashboard from './pages/company/CompanyDashboard';
import PostJob from './pages/company/PostJob';
import MyPostings from './pages/company/MyPostings';
import ViewApplicants from './pages/company/ViewApplicants';
import PlacementDashboard from './pages/company/PlacementDashboard';

import { ThemeContext } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

/* ──── Student Layout (sidebar + navbar + content) ──── */
function StudentLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute requiredRole="student"><Dashboard /></ProtectedRoute>} />
          <Route path="/resume" element={<ProtectedRoute requiredRole="student"><ResumeAnalyzer /></ProtectedRoute>} />
          <Route path="/skills" element={<ProtectedRoute requiredRole="student"><SkillGap /></ProtectedRoute>} />
          <Route path="/roadmap" element={<ProtectedRoute requiredRole="student"><LearningRoadmap /></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute requiredRole="student"><MockInterview /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute requiredRole="student"><JobBoard /></ProtectedRoute>} />
          <Route path="/applications" element={<ProtectedRoute requiredRole="student"><MyApplications /></ProtectedRoute>} />
          <Route path="/domain-switch" element={<ProtectedRoute requiredRole="student"><DomainSwitch /></ProtectedRoute>} />
          <Route path="/coding-profile" element={<ProtectedRoute requiredRole="student"><CodingProfile /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

/* ──── Company Layout ──── */
function CompanyLayout() {
  return (
    <div className="app-layout">
      <CompanySidebar />
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="dashboard" element={<ProtectedRoute requiredRole="company"><CompanyDashboard /></ProtectedRoute>} />
          <Route path="post-job" element={<ProtectedRoute requiredRole="company"><PostJob /></ProtectedRoute>} />
          <Route path="postings" element={<ProtectedRoute requiredRole="company"><MyPostings /></ProtectedRoute>} />
          <Route path="applicants/:jobId" element={<ProtectedRoute requiredRole="company"><ViewApplicants /></ProtectedRoute>} />
          <Route path="placement" element={<ProtectedRoute requiredRole="company"><PlacementDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

/* ──── Root-level routing ──── */
function AppRoutes() {
  const location = useLocation();
  const { user, loading } = useAuth();

  // Landing page — always public
  if (location.pathname === '/') return <Landing />;

  // Auth pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    // If already logged in, redirect
    if (!loading && user) {
      const dest = user.role === 'company' ? '/company/dashboard' : '/dashboard';
      return <Navigate to={dest} replace />;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/company/*" element={<CompanyLayout />} />
      <Route path="/*" element={<StudentLayout />} />
    </Routes>
  );
}

export default function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <MentorixChat />
        </BrowserRouter>
      </AuthProvider>
    </ThemeContext.Provider>
  );
}