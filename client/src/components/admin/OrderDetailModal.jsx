import { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { formatBDT, formatUSD } from '../../utils/currency';
import {
  X,
  MapPin,
  Calendar,
  CreditCard,
  Phone,
  RefreshCw,
  CheckCircle2,
  Package,
} from 'lucide-react';

const ORDER_STATUSES = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export const OrderDetailModal = ({ isOpen, onClose, order, onStatusUpdated }) => {
  const [selectedStatus, setSelectedStatus] = useState(order?.status || 'PENDING');
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);

  if (!isOpen || !order) return null;

  // Parse shipping destination
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

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      setUpdateMessage(null);
      await axiosInstance.patch(`/orders/admin/${order.id}/status`, {
        status: newStatus,
      });
      setSelectedStatus(newStatus);
      setUpdateMessage(`Status updated to ${newStatus}`);
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-extrabold text-slate-900">
                Order #{order.id}
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  selectedStatus === 'PAID'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : selectedStatus === 'SHIPPED'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : selectedStatus === 'DELIVERED'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : selectedStatus === 'CANCELLED'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {selectedStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Transition Control */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-slate-800 block">Manage Order Fulfillment Status:</span>
            <span className="text-[11px] text-slate-500">
              Update status as package moves through courier delivery in Bangladesh.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              disabled={updating}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-semibold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
            >
              {ORDER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            {updating && <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />}
          </div>
        </div>

        {updateMessage && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{updateMessage}</span>
          </div>
        )}

        {/* Customer & Shipping Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Customer & Delivery */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1 text-slate-600">
            <strong className="text-slate-900 block font-bold mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Delivery Destination:
            </strong>
            <p className="font-semibold text-slate-800">
              {order.user?.name || addressObj.recipientName}
            </p>
            <p className="text-[11px] text-slate-500">{order.user?.email}</p>
            <p className="pt-1 text-slate-700 leading-tight">{addressObj.street}</p>
            <p>
              {addressObj.city}
              {addressObj.division ? `, ${addressObj.division}` : ''}{' '}
              {addressObj.postalCode ? `- ${addressObj.postalCode}` : ''}
            </p>
            {addressObj.phone && (
              <p className="text-slate-900 font-mono font-medium flex items-center gap-1 pt-1">
                <Phone className="w-3 h-3 text-slate-400" />
                +88 {addressObj.phone}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1 text-slate-600">
            <strong className="text-slate-900 block font-bold mb-1 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-purple-600" />
              Payment Information:
            </strong>
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
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
              <p className="font-mono text-[11px] text-slate-700 pt-1">
                <span className="text-slate-400">TrxID: </span>
                <strong>{paymentDetails.trxId}</strong>
              </p>
            )}
            {paymentDetails.accountNumber && (
              <p className="text-[11px] font-mono text-slate-500">
                Account: {paymentDetails.accountNumber}
              </p>
            )}
            <div className="pt-2 border-t border-slate-200/60 flex justify-between items-baseline">
              <span className="font-bold text-slate-800">Total Charged:</span>
              <span className="text-base font-extrabold text-emerald-700">
                {formatBDT(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Purchased Items List */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs text-slate-800">
            Order Items ({order.items?.length || 0})
          </h4>
          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 space-y-2 pr-1">
            {order.items?.map((item) => (
              <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
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
                      {item.product?.name || `Product #${item.productId}`}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Qty: {item.quantity} × {formatBDT(item.unitPrice)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">
                    {formatBDT(item.quantity * item.unitPrice)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatUSD(item.quantity * item.unitPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
