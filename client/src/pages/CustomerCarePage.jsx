import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Headphones,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  MessageSquare,
  ShoppingBag,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { SUPPORT_CONFIG } from '../data/helpKnowledgeBase';

export const CustomerCarePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderNumber: '',
    category: 'Order & Delivery',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in your name, email, and inquiry message.');
      return;
    }

    setSubmitting(true);

    // Frontend-only simulation of inquiry dispatch
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        orderNumber: '',
        category: 'Order & Delivery',
        message: '',
      });
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
          <Headphones className="w-3.5 h-3.5" />
          <span>Customer Care &amp; Support Services</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          We're Here to Help You
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Have a question about your order, bKash payment verification, or campus delivery to Jahangirnagar University? Connect with our dedicated support team.
        </p>
      </div>

      {/* Main Support Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Physical Campus Desk */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3 hover:border-slate-300 transition">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Campus Service Desk</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {SUPPORT_CONFIG.campusDesk}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{SUPPORT_CONFIG.hours}</span>
            </div>
            <p className="text-[10px] text-slate-400">
              In-person assistance for campus hall deliveries &amp; order collections.
            </p>
          </div>
        </div>

        {/* Customer Care Hotline */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3 hover:border-slate-300 transition">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Direct Telephone Hotline</h3>
            <p className="text-xs font-bold text-slate-800 mt-1">
              {SUPPORT_CONFIG.phone}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
            <p className="font-medium text-slate-700">Operating Schedule:</p>
            <p className="text-[10px] text-slate-400">
              Saturday to Thursday (9:00 AM – 9:00 PM BST). Standard regional call rates apply.
            </p>
          </div>
        </div>

        {/* Support Email */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3 hover:border-slate-300 transition">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Email Support</h3>
            <p className="text-xs font-bold text-slate-800 mt-1">
              {SUPPORT_CONFIG.email}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
            <p className="font-medium text-slate-700">Response Window:</p>
            <p className="text-[10px] text-slate-400">
              Written inquiries are typically responded to within 1 business day.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Form & Side Assistance Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Inquiry Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Submit an Inquiry or Feedback
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill out the form below. Please include your order number if inquiring about an existing purchase.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="p-8 text-center bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-emerald-900">
                Inquiry Received Successfully!
              </h3>
              <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed">
                Thank you for contacting MamunStore Customer Care. A member of our support team will review your inquiry and follow up at your provided email.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  Send Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Inquiry Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  >
                    <option value="Order & Delivery">Order &amp; Delivery</option>
                    <option value="Payment & bKash">Payment &amp; bKash/Nagad</option>
                    <option value="Product & Stock">Product &amp; Stock Availability</option>
                    <option value="Return / Damaged Item">Return / Damaged Item Inquiry</option>
                    <option value="Account & Login">Account &amp; Login</option>
                    <option value="General Feedback">General Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Order Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleChange}
                    placeholder="e.g. ORD-1002"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Your Message *
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your inquiry or issue with as much detail as possible..."
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-y"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right 1 Col: Quick Help & Knowledge Base Links */}
        <div className="space-y-5">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Immediate Self-Service
            </h3>

            <div className="space-y-3">
              <Link
                to="/help"
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 hover:border-emerald-400 hover:shadow-2xs transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-emerald-600 transition">
                      Help Center
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Searchable FAQ knowledge base
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition" />
              </Link>

              <Link
                to="/orders"
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 hover:border-emerald-400 hover:shadow-2xs transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-emerald-600 transition">
                      Track My Order
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Live status for your purchases
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition" />
              </Link>

              <Link
                to="/faq"
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 hover:border-emerald-400 hover:shadow-2xs transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-emerald-600 transition">
                      All FAQs
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Review all verified store policies
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition" />
              </Link>
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 space-y-2">
            <h4 className="font-bold text-xs text-emerald-900">
              Need Faster Answers?
            </h4>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Use our interactive <strong>FAQ Chatbot</strong> in the bottom right corner of the screen for instantaneous answers to common questions about orders, payments, and delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCarePage;
