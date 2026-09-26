import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { formatBDT, formatUSD, formatDualPrice } from '../utils/currency';
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
  Phone,
  Banknote,
  Smartphone,
  Building,
  HelpCircle,
  Tag,
  Sparkles,
} from 'lucide-react';

const BD_DIVISIONS = [
  'Dhaka',
  'Chattogram',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Sylhet',
  'Rangpur',
  'Mymensingh',
];

const LOCAL_PRESETS = [
  {
    label: 'Jahangirnagar University (JU), Savar',
    division: 'Dhaka',
    city: 'Dhaka',
    area: 'Savar (Jahangirnagar University Campus)',
    postalCode: '1342',
    streetExample: 'Al-Beruni Hall, Room 302, Jahangirnagar University',
  },
  {
    label: 'Mirpur, Dhaka',
    division: 'Dhaka',
    city: 'Dhaka',
    area: 'Mirpur-10',
    postalCode: '1216',
    streetExample: 'House 14, Road 5, Block B, Mirpur',
  },
  {
    label: 'Dhanmondi, Dhaka',
    division: 'Dhaka',
    city: 'Dhaka',
    area: 'Dhanmondi',
    postalCode: '1209',
    streetExample: 'Road 27 (Old), House 42, Dhanmondi',
  },
  {
    label: 'Uttara, Dhaka',
    division: 'Dhaka',
    city: 'Dhaka',
    area: 'Uttara Sector 7',
    postalCode: '1230',
    streetExample: 'Sector 7, Road 12, House 8, Uttara',
  },
  {
    label: 'Agrabad, Chattogram',
    division: 'Chattogram',
    city: 'Chattogram',
    area: 'Agrabad C/A',
    postalCode: '4100',
    streetExample: 'Agrabad Commercial Area, Road 3',
  },
];

export const CheckoutPage = () => {
  const { cartItems, subtotal, shipping, estimatedTax, grandTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('payment');
  const paymentMessage = searchParams.get('message');

  // Destination Region Toggle: Bangladesh vs International
  const [destinationType, setDestinationType] = useState('bangladesh'); // 'bangladesh' | 'international'

  // Shipping Address State
  const [shippingAddress, setShippingAddress] = useState({
    street: 'Al-Beruni Hall, Room 302, Jahangirnagar University',
    city: 'Dhaka',
    division: 'Dhaka',
    state: '',
    postalCode: '1342',
    country: 'Bangladesh',
    phone: '01712345678',
    deliveryInstructions: 'Call upon arriving at the campus gate.',
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('bkash'); // 'bkash' | 'nagad' | 'cod' | 'card'
  const [mfsNumber, setMfsNumber] = useState('01712345678');
  const [mfsPin, setMfsPin] = useState('12345');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '4242 •••• •••• 4242',
    expiry: '12/28',
    cvv: '888',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const [couponSuccessMessage, setCouponSuccessMessage] = useState(null);

  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    if (!couponInput.trim()) return;

    try {
      setCouponValidating(true);
      setCouponError(null);
      setCouponSuccessMessage(null);

      const res = await axiosInstance.post('/coupons/validate', {
        code: couponInput.trim(),
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });

      const couponData = res.data.data;
      setAppliedCoupon(couponData);
      setCouponSuccessMessage(
        `Coupon "${couponData.coupon.code}" applied! You save ${formatBDT(couponData.discountAmount)}.`
      );
    } catch (err) {
      console.error('Coupon validation failed:', err);
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.message || 'Invalid coupon code.');
    } finally {
      setCouponValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
    setCouponSuccessMessage(null);
  };

  // Recalculate totals taking into account coupon discount
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const effectiveTax = discountedSubtotal * 0.08;
  const finalGrandTotal = discountedSubtotal + shipping + effectiveTax;

  // If cart is empty, prompt user to add items first
  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
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

  const applyLocalPreset = (preset) => {
    setShippingAddress((prev) => ({
      ...prev,
      division: preset.division,
      city: preset.city,
      postalCode: preset.postalCode,
      street: preset.streetExample,
      country: 'Bangladesh',
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!shippingAddress.street.trim()) {
      setErrorMessage('Street / Hall / Campus address is required.');
      return;
    }
    if (!shippingAddress.city.trim()) {
      setErrorMessage('City / District is required.');
      return;
    }
    if (!shippingAddress.postalCode.trim()) {
      setErrorMessage('Postal code is required.');
      return;
    }

    if (destinationType === 'bangladesh') {
      if (!shippingAddress.phone || shippingAddress.phone.trim().length < 11) {
        setErrorMessage(
          'Please enter a valid 11-digit Bangladeshi contact phone number (e.g. 017xxxxxxxx) for delivery couriers.'
        );
        return;
      }

      if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
        if (!mfsNumber || mfsNumber.trim().length < 11) {
          setErrorMessage(`Please enter your valid 11-digit ${paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} mobile account number.`);
          return;
        }
      }
    }

    try {
      setSubmitting(true);

      if (paymentMethod === 'bkash_sandbox') {
        const payload = {
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          couponCode: appliedCoupon ? appliedCoupon.coupon.code : null,
          shippingAddress: {
            recipientName: user?.name,
            country: destinationType === 'bangladesh' ? 'Bangladesh' : shippingAddress.country,
            division: destinationType === 'bangladesh' ? shippingAddress.division : shippingAddress.state,
            city: shippingAddress.city,
            street: shippingAddress.street,
            postalCode: shippingAddress.postalCode,
            phone: shippingAddress.phone,
            deliveryInstructions: shippingAddress.deliveryInstructions,
          },
        };

        const res = await axiosInstance.post('/bkash/create-payment', payload);
        const { bkashURL } = res.data.data;
        if (bkashURL) {
          window.location.href = bkashURL;
          return;
        } else {
          throw new Error('bKash gateway URL was not returned.');
        }
      }

      // Generate a simulated Transaction ID (TrxID) for bKash or Nagad
      let simulatedTrxId = null;
      if (paymentMethod === 'bkash') {
        simulatedTrxId = 'BK' + Math.random().toString(36).substring(2, 9).toUpperCase();
      } else if (paymentMethod === 'nagad') {
        simulatedTrxId = 'NG' + Math.random().toString(36).substring(2, 9).toUpperCase();
      } else if (paymentMethod === 'card') {
        simulatedTrxId = 'AUTH_' + Math.random().toString(36).substring(2, 8).toUpperCase();
      }

      // Format payload for backend transactional creation
      const payload = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        couponCode: appliedCoupon ? appliedCoupon.coupon.code : null,
        shippingAddress: {
          recipientName: user?.name,
          country: destinationType === 'bangladesh' ? 'Bangladesh' : shippingAddress.country,
          division: destinationType === 'bangladesh' ? shippingAddress.division : shippingAddress.state,
          city: shippingAddress.city,
          street: shippingAddress.street,
          postalCode: shippingAddress.postalCode,
          phone: shippingAddress.phone,
          deliveryInstructions: shippingAddress.deliveryInstructions,
          paymentMethod,
          paymentDetails: {
            methodName:
              paymentMethod === 'bkash'
                ? 'bKash'
                : paymentMethod === 'nagad'
                ? 'Nagad'
                : paymentMethod === 'cod'
                ? 'Cash on Delivery (COD)'
                : 'Credit/Debit Card',
            accountNumber:
              paymentMethod === 'bkash' || paymentMethod === 'nagad'
                ? mfsNumber
                : paymentMethod === 'card'
                ? cardDetails.cardNumber
                : 'N/A',
            trxId: simulatedTrxId,
          },
        },
      };

      const res = await axiosInstance.post('/orders', payload);
      const placedOrder = res.data.data.order;

      // 1. Wipe client-side cart from memory and localStorage
      clearCart();

      // 2. Navigate to order confirmation receipt
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
      {/* Title & Localized Banner */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Checkout & Shipping
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete your delivery destination and select your payment method (bKash, Nagad, Cash on Delivery, or Card).
          </p>
        </div>

        {/* Currency Rate Notice */}
        <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 self-start md:self-auto">
          <span className="font-bold">Conversion Rate:</span>
          <span>$1.00 USD = ৳120 BDT</span>
        </div>
      </div>

      {/* bKash Payment Callback Status Alert */}
      {paymentStatus === 'cancelled' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <strong className="font-bold block">bKash Payment Cancelled</strong>
            <span>
              Your bKash transaction was cancelled. Your cart and selected items have been preserved. You can try again or choose another payment method below.
            </span>
          </div>
        </div>
      )}

      {paymentStatus === 'failed' && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-900 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <strong className="font-bold block">bKash Payment Failed</strong>
            <span>
              {paymentMessage || 'The payment could not be completed by bKash. Please try again or select another payment method.'}
            </span>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800 animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <strong className="font-bold block">Please check your information:</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Checkout 2-Column Grid */}
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Delivery & Payment Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Customer Contact Info */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
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
                  className="w-full px-3.5 py-2 border border-slate-200 bg-slate-50 rounded-xl text-slate-600 cursor-not-allowed font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-slate-50 rounded-xl text-slate-600 cursor-not-allowed font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Shipping Destination Address */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <MapPin className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-sm text-slate-900">2. Shipping Destination</h2>
              </div>

              {/* Destination Mode Selector */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setDestinationType('bangladesh');
                    setShippingAddress((prev) => ({ ...prev, country: 'Bangladesh' }));
                  }}
                  className={`px-3 py-1 rounded-lg transition ${
                    destinationType === 'bangladesh'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bangladesh 🇧🇩
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDestinationType('international');
                    setShippingAddress((prev) => ({ ...prev, country: 'United States' }));
                  }}
                  className={`px-3 py-1 rounded-lg transition ${
                    destinationType === 'international'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  International 🌐
                </button>
              </div>
            </div>

            {destinationType === 'bangladesh' ? (
              <div className="space-y-4 text-xs">
                {/* Quick Local Presets */}
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
                    ⚡ Quick Fill Local Location:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {LOCAL_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => applyLocalPreset(preset)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 rounded-lg shadow-2xs transition"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Division */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Division <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="division"
                      value={shippingAddress.division}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm bg-white"
                    >
                      {BD_DIVISIONS.map((div) => (
                        <option key={div} value={div}>
                          {div} Division
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District / City */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      District / City / Thana <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Dhaka, Savar, Gazipur, Chattogram"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                    />
                  </div>
                </div>

                {/* Street / Campus / Hall Address */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Street Address, Hall / Campus / House & Road <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="street"
                    value={shippingAddress.street}
                    onChange={handleInputChange}
                    placeholder="e.g. Al-Beruni Hall, Room 302, Jahangirnagar University, Savar"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Postal Code */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Postal Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={handleInputChange}
                      placeholder="e.g. 1342 (JU Savar), 1216 (Mirpur)"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                    />
                  </div>

                  {/* Mobile Phone Number (Crucial for Bangladeshi Couriers) */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Courier Contact Number (Active Phone) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">
                        +88
                      </span>
                      <input
                        type="tel"
                        required
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={handleInputChange}
                        placeholder="01712345678"
                        className="w-full pl-12 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Delivery riders from Pathao / Steadfast will call this number prior to arrival.
                    </span>
                  </div>
                </div>

                {/* Delivery Instructions */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Special Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    name="deliveryInstructions"
                    value={shippingAddress.deliveryInstructions}
                    onChange={handleInputChange}
                    placeholder="e.g. Leave with security guard at campus main gate if unreachable."
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-xs"
                  />
                </div>
              </div>
            ) : (
              /* International Form */
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
                    placeholder="123 Market Street, Apt 4B"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
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
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
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
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
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
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
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
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Payment Method Simulator */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900">3. Payment Method Simulator</h2>
                <p className="text-[11px] text-slate-400">
                  Select your preferred Bangladeshi or International payment option.
                </p>
              </div>
            </div>

            {/* Payment Method Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* bKash Official Sandbox */}
              <label
                className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition relative ${
                  paymentMethod === 'bkash_sandbox'
                    ? 'border-[#E2136E] bg-pink-50/40 text-slate-900 ring-2 ring-[#E2136E]/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bkash_sandbox'}
                  onChange={() => setPaymentMethod('bkash_sandbox')}
                  className="mt-1 text-[#E2136E] focus:ring-[#E2136E]"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-[#E2136E]">bKash (Official Sandbox)</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E2136E] text-white flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      Live Gateway
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block leading-tight">
                    Official bKash payment portal with live sandbox test credentials.
                  </span>
                </div>
              </label>

              {/* bKash Simulation */}
              <label
                className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition relative ${
                  paymentMethod === 'bkash'
                    ? 'border-[#E2136E] bg-pink-50/40 text-slate-900 ring-2 ring-[#E2136E]/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bkash'}
                  onChange={() => setPaymentMethod('bkash')}
                  className="mt-1 text-[#E2136E] focus:ring-[#E2136E]"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-[#E2136E]">bKash (Simulation)</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E2136E]/80 text-white">
                      Instant Sim
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block leading-tight">
                    Instant mobile checkout with simulated TrxID confirmation.
                  </span>
                </div>
              </label>

              {/* Nagad */}
              <label
                className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition relative ${
                  paymentMethod === 'nagad'
                    ? 'border-[#F7941E] bg-amber-50/40 text-slate-900 ring-2 ring-[#F7941E]/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'nagad'}
                  onChange={() => setPaymentMethod('nagad')}
                  className="mt-1 text-[#F7941E] focus:ring-[#F7941E]"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-[#F7941E]">Nagad (নগদ)</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F7941E] text-white">
                      MFS
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block leading-tight">
                    Post Office digital financial service with simulated verification.
                  </span>
                </div>
              </label>

              {/* Cash on Delivery */}
              <label
                className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition ${
                  paymentMethod === 'cod'
                    ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">Cash on Delivery</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      COD
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block leading-tight">
                    Pay delivery rider in cash upon unboxing at your gate/hall.
                  </span>
                </div>
              </label>

              {/* Debit/Credit Card */}
              <label
                className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50/40 text-blue-950 ring-2 ring-blue-500/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">Visa / Mastercard</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      Bank Card
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block leading-tight">
                    Simulated bank authorization for local and international cards.
                  </span>
                </div>
              </label>
            </div>

            {/* Dynamic Payment Details Inputs */}
            {paymentMethod === 'bkash_sandbox' && (
              <div className="p-4 bg-pink-50/60 border border-pink-200 rounded-2xl space-y-3 animate-fadeIn text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#E2136E] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#E2136E]" />
                    Official bKash Sandbox Gateway
                  </span>
                  <span className="text-[11px] text-pink-700 font-mono">
                    Total: {formatBDT(grandTotal)}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  You will be securely redirected to the official bKash checkout page to complete the transaction. Use the following sandbox test credentials:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white/90 p-3 rounded-xl border border-pink-200 text-[11px] font-mono shadow-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">Test Wallet</span>
                    <span className="font-bold text-slate-800">01770618575</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">OTP</span>
                    <span className="font-bold text-slate-800">123456</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">PIN</span>
                    <span className="font-bold text-slate-800">12121</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  🔒 Test Environment: No real money is deducted. The official gateway will issue a live sandbox TrxID.
                </p>
              </div>
            )}

            {paymentMethod === 'bkash' && (
              <div className="p-4 bg-pink-50/60 border border-pink-200 rounded-2xl space-y-3 animate-fadeIn text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#E2136E]">bKash Payment Gateway Simulation</span>
                  <span className="text-[11px] text-pink-700 font-mono">
                    Total: {formatBDT(grandTotal)}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Your bKash Account Number
                    </label>
                    <input
                      type="tel"
                      value={mfsNumber}
                      onChange={(e) => setMfsNumber(e.target.value)}
                      placeholder="017xxxxxxxx"
                      className="w-full px-3 py-2 border border-pink-200 rounded-xl bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#E2136E]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Simulated 5-Digit PIN
                    </label>
                    <input
                      type="password"
                      maxLength={5}
                      value={mfsPin}
                      onChange={(e) => setMfsPin(e.target.value)}
                      placeholder="•••••"
                      className="w-full px-3 py-2 border border-pink-200 rounded-xl bg-white font-mono text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-[#E2136E]"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  🔒 Test mode active: Enter any valid 11-digit number. A simulated TrxID will be generated automatically upon placement.
                </p>
              </div>
            )}

            {paymentMethod === 'nagad' && (
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3 animate-fadeIn text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F7941E]">Nagad Payment Gateway Simulation</span>
                  <span className="text-[11px] text-amber-800 font-mono">
                    Total: {formatBDT(grandTotal)}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Your Nagad Account Number
                    </label>
                    <input
                      type="tel"
                      value={mfsNumber}
                      onChange={(e) => setMfsNumber(e.target.value)}
                      placeholder="017xxxxxxxx"
                      className="w-full px-3 py-2 border border-amber-200 rounded-xl bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#F7941E]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Simulated 4-Digit PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={mfsPin}
                      onChange={(e) => setMfsPin(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3 py-2 border border-amber-200 rounded-xl bg-white font-mono text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-[#F7941E]"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  🔒 Test mode active: Nagad will simulate authorization and generate a TrxID.
                </p>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-fadeIn text-xs">
                <span className="font-bold text-slate-800 block">Bank Card Simulation</span>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block font-semibold text-slate-600 mb-1">Card Number</label>
                    <input
                      type="text"
                      disabled
                      value={cardDetails.cardNumber}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl font-mono text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">CVV</label>
                    <input
                      type="text"
                      disabled
                      value={cardDetails.cvv}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl font-mono text-slate-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-1.5 text-xs text-emerald-900 animate-fadeIn">
                <span className="font-bold block">Cash on Delivery Notice:</span>
                <p className="text-slate-600 leading-relaxed">
                  Your order will be set to <strong className="text-emerald-700">Pending Cash Collection</strong>. You will pay the courier in cash upon receiving the package.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Review & Submit (1 col) */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5 sticky top-24">
            <h2 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Order Items ({cartItems.length})</span>
              <span className="text-xs font-semibold text-slate-400">BDT & USD</span>
            </h2>

            {/* Items Mini List */}
            <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 space-y-3 pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{item.name}</h4>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Qty: {item.quantity} × {formatBDT(item.price)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 block">
                      {formatBDT(item.price * item.quantity)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatUSD(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo / Coupon Section */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                Have a Promo / Coupon Code?
              </label>

              {appliedCoupon ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-xs text-emerald-900 block font-mono">
                        {appliedCoupon.coupon.code}
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        {appliedCoupon.coupon.discountType === 'PERCENTAGE'
                          ? `${appliedCoupon.coupon.discountValue}% discount applied`
                          : `${formatBDT(appliedCoupon.coupon.discountValue)} discount applied`}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError(null);
                      }}
                      placeholder="e.g. SAVE10"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs uppercase font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponValidating || !couponInput.trim()}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {couponValidating ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-[11px] text-rose-600 flex items-center gap-1 pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {couponError}
                    </p>
                  )}
                  {couponSuccessMessage && (
                    <p className="text-[11px] text-emerald-600 flex items-center gap-1 pt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      {couponSuccessMessage}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Calculations Breakdown in BDT & USD */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">
                  {formatBDT(subtotal)}{' '}
                  <span className="text-[11px] text-slate-400">({formatUSD(subtotal)})</span>
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                  <span className="font-medium flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Coupon Discount ({appliedCoupon.coupon.code})
                  </span>
                  <span className="font-bold">
                    -{formatBDT(discountAmount)}{' '}
                    <span className="text-[11px] text-emerald-600 font-mono">
                      (-{formatUSD(discountAmount)})
                    </span>
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-semibold text-slate-800">
                  {shipping === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE DELIVERY</span>
                  ) : (
                    <>
                      {formatBDT(shipping)}{' '}
                      <span className="text-[11px] text-slate-400">({formatUSD(shipping)})</span>
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Tax (8%)</span>
                <span className="font-semibold text-slate-800">
                  {formatBDT(effectiveTax)}{' '}
                  <span className="text-[11px] text-slate-400">({formatUSD(effectiveTax)})</span>
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-sm">Grand Total (BDT)</span>
                  <span className="text-2xl font-extrabold text-emerald-700">
                    {formatBDT(finalGrandTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Equivalent in USD:</span>
                  <span className="font-medium text-slate-600">{formatUSD(finalGrandTotal)}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {paymentMethod === 'bkash_sandbox' ? 'Redirecting to bKash Gateway...' : 'Processing Order...'}
                </>
              ) : (
                <>
                  {paymentMethod === 'bkash_sandbox'
                    ? `Proceed to bKash Gateway (${formatBDT(finalGrandTotal)})`
                    : `Confirm & Place Order (${formatBDT(finalGrandTotal)})`}
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
