import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import {
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get('/orders/my-orders');
        setOrders(res.data.data.orders || []);
      } catch (err) {
        console.error('Failed to load order history:', err);
        setError(err.response?.data?.message || 'Failed to retrieve order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Paid & Confirmed
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            Shipped
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
            Delivered
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-slate-500">Loading your purchase history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-rose-200 rounded-2xl text-center space-y-4 shadow-sm">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Error Loading Orders</h2>
        <p className="text-xs text-rose-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Order History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your previous purchases and view transaction receipts.
          </p>
        </div>

        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-center border border-slate-200">
          Total Orders: {orders.length}
        </span>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-lg">No Orders Placed Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Once you checkout and purchase products, your order history and tracking will appear here.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition"
          >
            <ShoppingBag className="w-4 h-4" />
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition space-y-4"
            >
              {/* Order Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-slate-900 text-base">
                      Order #{order.id}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400 block font-medium">Total Paid</span>
                  <span className="text-lg font-extrabold text-slate-900">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Items Preview */}
              <div className="divide-y divide-slate-100 space-y-2">
                {order.items?.map((item) => (
                  <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.product?.imageUrl}
                        alt={item.product?.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 block truncate">
                          {item.product?.name || `Product #${item.productId}`}
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 whitespace-nowrap">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Footer Link */}
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <Link
                  to={`/order-success/${order.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
                >
                  View Full Receipt & Delivery Details
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
