import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import ProductCard from '../components/ProductCard';
import { Search, Filter, ArrowUpDown, RotateCcw, RefreshCw, AlertCircle, PackageX } from 'lucide-react';

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 6, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Extract query params from URL
  const rawCategoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const currentPage = parseInt(searchParams.get('page'), 10) || 1;

  // Resolve category (supports numeric ID or case-insensitive category name)
  const matchedCategory = categories.find(
    (c) => String(c.id) === rawCategoryParam || c.name.toLowerCase() === rawCategoryParam.toLowerCase()
  );
  const selectedCategory = matchedCategory ? String(matchedCategory.id) : rawCategoryParam;

  // Search input state (initialized from URL)
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [prevSearchParam, setPrevSearchParam] = useState(searchParam);

  // Sync search input if URL search param changes without cascading effect renders
  if (searchParam !== prevSearchParam) {
    setPrevSearchParam(searchParam);
    setSearchTerm(searchParam);
  }

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get('/categories');
        setCategories(res.data.data.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products whenever filters, page, or retryCount changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: currentPage,
          limit: 6,
          sortBy,
        };

        if (searchTerm.trim()) {
          params.search = searchTerm.trim();
        }
        if (selectedCategory) {
          params.category = selectedCategory;
        }

        const res = await axiosInstance.get('/products', { params });
        setProducts(res.data.data.products);
        setPagination(res.data.data.pagination);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, selectedCategory, sortBy, currentPage, retryCount]);

  const handleCategoryChange = (e) => {
    const nextCategory = e.target.value;
    const nextParams = new URLSearchParams(searchParams);
    if (nextCategory) {
      nextParams.set('category', nextCategory);
    } else {
      nextParams.delete('category');
    }
    nextParams.delete('page');
    setSearchParams(nextParams);
  };

  const handleSortChange = (e) => {
    const nextSort = e.target.value;
    const nextParams = new URLSearchParams(searchParams);
    if (nextSort && nextSort !== 'newest') {
      nextParams.set('sortBy', nextSort);
    } else {
      nextParams.delete('sortBy');
    }
    setSearchParams(nextParams);
  };

  const handlePageChange = (newPage) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newPage > 1) {
      nextParams.set('page', newPage.toString());
    } else {
      nextParams.delete('page');
    }
    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSearchParams({});
  };

  const handleSearchInput = (e) => {
    setSearchTerm(e.target.value);
    if (currentPage !== 1) {
      handlePageChange(1);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      const nextParams = new URLSearchParams(searchParams);
      if (searchTerm.trim()) {
        nextParams.set('search', searchTerm.trim());
      } else {
        nextParams.delete('search');
      }
      nextParams.delete('page');
      setSearchParams(nextParams);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Product Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explore premium gear, electronics, and accessories.
          </p>
        </div>

        <span className="inline-flex items-center self-start sm:self-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          Showing {products.length} of {pagination.total} items
        </span>
      </div>

      {/* Filter & Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchInput}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>

          {/* 2. Category Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full pl-10 pr-8 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition appearance-none bg-white text-slate-700 cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.name} ({cat._count?.products || 0})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Sort Order */}
          <div className="relative">
            <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="w-full pl-10 pr-8 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition appearance-none bg-white text-slate-700 cursor-pointer"
            >
              <option value="newest">Sort: Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Alphabetical (A - Z)</option>
            </select>
          </div>

          {/* 4. Reset Button */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Product Content State Handling */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm font-medium">Loading catalog items...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h3 className="font-bold text-rose-900">Failed to Load Products</h3>
          <p className="text-xs text-rose-700">{error}</p>
          <button
            onClick={() => setRetryCount((c) => c + 1)}
            className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition"
          >
            Try Again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <PackageX className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No Products Found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              We couldn't find any products matching your active filters. Try adjusting your search term or category.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination Navigation Controls */}
          {pagination.totalPages > 1 && (
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-500 font-medium">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={pagination.page <= 1}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                      pagination.page === pageNum
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(Math.min(currentPage + 1, pagination.totalPages))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CatalogPage;
