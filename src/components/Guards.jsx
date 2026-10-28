import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

function Loading() {
  return (
    <div style={{ minHeight: '60svh', display: 'grid', placeItems: 'center', color: 'var(--muted)' }} role="status">
      Loading…
    </div>
  );
}

export function RequireGuest({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return children;
}

export function RequireAdmin({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
}
