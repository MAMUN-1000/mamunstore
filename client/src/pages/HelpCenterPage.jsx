import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  CreditCard,
  Truck,
  RotateCcw,
  User,
  Package,
  Star,
  Headphones,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import {
  HELP_CATEGORIES,
  FAQ_ENTRIES,
  SUPPORT_CONFIG,
} from '../data/helpKnowledgeBase';

export const HelpCenterPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState(null);

  const getCategoryIcon = (iconName, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'ShoppingBag':
        return <ShoppingBag className={className} />;
      case 'CreditCard':
        return <CreditCard className={className} />;
      case 'Truck':
        return <Truck className={className} />;
      case 'RotateCcw':
        return <RotateCcw className={className} />;
      case 'User':
        return <User className={className} />;
      case 'Package':
        return <Package className={className} />;
      case 'Star':
        return <Star className={className} />;
      case 'Headphones':
        return <Headphones className={className} />;
      default:
        return <HelpCircle className={className} />;
    }
  };

  // Filter FAQs based on active category and live search term
  const filteredFaqs = useMemo(() => {
    return FAQ_ENTRIES.filter((entry) => {
      // Category check
      const matchesCategory =
        selectedCategory === 'all' || entry.category === selectedCategory;

      // Search query check
      if (!searchQuery.trim()) return matchesCategory;

      const q = searchQuery.toLowerCase();
      const matchesText =
        entry.question.toLowerCase().includes(q) ||
        entry.answer.toLowerCase().includes(q) ||
        entry.keywords.some((k) => k.toLowerCase().includes(q));

      return matchesCategory && matchesText;
    });
  }, [selectedCategory, searchQuery]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  const toggleAccordion = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Hero Search Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 text-center shadow-lg">
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Store Help &amp; Support Center</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            How can we assist you today?
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Find instant answers regarding orders, bKash &amp; Nagad payments, JU Savar deliveries, and account access.
          </p>

          {/* Search Bar */}
          <div className="pt-2">
            <div className="relative max-w-xl mx-auto">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics (e.g., bKash, delivery, cancel order, reviews)..."
                className="w-full pl-12 pr-4 py-3.5 text-sm bg-white text-slate-900 rounded-2xl shadow-md border-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-3.5 text-xs text-slate-400 hover:text-slate-600 font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Subtle decorative background gradient */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Category Navigation Tiles */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Browse by Topic
          </h2>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => handleCategorySelect('all')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
            >
              Show All Topics
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {HELP_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {getCategoryIcon(cat.iconName, 'w-4 h-4')}
                </div>
                <div>
                  <h3
                    className={`font-bold text-xs ${
                      isSelected ? 'text-emerald-900' : 'text-slate-900'
                    }`}
                  >
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {cat.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {filteredFaqs.length} {filteredFaqs.length === 1 ? 'article' : 'articles'}
            </span>
          </div>

          <Link
            to="/faq"
            className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
          >
            <span>Full FAQ Page</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">
              No articles match your search
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn't find any help articles matching "{searchQuery}". Try different keywords or speak with our Customer Care desk.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
              >
                Reset Filters
              </button>
              <Link
                to="/customer-care"
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
              >
                Contact Customer Care
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-shadow shadow-2xs hover:shadow-xs"
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {faq.question}
                      </span>
                    </div>
                    <span className="text-slate-400 p-1">
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-700 space-y-3">
                      <p className="whitespace-pre-line leading-relaxed">
                        {faq.answer}
                      </p>

                      {faq.actionLink && (
                        <div className="pt-1">
                          <Link
                            to={faq.actionLink.url}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                          >
                            <span>{faq.actionLink.text}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Customer Care Channels & Shortcuts */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        {/* Physical Campus Desk */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
            Campus Service Desk
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {SUPPORT_CONFIG.campusDesk}
          </p>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{SUPPORT_CONFIG.hours}</span>
          </div>
        </div>

        {/* Direct Telephone Support */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
            Customer Care Hotline
          </h3>
          <p className="text-xs text-slate-800 font-semibold">
            {SUPPORT_CONFIG.phone}
          </p>
          <p className="text-[11px] text-slate-500">
            For urgent delivery or order confirmation assistance.
          </p>
        </div>

        {/* Email & Form Support */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2.5 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              Online Inquiry &amp; Support
            </h3>
            <p className="text-xs text-slate-500">
              Submit your inquiry online and our support staff will assist you.
            </p>
          </div>
          <Link
            to="/customer-care"
            className="mt-3 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
          >
            <span>Open Customer Care Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HelpCenterPage;
