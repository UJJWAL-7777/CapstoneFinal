import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Spinner from '../components/ui/Spinner.jsx';
import { ROLE_HOME } from '../utils/constants.js';

// Requires a signed-in user
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner label="Checking your session" />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

// Requires one of the given roles; otherwise sends the user to their own home
export function RoleRoute({ roles }) {
  const { user } = useAuth();
  if (!roles.includes(user.role)) return <Navigate to={ROLE_HOME[user.role]} replace />;
  return <Outlet />;
}

// Login/register are only for signed-out visitors
export function GuestRoute() {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <Spinner label="Checking your session" />;
  if (isAuthenticated) return <Navigate to={ROLE_HOME[user.role]} replace />;
  return <Outlet />;
}

export function DashboardRedirect() {
  const { user } = useAuth();
  return <Navigate to={ROLE_HOME[user.role]} replace />;
}
