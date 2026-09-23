import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export const CheckoutPage = () => {
  const { cartItems, subtotal, shipping, estimatedTax, grandTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // If cart is empty, prompt user to add items first
  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm">
        <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">
          You cannot proceed to checkout without any items in your cart.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    // Manual Validation
    if (!shippingAddress.street.trim()) {
      setErrorMessage('Street address is required.');
      return;
    }
    if (!shippingAddress.city.trim()) {
      setErrorMessage('City is required.');
      return;
    }
    if (!shippingAddress.postalCode.trim()) {
      setErrorMessage('Postal / ZIP code is required.');
      return;
    }
    if (!shippingAddress.country.trim()) {
      setErrorMessage('Country is required.');
      return;
    }

    try {
      setSubmitting(true);

      // Format payload for backend transactional creation
      const payload = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          ...shippingAddress,
          recipientName: user?.name,
          paymentMethod,
        },
      };

      const res = await axiosInstance.post('/orders', payload);
      const placedOrder = res.data.data.order;

      // 1. Wipe client-side cart from memory and localStorage
      clearCart();

      // 2. Navigate to order confirmation
      navigate(`/order-success/${placedOrder.id}`, { replace: true });
    } catch (err) {
      console.error('Order placement failed:', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to place order. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Checkout & Shipping
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete your delivery and payment details to place your order.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <strong className="font-bold block">Order Placement Error</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Checkout 2-Column Grid */}
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Delivery & Payment Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Customer Contact info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-sm text-slate-900">1. Customer Contact</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  disabled
                  value={user?.name || ''}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-slate-50 rounded-xl text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-slate-50 rounded-xl text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Shipping Destination Address */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-sm text-slate-900">2. Shipping Destination</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Street Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  name="street"
                  value={shippingAddress.street}
                  onChange={handleInputChange}
                  placeholder="e.g. 123 Market Street, Apt 4B"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    placeholder="San Francisco"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State / Province</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    placeholder="California"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Postal / ZIP Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={handleInputChange}
                    placeholder="94105"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Country <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleInputChange}
                    placeholder="United States"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Payment Method Simulator */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <CreditCard className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-sm text-slate-900">3. Payment Simulator</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition ${
                  paymentMethod === 'card'
                    ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-xs block">Test Card Simulation</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Instant test authorization without real charges.
                  </span>
                </div>
              </label>

              <label
                className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition ${
                  paymentMethod === 'cod'
                    ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-xs block">Cash on Delivery</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Settle payment upon package handover.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Submit (1 col) */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 sticky top-24">
            <h2 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
              Order Items ({cartItems.length})
            </h2>

            {/* Items Mini List */}
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 space-y-3 pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{item.name}</h4>
                    <span className="text-[11px] text-slate-500">
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-semibold text-slate-800">
                  {shipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Tax (8%)</span>
                <span className="font-semibold text-slate-800">${estimatedTax.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-sm">
                <span className="font-bold text-slate-900">Grand Total</span>
                <span className="text-2xl font-extrabold text-slate-900">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing Order...
                </>
              ) : (
                <>
                  Confirm & Place Order
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-slate-400 text-xs text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Transactional Stock Decrement Protected</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
