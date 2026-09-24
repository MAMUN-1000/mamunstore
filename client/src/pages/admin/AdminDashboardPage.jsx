import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { formatBDT, formatUSD } from '../../utils/currency';
import ProductModal from '../../components/admin/ProductModal';
import OrderDetailModal from '../../components/admin/OrderDetailModal';
import ReturnDetailModal from '../../components/admin/ReturnDetailModal';
import {
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Package,
  TrendingUp,
  Receipt,
  Users,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Search,
  Filter,
  RotateCcw,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user } = useAuth();

  // Active Tab: 'analytics' | 'products' | 'orders'
  const [activeTab, setActiveTab] = useState('analytics');

  // Metrics Data
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Products Data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Orders Data
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  // Returns Data
  const [returns, setReturns] = useState([]);
  const [returnsLoading, setReturnsLoading] = useState(false);
  const [returnStatusFilter, setReturnStatusFilter] = useState('ALL');

  // Modals State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [returnModalOpen, setReturnModalOpen] = useState(false);

  // Error & Status Messages
  const [globalError, setGlobalError] = useState(null);

  // 1. Fetch Metrics
  const fetchMetrics = useCallback(async () => {
    try {
      setMetricsLoading(true);
      const res = await axiosInstance.get('/admin/metrics');
      setMetrics(res.data.data);
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
      setGlobalError(err.response?.data?.message || 'Failed to fetch store metrics.');
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  // 2. Fetch Products
  const fetchProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const res = await axiosInstance.get('/products', {
        params: {
          search: productSearch,
          category: selectedCategory,
          limit: 50,
        },
      });
      setProducts(res.data.data.products || []);
    } catch (err) {
      console.error('Failed to load products for admin:', err);
    } finally {
      setProductsLoading(false);
    }
  }, [productSearch, selectedCategory]);

  // 3. Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/categories');
      setCategories(res.data.data.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  // 4. Fetch Orders
  const fetchOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const res = await axiosInstance.get('/orders/admin/all', {
        params: {
          status: orderStatusFilter === 'ALL' ? undefined : orderStatusFilter,
          limit: 50,
        },
      });
      setOrders(res.data.data.orders || []);
    } catch (err) {
      console.error('Failed to load orders for admin:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, [orderStatusFilter]);

  // 5. Fetch Return Requests
  const fetchReturns = useCallback(async () => {
    try {
      setReturnsLoading(true);
      const res = await axiosInstance.get('/returns/admin/all', {
        params: {
          status: returnStatusFilter === 'ALL' ? undefined : returnStatusFilter,
          limit: 50,
        },
      });
      setReturns(res.data.data.returns || []);
    } catch (err) {
      console.error('Failed to load return requests for admin:', err);
    } finally {
      setReturnsLoading(false);
    }
  }, [returnStatusFilter]);

  // Initial Data Load
  useEffect(() => {
    fetchMetrics();
    fetchCategories();
  }, [fetchMetrics, fetchCategories]);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'returns') {
      fetchReturns();
    }
  }, [activeTab, fetchProducts, fetchOrders, fetchReturns]);

  // Product Delete Handler
  const handleDeleteProduct = async (product) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${product.name}"? If it has prior order history, deletion will be blocked to maintain audit integrity.`
      )
    ) {
      return;
    }

    try {
      await axiosInstance.delete(`/products/${product.id}`);
      fetchProducts();
      fetchMetrics();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  // Quick Order Status Change
  const handleQuickStatusChange = async (orderId, newStatus) => {
    try {
      await axiosInstance.patch(`/orders/admin/${orderId}/status`, {
        status: newStatus,
      });
      fetchOrders();
      fetchMetrics();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status.');
    }
  };

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Paid
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Truck className="w-3 h-3 text-blue-600" />
            Shipped
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <CheckCircle2 className="w-3 h-3 text-purple-600" />
            Delivered
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending
          </span>
        );
    }
  };

  const parseOrderAddress = (raw) => {
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : raw || {};
    } catch {
      return { street: raw };
    }
  };

  const getReturnStatusBadge = (st) => {
    switch (st) {
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Refunded
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            Approved
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Under Review
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-500" />
            Requested
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Store Admin Portal
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-full uppercase">
                Admin Role
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged in as <strong className="text-slate-200">{user?.email}</strong>. Manage inventory, orders, and sales across Bangladesh.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              fetchMetrics();
              if (activeTab === 'products') fetchProducts();
              if (activeTab === 'orders') fetchOrders();
              if (activeTab === 'returns') fetchReturns();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Data
          </button>
        </div>
      </div>

      {globalError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      {/* Tab Navigation Navigation Bar */}
      <div className="flex items-center border-b border-slate-200 text-sm font-semibold gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'analytics'
              ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Analytics & KPIs
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'products'
              ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Package className="w-4 h-4" />
          Product Inventory ({metrics?.kpis.totalProducts ?? '...'})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'orders'
              ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Receipt className="w-4 h-4" />
          Customer Orders ({metrics?.kpis.totalOrders ?? '...'})
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'returns'
              ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          Returns &amp; Refunds
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: ANALYTICS & KPIS */}
      {/* ======================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fadeIn">
          {metricsLoading ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
              <p className="text-sm text-slate-500">Calculating store metrics...</p>
            </div>
          ) : (
            <>
              {/* 4 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Revenue */}
                <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Total Sales Revenue
                    </span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-2xl font-extrabold text-emerald-700 block">
                      {formatBDT(metrics?.kpis.totalRevenue || 0)}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {formatUSD(metrics?.kpis.totalRevenue || 0)} USD
                    </span>
                  </div>
                </div>

                {/* Total Orders */}
                <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Total Orders Placed
                    </span>
                    <Receipt className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-3xl font-extrabold text-slate-900 block">
                    {metrics?.kpis.totalOrders}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Across bKash, Nagad, COD & Card
                  </span>
                </div>

                {/* Products & Low Stock */}
                <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Active Products
                    </span>
                    <Package className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-3xl font-extrabold text-slate-900 block">
                    {metrics?.kpis.totalProducts}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs">
                    {metrics?.kpis.lowStockCount > 0 ? (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {metrics.kpis.lowStockCount} items low stock
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-medium">All items well stocked</span>
                    )}
                  </div>
                </div>

                {/* Customers */}
                <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Registered Customers
                    </span>
                    <Users className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-3xl font-extrabold text-slate-900 block">
                    {metrics?.kpis.totalCustomers}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Verified customer accounts
                  </span>
                </div>
              </div>

              {/* Low Stock Alerts & Recent Orders Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Low Stock Warning Box */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <h3 className="font-bold text-sm text-slate-900">
                        Low Stock Inventory Alert (&le; 5 units)
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="text-xs font-semibold text-purple-600 hover:text-purple-700"
                    >
                      Manage All &rarr;
                    </button>
                  </div>

                  {metrics?.lowStockProducts.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No low stock alerts. All product inventory is healthy.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 space-y-2">
                      {metrics?.lowStockProducts.map((p) => (
                        <div
                          key={p.id}
                          className="pt-2 first:pt-0 flex items-center justify-between text-xs"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 block truncate max-w-[240px]">
                              {p.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {p.category?.name || 'Uncategorized'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                p.stock === 0
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {p.stock === 0 ? 'SOLD OUT' : `${p.stock} left`}
                            </span>
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setProductModalOpen(true);
                              }}
                              className="text-[11px] text-purple-600 hover:underline font-semibold"
                            >
                              Restock
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Orders Snapshot */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-purple-600" />
                      <h3 className="font-bold text-sm text-slate-900">Recent Customer Orders</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-semibold text-purple-600 hover:text-purple-700"
                    >
                      View All &rarr;
                    </button>
                  </div>

                  {metrics?.recentOrders.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No customer orders have been placed yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 space-y-2">
                      {metrics?.recentOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="pt-2 first:pt-0 flex items-center justify-between text-xs"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 block">
                              Order #{ord.id} — {ord.user?.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(ord.createdAt).toLocaleDateString()} &bull;{' '}
                              {ord.items?.length} items
                            </span>
                          </div>
                          <div className="text-right space-y-1">
                            <span className="font-bold text-emerald-700 block">
                              {formatBDT(ord.totalAmount)}
                            </span>
                            {getOrderStatusBadge(ord.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PRODUCT INVENTORY CRUD */}
      {/* ======================================================== */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Action Header & Search Controls */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
                />
              </div>

              {/* Category Filter */}
              <div className="w-full sm:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add Product Button */}
            <button
              onClick={() => {
                setEditingProduct(null);
                setProductModalOpen(true);
              }}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add New Product
            </button>
          </div>

          {/* Products Data Table */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            {productsLoading ? (
              <div className="py-16 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                Loading inventory...
              </div>
            ) : products.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                No products found matching your filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Product</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Price (BDT & USD)</th>
                      <th className="py-3.5 px-4">Stock</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate max-w-xs">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              /{p.slug}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {p.category?.name || 'General'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">
                            {formatBDT(p.price)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatUSD(p.price)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.stock === 0
                                ? 'bg-rose-100 text-rose-800'
                                : p.stock <= 5
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {p.stock === 0 ? 'Out of Stock' : `${p.stock} units`}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setProductModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                              title="Edit product"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: CUSTOMER ORDERS & FULFILLMENT */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Order Status Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-700">Filter by Status:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {['ALL', 'PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl font-semibold transition ${
                    orderStatusFilter === st
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            {ordersLoading ? (
              <div className="py-16 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                No orders found under &ldquo;{orderStatusFilter}&rdquo; status.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Order Ref</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Payment Method</th>
                      <th className="py-3.5 px-4">Total Paid</th>
                      <th className="py-3.5 px-4">Status & Transition</th>
                      <th className="py-3.5 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((ord) => {
                      const addr = parseOrderAddress(ord.shippingAddress);
                      const paymentMethod = addr.paymentMethod || 'card';
                      const paymentDetails = addr.paymentDetails || {};

                      return (
                        <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-slate-900 block">
                              #{ord.id}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-800 block">
                              {ord.user?.name}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {ord.user?.email}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                paymentMethod === 'bkash'
                                  ? 'bg-pink-100 text-[#E2136E]'
                                  : paymentMethod === 'nagad'
                                  ? 'bg-amber-100 text-[#F7941E]'
                                  : paymentMethod === 'cod'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {paymentDetails.methodName || paymentMethod.toUpperCase()}
                            </span>
                            {paymentDetails.trxId && (
                              <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                                {paymentDetails.trxId}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-emerald-700 block">
                              {formatBDT(ord.totalAmount)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {formatUSD(ord.totalAmount)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <select
                              value={ord.status}
                              onChange={(e) => handleQuickStatusChange(ord.id, e.target.value)}
                              className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
                            >
                              {['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(
                                (st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                )
                              )}
                            </select>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedOrder(ord);
                                setOrderModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: RETURNS & REFUNDS MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'returns' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Controls Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                  Customer Return Requests ({returns.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Review partial item returns, inspect defect descriptions, and issue refunds.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              <select
                value={returnStatusFilter}
                onChange={(e) => setReturnStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
              >
                <option value="ALL">All Return Statuses</option>
                <option value="REQUESTED">Requested (New)</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REFUNDED">Refunded</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Returns Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {returnsLoading ? (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-600" />
                <p className="text-xs">Loading return requests...</p>
              </div>
            ) : returns.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <RotateCcw className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">No return requests found</p>
                <p className="text-xs text-slate-400">
                  {returnStatusFilter !== 'ALL'
                    ? `No requests matching status "${returnStatusFilter}".`
                    : 'No customer return requests have been submitted yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Return ID</th>
                      <th className="py-3 px-4">Order Ref</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Returned Items</th>
                      <th className="py-3 px-4">Reason</th>
                      <th className="py-3 px-4">Refund Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {returns.map((ret) => (
                      <tr key={ret.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                          #RET-{ret.id}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-purple-700">
                          #ORD-{ret.orderId}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block truncate">
                            {ret.user?.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {ret.user?.email}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 block">
                            {ret.items?.length} item line(s)
                          </span>
                          <span className="text-[10px] text-slate-500 line-clamp-1">
                            {ret.items?.map((i) => `${i.quantity}x ${i.orderItem?.product?.name}`).join(', ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-800 block">
                            {ret.reason}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {new Date(ret.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-emerald-700 block font-mono">
                            {formatBDT(ret.refundAmount || 0)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatUSD(ret.refundAmount || 0)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {getReturnStatusBadge(ret.status)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedReturn(ret);
                              setReturnModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold text-xs transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Review &amp; Resolve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Modal (Create & Edit) */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        product={editingProduct}
        categories={categories}
        onSuccess={() => {
          setProductModalOpen(false);
          fetchProducts();
          fetchMetrics();
        }}
      />

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        order={selectedOrder}
        onStatusUpdated={() => {
          fetchOrders();
          fetchMetrics();
        }}
      />

      {/* Return Detail Modal */}
      <ReturnDetailModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        returnRequest={selectedReturn}
        onUpdated={() => {
          fetchReturns();
          fetchMetrics();
        }}
      />
    </div>
  );
};

export default AdminDashboardPage;
