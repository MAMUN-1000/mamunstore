import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, ShieldCheck, UserCheck, ArrowRight, Layers, KeyRound } from 'lucide-react';

export const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-14 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Phase 4: Frontend Auth & State Complete
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Internship-Quality <br />
            <span className="text-emerald-400">Full-Stack E-Commerce</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Built with React, Express, PostgreSQL, and Prisma. Features secure HTTP-only cookie authentication, global state via React Context API, and role-based route guards.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Catalog
              <ArrowRight className="w-4 h-4" />
            </Link>

            {user ? (
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition border border-white/20"
              >
                <UserCheck className="w-4 h-4" />
                Profile ({user.name})
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition border border-white/20"
              >
                <KeyRound className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Decorative backdrop element */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">JWT & HTTP-Only Cookies</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Stateless token authentication secured inside <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">httpOnly</code> cookies, immune to client-side XSS script reading.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">React Context API State</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Eliminates prop drilling by broadcasting user session state to every component with automatic session recovery on page refresh.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Protected Route Guards</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Restricts private pages from unauthenticated guests and enforces admin-only privileges for the upcoming admin management portal.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
