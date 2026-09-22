import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, User, LogOut, ShieldCheck, LogIn, UserPlus } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="bg-emerald-600 group-hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors shadow-sm">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">
            Internship<span className="text-emerald-600">Store</span>
          </span>
        </Link>

        {/* Center / Navigation Links */}
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
          >
            Home
          </Link>

          <Link
            to="/products"
            className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
          >
            Catalog
          </Link>

          {/* Admin link if user is ADMIN */}
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              Admin Portal
            </Link>
          )}
        </nav>

        {/* Right / Auth Controls */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-20 h-8 bg-slate-100 animate-pulse rounded-lg" />
          ) : user ? (
            // Logged In Controls
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden sm:inline">{user.name}</span>
              </Link>

              <button
                onClick={handleLogout}
                title="Log out of your account"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            // Logged Out Controls
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
