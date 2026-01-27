import { Navigate } from 'react-router-dom';
import { isAuthenticated, getAuth } from '../utils/auth';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const auth = isAuthenticated();
  const { user } = getAuth();

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

