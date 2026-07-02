import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

export function RequireAuth({ children, requireCurator = false }: { children: React.ReactNode; requireCurator?: boolean }) {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireCurator && user.role !== 'curator') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
