import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import ProductCard from '../components/ProductCard';
import {
  Search,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Sparkles,
  Zap,
  Star,
  Tag,
  Headphones,
  Laptop,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const HomePage = () => {
  const navigate = useNavigate();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  // Data States
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [budgetDeals, setBudgetDeals] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);

        // Fetch categories and distinct product query slices concurrently
        const [catRes, newestRes, dealsRes, allRes] = await Promise.all([
          axiosInstance.get('/categories'),
          axiosInstance.get('/products', { params: { sortBy: 'newest', limit: 4 } }),
          axiosInstance.get('/products', { params: { sortBy: 'price-asc', limit: 4 } }),
          axiosInstance.get('/products', { params: { limit: 12 } }),
        ]);

        setCategories(catRes.data.data.categories || []);
        setNewArrivals(newestRes.data.data.products || []);
        setBudgetDeals(dealsRes.data.data.products || []);

        // Filter / sort for top-rated customer favorites
        // Data Rule: Prioritize verified top-rated products (averageRating >= 4.0),
        // gracefully falling back to any rated products (averageRating > 0) or flagship items if few reviews exist yet.
        const allProds = allRes.data.data.products || [];
        const highRated = allProds
          .filter((p) => p.averageRating >= 4.0)
          .sort((a, b) => b.averageRating - a.averageRating);

        const anyRated = allProds
          .filter((p) => p.averageRating > 0 || p.reviewCount > 0)
          .sort((a, b) => b.averageRating - a.averageRating);

        if (highRated.length >= 4) {
          setTopRated(highRated.slice(0, 4));
        } else if (anyRated.length > 0) {
          setTopRated(anyRated.slice(0, 4));
        } else {
          setTopRated(allProds.slice(2, 6));
        }
      } catch (err) {
        console.error('Failed to load homepage storefront data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim() && !searchCategory) {
      navigate('/products');
      return;
    }

    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (searchCategory) params.append('category', searchCategory);

    navigate(`/products?${params.toString()}`);
  };

  const categoryIcons = {
    Electronics: <Laptop className="w-6 h-6 text-blue-600" />,
    Accessories: <Headphones className="w-6 h-6 text-purple-600" />,
    'Home & Office': <Layers className="w-6 h-6 text-emerald-600" />,
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Top Promotional Announcement Ticker */}
      <div className="bg-slate-900 text-white text-xs py-2.5 px-4 text-center font-medium border-b border-slate-800">
        <span className="inline-flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            Fast Delivery to <strong>Jahangirnagar University (JU) Savar</strong> & Express Courier across all 8 Divisions of Bangladesh!
          </span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-emerald-400 font-semibold">
            Free Shipping on Orders Over ৳10,000 ($100)
          </span>
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-12">
        {/* Prominent Daraz/Amazon-Inspired Hero Search & Banner Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-12 text-white shadow-xl relative overflow-hidden space-y-8">
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Direct Single-Vendor Storefront &bull; 100% Genuine Tech
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Premium Electronics &amp; Accessories for Work, Study &amp; Play.
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
              Explore authentic tech gadgets with official warranty, verified buyer reviews, Cash on Delivery, and instant bKash or Nagad mobile payments.
            </p>
          </div>

          {/* Large Amazon / Daraz Style Prominent Search Bar */}
          <div className="relative z-10 max-w-3xl bg-white/95 backdrop-blur-md p-2 rounded-2xl sm:rounded-full shadow-2xl border border-white/40">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row items-center gap-2"
            >
              {/* Category Dropdown */}
              <div className="w-full sm:w-44 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-slate-200 px-3 py-1">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="text-slate-800">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Main Search Input */}
              <div className="flex-1 flex items-center gap-2 px-3 py-1 w-full">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for keyboards, mouse, headphones, gadgets..."
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                />
              </div>

              {/* Search Submit Button */}
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl sm:rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 flex-shrink-0"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Quick Search Chips */}
          <div className="relative z-10 flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              Popular Searches:
            </span>
            {['Keyboard', 'Mouse', 'Lamp', 'Audio', 'Electronics'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => navigate(`/products?search=${tag}`)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-medium transition border border-white/10"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Decorative backdrop glow */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        </section>

        {/* Categories Showcase Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Shop by Category
              </h2>
              <p className="text-xs text-slate-500">
                Browse our curated product lines tailored for modern productivity.
              </p>
            </div>
            <Link
              to="/products"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition"
            >
              All Categories &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                    {categoryIcons[cat.name] || <ShoppingBag className="w-6 h-6 text-emerald-600" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {cat.description || 'Explore products in this category'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
              </Link>
            ))}
          </div>
        </section>

        {/* SECTION 1: New Arrivals (Data Rule: sortBy=newest) */}
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  New Arrivals &amp; Latest Drops
                </h2>
                <p className="text-xs text-slate-500">
                  The latest tech accessories and desk essentials just added to stock.
                </p>
              </div>
            </div>
            <Link
              to="/products?sortBy=newest"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition"
            >
              View More &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-72 bg-slate-100 rounded-2xl animate-pulse border border-slate-200/60"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </section>

        {/* Promotional Campaign Banner */}
        <section className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold uppercase tracking-wider border border-purple-500/30">
              <Zap className="w-3 h-3 text-amber-400" />
              University Student &amp; Developer Special
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Equip Your Workspace with High-Performance Tech
            </h3>
            <p className="text-xs text-purple-200 leading-relaxed">
              Order directly to your campus hall or doorstep with Cash on Delivery or bKash. Enjoy verified customer ratings on every device.
            </p>
          </div>

          <Link
            to="/products"
            className="px-6 py-3 rounded-xl bg-white text-purple-950 font-bold text-xs hover:bg-slate-100 transition shadow-md flex-shrink-0"
          >
            Explore Complete Store Catalog &rarr;
          </Link>
        </section>

        {/* SECTION 2: Budget Deals & Bargains (Data Rule: sortBy=price-asc) */}
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Budget Deals &amp; Value Picks
                </h2>
                <p className="text-xs text-slate-500">
                  Affordable gear with top performance—great value for students and professionals.
                </p>
              </div>
            </div>
            <Link
              to="/products?sortBy=price-asc"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition"
            >
              View More Deals &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-72 bg-slate-100 rounded-2xl animate-pulse border border-slate-200/60"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {budgetDeals.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </section>

        {/* SECTION 3: Customer Favorites / Top Rated (Data Rule: Verified Ratings) */}
        {topRated.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    Customer Favorites &amp; Verified Top Rated
                  </h2>
                  <p className="text-xs text-slate-500">
                    Highest-rated products recommended by verified customers who bought them.
                  </p>
                </div>
              </div>
              <Link
                to="/products"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition"
              >
                Browse All &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topRated.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}

        {/* Customer Trust & Service Badges Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs">Verified Buyer Reviews</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Every review comes exclusively from confirmed purchasers with completed orders.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E2136E] flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs">bKash, Nagad &amp; COD</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Seamless MFS simulated payment with TrxID tracking or Cash on Delivery.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs">Nationwide Courier</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Doorstep and campus delivery across all 8 Divisions via Pathao &amp; Steadfast.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-xs">7-Day Return Guarantee</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Hassle-free return request and inspection support for defective items.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
