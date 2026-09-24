import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { formatBDT, formatUSD } from '../utils/currency';
import {
  Printer,
  ArrowLeft,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import { SUPPORT_CONFIG } from '../data/helpKnowledgeBase';

export const InvoicePage = () => {
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
        console.error('Failed to fetch invoice data:', err);
        setError(err.response?.data?.message || 'Failed to load order invoice.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-slate-500">Generating invoice document...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-rose-200 rounded-3xl text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="font-bold text-slate-900 text-sm">Invoice Not Found</h3>
        <p className="text-xs text-rose-700">{error || 'Order does not exist.'}</p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Orders
        </Link>
      </div>
    );
  }

  // Parse shipping details
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

  // Calculate items subtotal
  const subtotal = order.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const estimatedTax = subtotal * 0.08;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="flex items-center justify-between print:hidden bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Invoice Sheet */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Header: Store Identity & Invoice Title */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-600 text-white p-2 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                Internship<span className="text-emerald-600">Store</span>
              </span>
            </div>
            <div className="text-xs text-slate-500 space-y-0.5">
              <p>{SUPPORT_CONFIG.campusDesk}</p>
              <p>Hotline: {SUPPORT_CONFIG.phone} • Email: {SUPPORT_CONFIG.email}</p>
              <p>Operating: {SUPPORT_CONFIG.hours}</p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
              Official Invoice
            </h1>
            <p className="text-xs font-mono font-bold text-emerald-700">
              INV-{String(order.id).padStart(6, '0')}
            </p>
            <p className="text-xs text-slate-500">
              Order Ref: #{order.id}
            </p>
            <p className="text-xs text-slate-500">
              Date: {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                Order Status: {order.status}
              </span>
            </div>
          </div>
        </div>

        {/* Bill To & Shipping Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">
              Billed &amp; Delivered To:
            </span>
            <p className="font-bold text-slate-900 text-sm">{order.user?.name}</p>
            <p className="text-slate-600">{order.user?.email}</p>
            {addressObj.phone && (
              <p className="text-slate-600 font-mono">Phone: +88 {addressObj.phone}</p>
            )}
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">
              Shipping Address &amp; Logistics:
            </span>
            <p className="text-slate-800 font-medium">
              {addressObj.street || 'Address not specified'}
            </p>
            <p className="text-slate-600">
              {addressObj.city}
              {addressObj.division ? `, ${addressObj.division} Division` : ''}, Bangladesh
            </p>
            <p className="text-emerald-700 font-semibold pt-1">
              Method: Express Campus &amp; Courier Delivery
            </p>
          </div>
        </div>

        {/* Itemized Products Table */}
        <div className="space-y-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-2">#</th>
                <th className="py-3 px-2">Item Description</th>
                <th className="py-3 px-2 text-center">Qty</th>
                <th className="py-3 px-2 text-right">Unit Price</th>
                <th className="py-3 px-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {order.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-2 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-3.5 px-2">
                    <span className="font-bold text-slate-900 block">
                      {item.product?.name || `Product #${item.productId}`}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      SKU: PRD-{item.productId}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-center font-mono font-bold">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 px-2 text-right font-mono">
                    <div>{formatBDT(item.unitPrice)}</div>
                    <div className="text-[10px] text-slate-400">{formatUSD(item.unitPrice)}</div>
                  </td>
                  <td className="py-3.5 px-2 text-right font-mono font-bold text-slate-900">
                    <div>{formatBDT(item.quantity * item.unitPrice)}</div>
                    <div className="text-[10px] text-slate-400">
                      {formatUSD(item.quantity * item.unitPrice)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Calculation & Payment Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          {/* Payment Method Details */}
          <div className="space-y-2 text-xs">
            <span className="font-bold text-slate-900 text-xs block">
              Payment &amp; Transaction Details:
            </span>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Method:</span>
                <span className="font-bold text-slate-800 uppercase">
                  {paymentDetails.methodName || paymentMethod}
                </span>
              </div>
              {paymentDetails.accountNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Account (MFS):</span>
                  <span className="font-mono text-slate-800">
                    {paymentDetails.accountNumber}
                  </span>
                </div>
              )}
              {paymentDetails.trxId && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Simulation TrxID:</span>
                  <span className="font-mono text-emerald-700 font-bold">
                    {paymentDetails.trxId}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span className="text-slate-500">Settlement:</span>
                <span className="font-semibold text-emerald-700">
                  {paymentMethod === 'cod'
                    ? 'Cash on Delivery (Pending at Doorstep)'
                    : 'Electronic Simulation Settled'}
                </span>
              </div>
            </div>
          </div>

          {/* Subtotal, Tax, Shipping & Grand Total */}
          <div className="space-y-2 text-xs">
            <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-mono font-medium">{formatBDT(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Courier Shipping:</span>
                <span className="font-mono font-medium">
                  {shipping === 0 ? 'FREE' : formatBDT(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Tax (8%):</span>
                <span className="font-mono font-medium">{formatBDT(estimatedTax)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-bold text-sm text-slate-900">Total Amount:</span>
                <div className="text-right">
                  <span className="text-base font-extrabold text-emerald-800 font-mono block">
                    {formatBDT(order.totalAmount)}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono block">
                    {formatUSD(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Returns & Refunds Statement (If Applicable) */}
        {order.returnRequests && order.returnRequests.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>Return / Item Refund Statement</span>
            </div>
            {order.returnRequests.map((ret) => (
              <div key={ret.id} className="text-[11px] text-amber-800 flex justify-between">
                <span>
                  Return #{ret.id} ({ret.reason}) — Status:{' '}
                  <strong>{ret.status}</strong>
                </span>
                <span className="font-mono font-bold">
                  {ret.refundAmount ? formatBDT(ret.refundAmount) : 'Pending Review'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer Notes & Legal */}
        <div className="pt-6 border-t border-slate-200 text-center space-y-1.5 text-[11px] text-slate-400">
          <p className="font-semibold text-slate-600">
            Thank you for shopping with InternshipStore!
          </p>
          <p>
            For customer support or return inquiries, please visit our Help Center at{' '}
            <span className="font-semibold text-slate-700">internshipstore.bd/help</span> or contact us at{' '}
            <span className="font-semibold text-slate-700">{SUPPORT_CONFIG.email}</span>.
          </p>
          <p className="text-[10px] text-slate-400">
            This invoice is generated electronically and serves as official proof of purchase.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
