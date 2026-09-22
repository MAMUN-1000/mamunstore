import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, ShieldAlert } from 'lucide-react';

/**
 * ProtectedRoute Component:
 * Guards routes from unauthenticated users and restricts admin routes.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component to render if authorized
 * @param {boolean} [props.adminOnly=false] - Whether this route requires ADMIN role
 */
export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Show loading spinner while AuthContext checks for an existing session cookie
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-slate-500">Verifying authentication session...</p>
      </div>
    );
  }

  // 2. If user is not logged in, redirect to /login and save current location
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. If route requires ADMIN role and current user is only a CUSTOMER
  if (adminOnly && user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white border border-rose-200 rounded-xl shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-600">
          You do not have administrator permissions to view this page. This portal is restricted to accounts with the <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono font-bold">ADMIN</code> role.
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }

  // 4. Authorized: render child components
  return children;
};

export default ProtectedRoute;
