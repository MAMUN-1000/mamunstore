import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
} from 'lucide-react';

// Configurable Social Media Links (can be mapped from environment or site configuration)
const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    url: 'https://facebook.com/internshipstore.bd',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    hoverColor: 'hover:text-blue-600 hover:bg-blue-50',
  },
  {
    name: 'WhatsApp',
    url: 'https://wa.me/8801700000000',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12.031 0C5.394 0 0 5.394 0 12.031c0 2.12.553 4.19 1.604 6.012L.071 24l6.125-1.606a11.97 11.97 0 005.835 1.503h.005c6.632 0 12.025-5.395 12.025-12.032 0-3.214-1.251-6.235-3.524-8.51A11.95 11.95 0 0012.031 0zm0 21.884h-.004a9.89 9.89 0 01-5.04-1.378l-.362-.215-3.743.982.999-3.649-.236-.376A9.873 9.873 0 012.138 12.03c0-5.457 4.437-9.895 9.897-9.895 2.643 0 5.127 1.03 6.993 2.898 1.867 1.868 2.895 4.353 2.895 6.998 0 5.459-4.44 9.898-9.892 9.898z" />
      </svg>
    ),
    hoverColor: 'hover:text-emerald-600 hover:bg-emerald-50',
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/internshipstore.bd',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    hoverColor: 'hover:text-pink-600 hover:bg-pink-50',
  },
  {
    name: 'X (Twitter)',
    url: 'https://x.com/internshipstore',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    hoverColor: 'hover:text-slate-900 hover:bg-slate-100',
  },
];

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto text-xs text-slate-600">
      {/* Upper Main Footer Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand & Store Bio */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-emerald-600 group-hover:bg-emerald-700 text-white p-2 rounded-xl transition shadow-sm">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base text-slate-900 tracking-tight">
              Internship<span className="text-emerald-600">Store</span>
            </span>
          </Link>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Your trusted destination for premium electronics, tech gadgets, and daily accessories across Bangladesh. Fast delivery to Jahangirnagar University, Savar, and nationwide.
          </p>

          <div className="space-y-1.5 text-slate-500 text-[11px]">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Jahangirnagar University, Savar, Dhaka - 1342</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>+880 1712-345678 (9 AM – 9 PM)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>support@internshipstore.bd</span>
            </div>
          </div>
        </div>

        {/* Customer Care & Policies */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Customer Care
          </h4>
          <ul className="space-y-2">
            <li>
              <Link to="/help" className="hover:text-emerald-600 transition">
                Help &amp; Support Center
              </Link>
            </li>
            <li>
              <Link to="/customer-care" className="hover:text-emerald-600 transition">
                Contact Customer Care Desk
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-emerald-600 transition">
                Frequently Asked Questions
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-emerald-600 transition">
                Track My Order
              </Link>
            </li>
            <li>
              <Link to="/help?category=returns" className="hover:text-emerald-600 transition">
                Return &amp; Damage Assistance
              </Link>
            </li>
            <li>
              <Link to="/help?category=delivery" className="hover:text-emerald-600 transition">
                JU Campus Delivery Rates
              </Link>
            </li>
          </ul>
        </div>

        {/* Shop Quick Links */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Shop Catalog
          </h4>
          <ul className="space-y-2">
            <li>
              <Link to="/products" className="hover:text-emerald-600 transition">
                All Products
              </Link>
            </li>
            <li>
              <Link to="/products?category=1" className="hover:text-emerald-600 transition">
                Electronics & Gadgets
              </Link>
            </li>
            <li>
              <Link to="/products?category=2" className="hover:text-emerald-600 transition">
                Accessories & Audio
              </Link>
            </li>
            <li>
              <Link to="/products?category=3" className="hover:text-emerald-600 transition">
                Home & Office Gear
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-emerald-600 transition">
                My Shopping Cart
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Links & Trust */}
        <div className="space-y-4">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Connect With Us
          </h4>
          <p className="text-slate-500 text-[11px]">
            Follow our social channels for flash sales, university campus discounts, and gadget updates.
          </p>

          {/* Social Media Link Pills */}
          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map((item) => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`Follow on ${item.name}`}
                className={`w-8 h-8 rounded-xl border border-slate-200 text-slate-500 flex items-center justify-center transition ${item.hoverColor}`}
              >
                {item.icon}
              </a>
            ))}
          </div>

          {/* Delivery & Security Note */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>100% Genuine Products with Cash on Delivery</span>
          </div>
        </div>
      </div>

      {/* Payment Methods & Bottom Bar */}
      <div className="border-t border-slate-100 bg-slate-50/70">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 mr-2 uppercase tracking-wider">
              Accepted Payments:
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E2136E] text-white">
              bKash
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F7941E] text-white">
              Nagad
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Cash on Delivery (COD)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
              Visa / Mastercard
            </span>
          </div>

          <p className="text-[11px] text-slate-400 text-center md:text-right">
            &copy; {new Date().getFullYear()} InternshipStore BD. Single-Vendor Retail Storefront.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
