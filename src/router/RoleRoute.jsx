import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/feedback/LoadingSpinner';

/**
 * Requires the user to have a specific role (or one of several roles).
 * Redirects to /unauthorized if role doesn't match.
 */
export default function RoleRoute({ children, allowedRoles }) {
  const { userProfile, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  if (!userProfile) return <Navigate to="/login" replace />;

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(userProfile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
