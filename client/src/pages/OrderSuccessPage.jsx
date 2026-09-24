import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { formatBDT, formatUSD } from '../utils/currency';
import {
  CheckCircle2,
  Package,
  MapPin,
  Calendar,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  Receipt,
  Phone,
  CreditCard,
  Building,
} from 'lucide-react';

export const OrderSuccessPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(`/orders/${id}`);
        setOrder(res.data.data.order);
      } catch (err) {
        console.error('Failed to fetch order confirmation:', err);
        setError(err.response?.data?.message || 'Failed to retrieve order confirmation.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-slate-500">Loading order receipt...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-rose-200 rounded-3xl text-center space-y-4">
        <p className="text-xs text-rose-700">{error || 'Order not found.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white"
        >
          Return Home
        </Link>
      </div>
    );
  }

  // Parse shipping address and payment details
  let addressObj = {};
  try {
    addressObj =
      typeof order.shippingAddress === 'string'
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress || {};
  } catch (e) {
    addressObj = { street: order.shippingAddress };
  }

  const paymentDetails = addressObj.paymentDetails || {};
  const paymentMethod = addressObj.paymentMethod || 'card';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Success Hero Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Order Placed Successfully!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            {paymentMethod === 'cod'
              ? 'Thank you! Your order is confirmed and will be dispatched. Please keep cash ready for the delivery rider.'
              : 'Thank you! Your payment authorization was successful and we are preparing your shipment.'}
          </p>
        </div>

        <div className="inline-flex flex-wrap items-center justify-center gap-3 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-semibold">
          <span>Order Reference: #{order.id}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span
            className={`font-bold uppercase ${
              order.status === 'PAID'
                ? 'text-emerald-700'
                : order.status === 'PENDING'
                ? 'text-amber-700'
                : 'text-blue-700'
            }`}
          >
            Status: {order.status === 'PENDING' ? 'Pending Cash Collection' : order.status}
          </span>
        </div>
      </div>

      {/* Order Details & Summary Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Receipt className="w-4 h-4 text-emerald-600" />
            Order Receipt & Breakdown
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(order.createdAt).toLocaleString()}
          </span>
        </div>

        {/* Purchased Items List */}
        <div className="divide-y divide-slate-100 space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.product?.imageUrl}
                  alt={item.product?.name}
                  className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {item.product?.name || `Product #${item.productId}`}
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Qty: {item.quantity} × {formatBDT(item.unitPrice)} ({formatUSD(item.unitPrice)})
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-900 block">
                  {formatBDT(item.quantity * item.unitPrice)}
                </span>
                <span className="text-[10px] text-slate-400">
                  {formatUSD(item.quantity * item.unitPrice)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Destination & Payment Breakdown (2-Column Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Shipping Address Summary */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3 text-xs">
            <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1 text-slate-600 flex-1">
              <strong className="text-slate-900 block font-bold">Delivery Destination:</strong>
              <p className="font-semibold text-slate-800">
                {addressObj.recipientName || order.user?.name}
              </p>
              <p className="text-slate-700 leading-snug">{addressObj.street}</p>
              <p>
                {addressObj.city}
                {addressObj.division ? `, ${addressObj.division} Division` : ''}{' '}
                {addressObj.postalCode ? `- ${addressObj.postalCode}` : ''}
              </p>
              <p className="text-slate-500 font-medium">{addressObj.country || 'Bangladesh'}</p>
              {addressObj.phone && (
                <p className="text-slate-800 font-mono font-medium flex items-center gap-1.5 pt-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  +88 {addressObj.phone}
                </p>
              )}
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3 text-xs">
            <CreditCard className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1.5 text-slate-600 flex-1">
              <strong className="text-slate-900 block font-bold">Payment Method:</strong>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    paymentMethod === 'bkash'
                      ? 'bg-[#E2136E] text-white'
                      : paymentMethod === 'nagad'
                      ? 'bg-[#F7941E] text-white'
                      : paymentMethod === 'cod'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {paymentDetails.methodName || paymentMethod.toUpperCase()}
                </span>
              </div>
              {paymentDetails.trxId && (
                <div className="font-mono text-[11px] text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 inline-block">
                  <span className="text-slate-400">TrxID: </span>
                  <span className="font-bold text-slate-900">{paymentDetails.trxId}</span>
                </div>
              )}
              {paymentDetails.accountNumber && (
                <p className="text-[11px] text-slate-500 font-mono">
                  Account: {paymentDetails.accountNumber}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Total Cost Banner in BDT & USD */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-900 text-sm block">Total Paid</span>
            <span className="text-xs text-slate-400 font-mono">
              USD Equivalent: {formatUSD(order.totalAmount)}
            </span>
          </div>
          <span className="text-2xl font-extrabold text-emerald-700">
            {formatBDT(order.totalAmount)}
          </span>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          to={`/orders/${order.id}/invoice`}
          className="w-full sm:w-1/3 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs text-center transition shadow-sm flex items-center justify-center gap-2"
        >
          <Receipt className="w-4 h-4" />
          Print / View Invoice
        </Link>

        <Link
          to="/orders"
          className="w-full sm:w-1/3 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs text-center transition shadow-sm flex items-center justify-center gap-2"
        >
          <Package className="w-4 h-4" />
          View All Past Orders
        </Link>

        <Link
          to="/products"
          className="w-full sm:w-1/3 py-3.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs text-center transition flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
