import { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { formatBDT, formatUSD } from '../../utils/currency';
import {
  X,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  Package,
} from 'lucide-react';

const RETURN_REASONS = [
  'Damaged or Defective Item',
  'Wrong Product Received',
  'Item Does Not Match Description',
  'Quality Not as Expected',
  'Received Missing Parts/Accessories',
  'Other (Please Specify in Notes)',
];

export const ReturnRequestModal = ({ order, isOpen, onClose, onSuccess }) => {
  const [selectedItems, setSelectedItems] = useState({}); // { [orderItemId]: { selected: boolean, quantity: number } }
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [customerNotes, setCustomerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !order) return null;

  // Calculate previously returned/requested quantity per item
  const getItemAvailability = (item) => {
    const existingReturnedQty = (item.returnItems || [])
      .filter((ri) => ri.returnRequest?.status !== 'REJECTED')
      .reduce((sum, ri) => sum + ri.quantity, 0);

    const available = item.quantity - existingReturnedQty;
    return {
      available,
      alreadyReturned: existingReturnedQty,
      isFullyReturned: available <= 0,
    };
  };

  const handleToggleItem = (orderItemId, maxQty) => {
    setSelectedItems((prev) => {
      const current = prev[orderItemId];
      if (current?.selected) {
        const next = { ...prev };
        delete next[orderItemId];
        return next;
      } else {
        return {
          ...prev,
          [orderItemId]: {
            selected: true,
            quantity: 1,
            maxQty,
          },
        };
      }
    });
  };

  const handleQuantityChange = (orderItemId, newQty) => {
    const qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty < 1) return;

    setSelectedItems((prev) => {
      const item = prev[orderItemId];
      if (!item) return prev;
      const safeQty = Math.min(qty, item.maxQty);
      return {
        ...prev,
        [orderItemId]: {
          ...item,
          quantity: safeQty,
        },
      };
    });
  };

  // Calculate estimated refund total
  const estimatedRefundTotal = Object.entries(selectedItems).reduce(
    (total, [orderItemId, sel]) => {
      if (!sel.selected) return total;
      const item = order.items.find((i) => i.id === parseInt(orderItemId, 10));
      if (!item) return total;
      return total + item.unitPrice * sel.quantity;
    },
    0
  );

  const selectedCount = Object.values(selectedItems).filter((i) => i.selected).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (selectedCount === 0) {
      setError('Please select at least one item you wish to return.');
      return;
    }

    const payloadItems = Object.entries(selectedItems)
      .filter(([_, sel]) => sel.selected)
      .map(([orderItemId, sel]) => ({
        orderItemId: parseInt(orderItemId, 10),
        quantity: sel.quantity,
      }));

    try {
      setSubmitting(true);
      const res = await axiosInstance.post('/returns', {
        orderId: order.id,
        reason,
        customerNotes,
        items: payloadItems,
      });

      if (onSuccess) {
        onSuccess(res.data.data.returnRequest);
      }
      onClose();
    } catch (err) {
      console.error('Failed to submit return request:', err);
      setError(err.response?.data?.message || 'Failed to submit return request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Request Return for Order #{order.id}
              </h3>
              <p className="text-[11px] text-slate-500">
                Select the individual item(s) you wish to return.
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

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Item Selection */}
          <div className="space-y-3">
            <label className="block font-bold text-slate-900 text-xs">
              1. Choose Order Item(s) to Return:
            </label>

            <div className="space-y-2 border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
              {order.items.map((item) => {
                const { available, alreadyReturned, isFullyReturned } = getItemAvailability(item);
                const isSelected = selectedItems[item.id]?.selected;
                const currentQty = selectedItems[item.id]?.quantity || 1;

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isFullyReturned
                        ? 'bg-slate-100/70 border-slate-200 opacity-60'
                        : isSelected
                        ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          disabled={isFullyReturned}
                          checked={isSelected || false}
                          onChange={() => handleToggleItem(item.id, available)}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 disabled:opacity-50 cursor-pointer"
                        />
                        <img
                          src={item.product?.imageUrl}
                          alt={item.product?.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 block truncate">
                            {item.product?.name}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Unit Price: {formatBDT(item.unitPrice)} ({formatUSD(item.unitPrice)})
                          </span>
                          {alreadyReturned > 0 && (
                            <span className="text-[10px] text-amber-600 font-medium block">
                              ({alreadyReturned} unit(s) previously requested/returned)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        {isFullyReturned ? (
                          <span className="text-[10px] font-semibold text-slate-500 px-2 py-0.5 rounded-full bg-slate-200">
                            Fully Returned
                          </span>
                        ) : isSelected ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-500 font-medium">Qty:</span>
                            <select
                              value={currentQty}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              className="px-2 py-1 border border-slate-300 rounded-lg bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                              {Array.from({ length: available }, (_, i) => i + 1).map((n) => (
                                <option key={n} value={n}>
                                  {n}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Eligible: {available} unit(s)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-900 text-xs">
              2. Reason for Return:
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            >
              {RETURN_REASONS.map((r, i) => (
                <option key={i} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Explanation Notes */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-900 text-xs">
              3. Additional Details / Condition of Items:
            </label>
            <textarea
              rows={3}
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="Please explain the issue (e.g. damaged during courier transit, package unsealed, wrong model received)..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Estimated Refund Summary */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-emerald-950 text-xs">
                Estimated Refund Credit:
              </span>
              <p className="text-[10px] text-emerald-700">
                Calculated for {selectedCount} selected item line(s).
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-emerald-800 block">
                {formatBDT(estimatedRefundTotal)}
              </span>
              <span className="text-[10px] text-emerald-600 block">
                {formatUSD(estimatedRefundTotal)}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed">
            * Note: All returns are subject to verification by our Customer Care team under our standard 7-day policy. Refunds are simulated and credited to your store ledger once verified.
          </p>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || selectedCount === 0}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              {submitting ? 'Submitting Request...' : 'Submit Return Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnRequestModal;
