import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — wraps a route so only authenticated users
 * with the correct role can access it.
 *
 * @param {string} requiredRole - 'student' | 'company' | null (any auth)
 */
export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', color: 'var(--text-muted)', fontSize: 14,
      }}>
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Wrong role — redirect to the correct portal
    const dest = user.role === 'company' ? '/company/dashboard' : '/dashboard';
    return <Navigate to={dest} replace />;
  }

  return children;
}
