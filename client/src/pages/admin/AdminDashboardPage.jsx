import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [adminCheckResult, setAdminCheckResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const testAdminAccess = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get('/auth/admin-check');
      setAdminCheckResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Admin verification failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAdminAccess();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Administrator Portal</h1>
            <p className="text-xs text-slate-500">
              Elevated access confirmed for: <span className="font-semibold">{user?.email}</span>
            </p>
          </div>
        </div>

        <button
          onClick={testAdminAccess}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Verify Server Access
        </button>
      </div>

      {/* Backend Verification Status Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
          Backend RBAC (Role-Based Access Control) Test
        </h2>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
            Querying <code className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono">/api/auth/admin-check</code>...
          </div>
        )}

        {!loading && adminCheckResult && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-emerald-900">
                Backend Authorization Verified (200 OK)
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5 font-mono">
                "{adminCheckResult.message}"
              </p>
              <p className="text-xs text-emerald-600 mt-2">
                The Express backend verified your JWT role is <code className="bg-emerald-100/60 px-1 rounded font-bold">ADMIN</code> via <code className="bg-emerald-100/60 px-1 rounded">verifyAdmin</code> middleware.
              </p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-rose-900">Authorization Failed</h3>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
