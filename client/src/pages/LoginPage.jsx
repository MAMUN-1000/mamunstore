import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, RefreshCw, KeyRound, Mail, User, ShieldCheck } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittingRole, setSubmittingRole] = useState(null); // 'CUSTOMER' | 'ADMIN' | null
  const [errorMessage, setErrorMessage] = useState(null);

  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine where to redirect after login (default to /profile if direct navigation)
  const redirectPath = location.state?.from?.pathname || '/profile';

  const handleLogin = async (targetRole = 'CUSTOMER') => {
    setErrorMessage(null);

    // Basic frontend checks
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmittingRole(targetRole);
      const loggedInUser = await login(email.trim(), password);

      if (targetRole === 'ADMIN') {
        if (loggedInUser?.role !== 'ADMIN') {
          // If a non-admin account attempts to use the administrator sign-in action
          await logout();
          setErrorMessage('Access Denied: This account does not have administrator privileges. Please sign in as a customer.');
          return;
        }
        navigate('/admin', { replace: true });
      } else {
        // Customer sign in
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
      setSubmittingRole(null);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Default enter key triggers customer sign in
    handleLogin('CUSTOMER');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In to Your Account</h1>
          <p className="text-xs text-slate-500">
            Welcome back! Enter your email and password below.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting && submittingRole === 'CUSTOMER' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <User className="w-4 h-4" />
              )}
              {submitting && submittingRole === 'CUSTOMER' ? 'Signing In...' : 'Sign In as Customer'}
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Store Administration
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleLogin('ADMIN')}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer border border-slate-800"
            >
              {submitting && submittingRole === 'ADMIN' ? (
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              )}
              {submitting && submittingRole === 'ADMIN' ? 'Authenticating Admin...' : 'Sign In as Administrator'}
            </button>
          </div>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 pt-2">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-emerald-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
