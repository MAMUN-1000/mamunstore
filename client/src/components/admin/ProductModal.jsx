import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { formatBDT } from '../../utils/currency';
import { X, RefreshCw, AlertCircle, Image as ImageIcon, Check } from 'lucide-react';

export const ProductModal = ({
  isOpen,
  onClose,
  onSuccess,
  product = null,
  categories = [],
}) => {
  const isEditing = Boolean(product);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
    categoryId: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || '',
        imageUrl: product.imageUrl || '',
        categoryId: product.categoryId?.toString() || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80',
        categoryId: categories[0]?.id?.toString() || '',
      });
    }
    setErrorMessage(null);
  }, [product, categories, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim()) {
      setErrorMessage('Product name is required.');
      return;
    }
    if (!formData.categoryId) {
      setErrorMessage('Please select a valid category.');
      return;
    }
    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      setErrorMessage('Please provide a valid non-negative price.');
      return;
    }
    if (isNaN(parseInt(formData.stock, 10)) || parseInt(formData.stock, 10) < 0) {
      setErrorMessage('Please provide a valid non-negative stock count.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        imageUrl: formData.imageUrl.trim(),
        categoryId: parseInt(formData.categoryId, 10),
      };

      if (isEditing) {
        await axiosInstance.put(`/products/${product.id}`, payload);
      } else {
        await axiosInstance.post('/products', payload);
      }

      onSuccess();
    } catch (err) {
      console.error('Failed to save product:', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to save product. Please check your inputs.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const previewPriceUSD = parseFloat(formData.price) || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              {isEditing ? `Edit Product: ${product.name}` : 'Add New Product to Inventory'}
            </h3>
            <p className="text-xs text-slate-500">
              {isEditing
                ? 'Update pricing, inventory, and details in PostgreSQL.'
                : 'Enter product specifications to publish to the store catalog.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Name & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Wireless Ergonomic Mouse"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
              >
                <option value="">Select a Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & Stock Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Price (USD $) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="49.99"
                  className="w-full pl-8 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                BDT Equivalent: <strong className="text-emerald-700">{formatBDT(previewPriceUSD)}</strong>
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Stock Quantity (Units) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="25"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Current warehouse inventory count.
              </span>
            </div>
          </div>

          {/* Image URL & Thumbnail Preview */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">
              Image URL <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="url"
                required
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
              />
              <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                ) : (
                  <ImageIcon className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">
              Product Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of features, materials, and warranty specifications."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-600 transition leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {isEditing ? 'Save Changes' : 'Create Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
