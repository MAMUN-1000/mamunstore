import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Headphones,
  ShoppingBag,
  CreditCard,
  Truck,
  RotateCcw,
  User,
  Package,
  Star,
} from 'lucide-react';
import {
  HELP_CATEGORIES,
  FAQ_ENTRIES,
  SUPPORT_CONFIG,
} from '../data/helpKnowledgeBase';

export const FaqPage = () => {
  const [search, setSearch] = useState('');
  const [openIds, setOpenIds] = useState({});

  const toggleItem = (id) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'ShoppingBag':
        return <ShoppingBag className="w-4 h-4 text-blue-600" />;
      case 'CreditCard':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'Truck':
        return <Truck className="w-4 h-4 text-purple-600" />;
      case 'RotateCcw':
        return <RotateCcw className="w-4 h-4 text-amber-600" />;
      case 'User':
        return <User className="w-4 h-4 text-indigo-600" />;
      case 'Package':
        return <Package className="w-4 h-4 text-rose-600" />;
      case 'Star':
        return <Star className="w-4 h-4 text-amber-500 fill-amber-400" />;
      case 'Headphones':
        return <Headphones className="w-4 h-4 text-teal-600" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-600" />;
    }
  };

  // Group entries by category
  const groupedFaqs = useMemo(() => {
    const s = search.toLowerCase().trim();

    const filtered = FAQ_ENTRIES.filter((item) => {
      if (!s) return true;
      return (
        item.question.toLowerCase().includes(s) ||
        item.answer.toLowerCase().includes(s) ||
        item.keywords.some((k) => k.toLowerCase().includes(s))
      );
    });

    const groups = {};
    HELP_CATEGORIES.forEach((cat) => {
      const items = filtered.filter((f) => f.category === cat.id);
      if (items.length > 0) {
        groups[cat.id] = {
          category: cat,
          items,
        };
      }
    });

    return groups;
  }, [search]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Frequently Asked Questions</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Common Questions &amp; Verified Answers
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Everything you need to know about our shopping process, payments, campus delivery, and buyer guarantees.
        </p>

        {/* Live Search */}
        <div className="pt-2">
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter FAQs by keyword (e.g. bKash, Savar, return)..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-2.5 text-[11px] text-slate-400 hover:text-slate-600 font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FAQ Groups by Category */}
      <div className="space-y-8">
        {Object.keys(groupedFaqs).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-600 font-semibold">
              No frequently asked questions match "{search}".
            </p>
            <div className="pt-2">
              <button
                onClick={() => setSearch('')}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
              >
                Reset Search Filter
              </button>
            </div>
          </div>
        ) : (
          Object.values(groupedFaqs).map(({ category, items }) => (
            <div
              key={category.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/60">
                  {getCategoryIcon(category.iconName)}
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    {category.name}
                  </h2>
                  <p className="text-[11px] text-slate-400">{category.desc}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {items.map((item) => {
                  const isOpen = openIds[item.id];
                  return (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-xl overflow-hidden transition"
                    >
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full p-3.5 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition cursor-pointer"
                      >
                        <span className="font-semibold text-xs text-slate-800">
                          {item.question}
                        </span>
                        <span className="text-slate-400 flex-shrink-0">
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-600 bg-slate-50/50 border-t border-slate-100 space-y-2 leading-relaxed">
                          <p className="whitespace-pre-line">{item.answer}</p>
                          {item.actionLink && (
                            <div className="pt-1">
                              <Link
                                to={item.actionLink.url}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                              >
                                <span>{item.actionLink.text}</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Still Need Assistance Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
        <h3 className="font-bold text-sm text-emerald-900">
          Still have a question or need personalized assistance?
        </h3>
        <p className="text-xs text-emerald-700 max-w-lg mx-auto">
          Our Customer Care desk at Jahangirnagar University is ready to assist you by phone or through our inquiry desk.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/customer-care"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            Contact Customer Care
          </Link>
          <Link
            to="/help"
            className="px-4 py-2 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-semibold transition"
          >
            Visit Help Center
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
