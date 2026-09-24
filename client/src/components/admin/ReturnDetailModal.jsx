import { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { formatBDT, formatUSD } from '../../utils/currency';
import {
  X,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Package,
  User,
  MapPin,
  CreditCard,
  Layers,
  ArrowRight,
} from 'lucide-react';

const RETURN_STATUSES = ['REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'REFUNDED', 'REJECTED'];

export const ReturnDetailModal = ({ returnRequest, isOpen, onClose, onUpdated }) => {
  const [status, setStatus] = useState(returnRequest?.status || 'REQUESTED');
  const [adminNotes, setAdminNotes] = useState(returnRequest?.adminNotes || '');
  const [restockItems, setRestockItems] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !returnRequest) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setSubmitting(true);
      const res = await axiosInstance.patch(`/returns/admin/${returnRequest.id}/status`, {
        status,
        adminNotes,
        restockItems,
      });

      if (onUpdated) {
        onUpdated(res.data.data.returnRequest);
      }
      onClose();
    } catch (err) {
      console.error('Failed to update return status:', err);
      setError(err.response?.data?.message || 'Failed to update return request status.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Refunded &amp; Resolved
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            Approved
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Under Review
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-500" />
            Requested
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">
                  Return #{returnRequest.id}
                </h3>
                {getStatusBadge(returnRequest.status)}
              </div>
              <p className="text-[11px] text-slate-500">
                Order #{returnRequest.orderId} • Submitted on{' '}
                {new Date(returnRequest.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer & Reason Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Customer Information
              </span>
              <p className="font-bold text-slate-800 text-xs">
                {returnRequest.user?.name}
              </p>
              <p className="text-slate-500 text-[11px]">{returnRequest.user?.email}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Return Reason
              </span>
              <p className="font-bold text-slate-800 text-xs">{returnRequest.reason}</p>
              {returnRequest.customerNotes && (
                <p className="text-slate-600 text-[11px] mt-1 bg-white p-2 rounded-lg border border-slate-200/60 italic">
                  "{returnRequest.customerNotes}"
                </p>
              )}
            </div>
          </div>

          {/* Itemized Returned Line Items */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 text-xs block">
              Items to be Returned:
            </span>

            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
              {returnRequest.items?.map((item) => {
                const prod = item.orderItem?.product;
                const lineTotal = item.quantity * (item.orderItem?.unitPrice || 0);

                return (
                  <div
                    key={item.id}
                    className="p-3 flex items-center justify-between gap-3 bg-white"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={prod?.imageUrl}
                        alt={prod?.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 block truncate">
                          {prod?.name || `Item #${item.orderItemId}`}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          Qty: <strong>{item.quantity}</strong> ×{' '}
                          {formatBDT(item.orderItem?.unitPrice || 0)} (
                          {formatUSD(item.orderItem?.unitPrice || 0)})
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="font-bold text-slate-900 block">
                        {formatBDT(lineTotal)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {formatUSD(lineTotal)}
                      </span>
                      {item.restocked ? (
                        <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                          ✓ Restocked in catalog
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          Not yet restocked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Refund Value Calculation */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="font-bold text-xs text-emerald-950 block">
                Total Refund Credit:
              </span>
              <span className="text-[10px] text-emerald-700">
                Simulated internal store refund
              </span>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-emerald-800 block">
                {formatBDT(returnRequest.refundAmount || 0)}
              </span>
              <span className="text-[11px] text-emerald-600 block">
                {formatUSD(returnRequest.refundAmount || 0)}
              </span>
            </div>
          </div>

          {/* Status Update Form */}
          <form onSubmit={handleUpdate} className="space-y-4 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-900 text-xs mb-1.5">
                  Update Return Lifecycle Status:
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {RETURN_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={restockItems}
                    onChange={(e) => setRestockItems(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    Replenish product stock on refund
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-900 text-xs mb-1.5">
                Admin Notes / Customer Feedback:
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Optional resolution notes (e.g. Return approved, customer issued credit)..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {submitting ? 'Updating...' : 'Save & Update Return'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReturnDetailModal;
