import { ShoppingBag } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 text-white p-1.5 rounded-md">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-slate-800">
            Internship E-Commerce
          </span>
        </div>
        <p className="text-xs text-slate-500 text-center sm:text-right">
          Full-Stack Learning Project • Built with React, Express, and PostgreSQL
        </p>
      </div>
    </footer>
  );
};

export default Footer;
