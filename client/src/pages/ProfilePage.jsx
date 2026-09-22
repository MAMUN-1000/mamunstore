import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, LogOut, ShieldCheck, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const ProfilePage = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Profile Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isAdmin
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}
              >
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">{user.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>

      {/* Account Details Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
            Account Information
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-500 w-24">Full Name:</span>
              <span className="font-medium text-slate-800">{user.name}</span>
            </div>

            <div className="flex items-center gap-3 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-500 w-24">Email:</span>
              <span className="font-medium text-slate-800">{user.email}</span>
            </div>

            <div className="flex items-center gap-3 text-slate-600">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-500 w-24">Role:</span>
              <span className="font-medium text-slate-800">{user.role}</span>
            </div>

            {user.createdAt && (
              <div className="flex items-center gap-3 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-500 w-24">Member Since:</span>
                <span className="font-medium text-slate-800">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
            Available Features
          </h2>

          <div className="space-y-3">
            <Link
              to="/"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-emerald-100 text-emerald-700">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                    Product Catalog (Phase 5)
                  </h3>
                  <p className="text-[11px] text-slate-500">Browse and search items</p>
                </div>
              </div>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center justify-between p-3 rounded-lg border border-purple-200 bg-purple-50/30 hover:bg-purple-100/50 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-purple-100 text-purple-700">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-purple-900">Admin Portal</h3>
                    <p className="text-[11px] text-purple-600">Access administrator controls</p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
