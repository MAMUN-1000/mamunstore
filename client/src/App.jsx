import { useState, useEffect } from 'react';
import axiosInstance from './api/axiosInstance';
import { CheckCircle2, XCircle, RefreshCw, Server, ShoppingBag, Database, ShieldCheck } from 'lucide-react';

function App() {
  const [serverStatus, setServerStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to ping the backend Express server
  const checkBackendHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/health');
      setServerStatus(response.data);
    } catch (err) {
      console.error('Backend connection failed:', err);
      setError(err.message || 'Failed to connect to backend server');
      setServerStatus(null);
    } finally {
      setLoading(false);
    }
  };

  // Run the check once when the component mounts
  useEffect(() => {
    checkBackendHealth();
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
              <p className="text-xs text-slate-500 font-medium">Phase 1: Environment & Foundations</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Frontend Ready (Port 5173)
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Backend Connectivity Status Card */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Backend API Connectivity Test</h2>
                <p className="text-sm text-slate-500">
                  Target: <code className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-700">http://localhost:5000/api/health</code>
                </p>
              </div>
            </div>

            <button
              onClick={checkBackendHealth}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Test Connection Again
            </button>
          </div>

          <div className="mt-6">
            {loading && (
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                <span className="text-sm font-medium">Connecting to Express server on port 5000...</span>
              </div>
            )}

            {!loading && serverStatus && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-emerald-900">
                      Successfully Connected to Backend!
                    </h3>
                    <p className="text-xs text-emerald-700 font-mono">
                      Server message: "{serverStatus.message}"
                    </p>
                    <p className="text-xs text-emerald-600">
                      Timestamp: {new Date(serverStatus.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-rose-900">
                      Cannot Connect to Backend Server
                    </h3>
                    <p className="text-xs text-rose-700">Error: {error}</p>
                    <p className="text-xs text-rose-600 mt-2">
                      Make sure your Express server is running on port 5000 (<code className="bg-white/60 px-1 py-0.5 rounded font-mono">npm run dev</code> inside <code className="bg-white/60 px-1 py-0.5 rounded font-mono">server/</code>).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Learning Roadmap Overview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-slate-900">Decoupled Architecture</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              React runs on port 5173 and Express on port 5000. They communicate strictly over HTTP using JSON, just like production cloud services.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Ready for Database (Phase 2)</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              With the client-server bridge confirmed, we will connect PostgreSQL and design our relational database schema using Prisma in the next phase.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Security Ready</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Axios is pre-configured with <code className="bg-slate-100 px-1 rounded text-xs">withCredentials: true</code> to support HTTP-only secure cookie authentication.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
