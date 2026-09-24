import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { X, Tag, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export const CouponModal = ({ isOpen, onClose, onSuccess, editingCoupon }) => {
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    startDate: '',
    expiryDate: '',
    usageLimit: '',
    perUserLimit: '1',
    isActive: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (editingCoupon) {
      setFormData({
        code: editingCoupon.code || '',
        discountType: editingCoupon.discountType || 'PERCENTAGE',
        discountValue: editingCoupon.discountValue !== undefined ? String(editingCoupon.discountValue) : '',
        minOrderAmount: editingCoupon.minOrderAmount !== null && editingCoupon.minOrderAmount !== undefined ? String(editingCoupon.minOrderAmount) : '',
        maxDiscount: editingCoupon.maxDiscount !== null && editingCoupon.maxDiscount !== undefined ? String(editingCoupon.maxDiscount) : '',
        startDate: editingCoupon.startDate ? new Date(editingCoupon.startDate).toISOString().slice(0, 10) : '',
        expiryDate: editingCoupon.expiryDate ? new Date(editingCoupon.expiryDate).toISOString().slice(0, 10) : '',
        usageLimit: editingCoupon.usageLimit !== null && editingCoupon.usageLimit !== undefined ? String(editingCoupon.usageLimit) : '',
        perUserLimit: editingCoupon.perUserLimit !== null && editingCoupon.perUserLimit !== undefined ? String(editingCoupon.perUserLimit) : '1',
        isActive: editingCoupon.isActive !== undefined ? editingCoupon.isActive : true,
      });
    } else {
      setFormData({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minOrderAmount: '',
        maxDiscount: '',
        startDate: '',
        expiryDate: '',
        usageLimit: '',
        perUserLimit: '1',
        isActive: true,
      });
    }
    setError(null);
  }, [editingCoupon, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.code.trim()) {
      setError('Please provide a coupon code.');
      return;
    }

    const val = parseFloat(formData.discountValue);
    if (isNaN(val) || val <= 0) {
      setError('Discount value must be a positive number.');
      return;
    }

    if (formData.discountType === 'PERCENTAGE' && val > 100) {
      setError('Percentage discount cannot exceed 100%.');
      return;
    }

    const payload = {
      code: formData.code.trim().toUpperCase().replace(/\s+/g, ''),
      discountType: formData.discountType,
      discountValue: val,
      minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit, 10) : null,
      perUserLimit: formData.perUserLimit ? parseInt(formData.perUserLimit, 10) : 1,
      isActive: formData.isActive,
    };

    try {
      setSubmitting(true);
      if (editingCoupon) {
        await axiosInstance.put(`/coupons/admin/${editingCoupon.id}`, payload);
      } else {
        await axiosInstance.post('/coupons/admin', payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save coupon:', err);
      setError(err.response?.data?.message || 'Failed to save coupon.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Discount Coupon'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Configure promotional code, discount rates, and redemption rules.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Code */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-800 text-xs">
              Coupon Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g. SAVE10, JUWINTER, WELCOME500"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[10px] text-slate-400">
              Codes are automatically capitalized and spaces are stripped.
            </p>
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-800 text-xs">Discount Type</label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (৳ BDT)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-800 text-xs">
                Discount Value <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                placeholder={formData.discountType === 'PERCENTAGE' ? 'e.g. 10 (for 10%)' : 'e.g. 200 (for ৳200)'}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Min Order & Max Discount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-800 text-xs">
                Min. Order Amount (৳)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="minOrderAmount"
                value={formData.minOrderAmount}
                onChange={handleChange}
                placeholder="Optional (e.g. 1000)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-800 text-xs">
                Max Discount Cap (৳)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="maxDiscount"
                value={formData.maxDiscount}
                onChange={handleChange}
                placeholder={formData.discountType === 'PERCENTAGE' ? 'Optional (e.g. 500)' : 'N/A for fixed'}
                disabled={formData.discountType === 'FIXED'}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* Validity Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-800 text-xs">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-800 text-xs">Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-800 text-xs">Total Usage Limit</label>
              <input
                type="number"
                min="1"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleChange}
                placeholder="Unlimited if blank"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-800 text-xs">Per-Customer Limit</label>
              <input
                type="number"
                min="1"
                name="perUserLimit"
                value={formData.perUserLimit}
                onChange={handleChange}
                placeholder="Default: 1"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="isActive" className="font-semibold text-slate-700 text-xs cursor-pointer">
              Coupon is Active and can be redeemed by customers
            </label>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponModal;
