import { useState, useEffect } from 'react';
import axiosInstance from './api/axiosInstance';
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Server,
  ShoppingBag,
  Database,
  Users,
  Package,
  Layers,
  AlertCircle,
} from 'lucide-react';

function App() {
  const [serverStatus, setServerStatus] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dbError, setDbError] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    setDbError(null);

    // 1. Check Express Server Health
    try {
      const serverRes = await axiosInstance.get('/health');
      setServerStatus(serverRes.data);
    } catch (err) {
      console.error('Backend connection failed:', err);
      setError(err.message || 'Failed to connect to backend server');
      setServerStatus(null);
    }

    // 2. Check Database Health
    try {
      const dbRes = await axiosInstance.get('/health/db');
      setDbStatus(dbRes.data);
    } catch (err) {
      console.error('Database check failed:', err);
      const msg = err.response?.data?.error || err.message || 'Database connection failed';
      setDbError(msg);
      setDbStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-2 rounded-lg shadow-sm">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Internship E-Commerce
              </h1>
              <p className="text-xs text-slate-500 font-medium">Phase 2: Database Modeling & Prisma Setup</p>
            </div>
          </div>
          <button
            onClick={checkHealth}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Express Server Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Backend API Status</h2>
                <p className="text-xs text-slate-500">Port 5000 (Express.js)</p>
              </div>
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                Checking API server...
              </div>
            )}

            {!loading && serverStatus && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-900">Express Server Online</h3>
                  <p className="text-xs text-emerald-700 font-mono mt-0.5">"{serverStatus.message}"</p>
                  <p className="text-xs text-emerald-600 mt-1">
                    Environment: {serverStatus.environment}
                  </p>
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-rose-900">Express Server Offline</h3>
                  <p className="text-xs text-rose-700 mt-0.5">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: PostgreSQL Database Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">PostgreSQL Database Status</h2>
                <p className="text-xs text-slate-500">Prisma ORM Connection</p>
              </div>
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                Connecting to PostgreSQL...
              </div>
            )}

            {!loading && dbStatus && (
              <div className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-emerald-900">PostgreSQL Connected</h3>
                    <p className="text-xs text-emerald-700 font-mono mt-0.5">"{dbStatus.message}"</p>
                  </div>
                </div>

                {/* Seeded Counts Badge Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                    <Layers className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                    <span className="text-lg font-bold text-slate-900">{dbStatus.counts?.categories ?? 0}</span>
                    <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Categories</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                    <Package className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                    <span className="text-lg font-bold text-slate-900">{dbStatus.counts?.products ?? 0}</span>
                    <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Products</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                    <Users className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                    <span className="text-lg font-bold text-slate-900">{dbStatus.counts?.users ?? 0}</span>
                    <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Users</p>
                  </div>
                </div>
              </div>
            )}

            {!loading && dbError && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-amber-900">Database Not Connected Yet</h3>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Set your <code className="bg-white/80 px-1 py-0.5 rounded font-mono">DATABASE_URL</code> in <code className="bg-white/80 px-1 py-0.5 rounded font-mono">server/.env</code> and run <code className="bg-white/80 px-1 py-0.5 rounded font-mono">npx prisma db push</code>.
                  </p>
                  <p className="text-[11px] text-amber-600 font-mono mt-1 break-all">
                    Details: {dbError}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Database Entities Guide */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Phase 2 Database Schema Architecture</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-mono text-xs font-bold text-purple-700 uppercase">Model: User</span>
              <p className="text-xs text-slate-600">Stores customer & admin accounts with bcrypt-hashed passwords and roles (CUSTOMER, ADMIN).</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-mono text-xs font-bold text-purple-700 uppercase">Model: Category</span>
              <p className="text-xs text-slate-600">Product classifications (Electronics, Audio & Gear, Accessories) with unique URL slugs.</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-mono text-xs font-bold text-purple-700 uppercase">Model: Product</span>
              <p className="text-xs text-slate-600">Items for sale with prices, stock levels, images, descriptions, and foreign key to Category.</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-mono text-xs font-bold text-purple-700 uppercase">Model: Order</span>
              <p className="text-xs text-slate-600">Purchase transactions linked to a User, storing total amount, shipping address, and status.</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-mono text-xs font-bold text-purple-700 uppercase">Model: OrderItem</span>
              <p className="text-xs text-slate-600">Join model linking Orders and Products with snapshot purchase price and quantity.</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-mono text-xs font-bold text-purple-700 uppercase">Model: Review</span>
              <p className="text-xs text-slate-600">Customer product reviews with 1 to 5 star ratings, feedback comments, and timestamps.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
