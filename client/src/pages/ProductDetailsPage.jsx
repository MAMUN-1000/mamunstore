import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { formatBDT, formatUSD } from '../utils/currency';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';
import {
  ArrowLeft,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  Star,
  RefreshCw,
  AlertCircle,
  Plus,
  Minus,
  MessageSquare,
  ShieldCheck,
  Trash2,
  Lock,
  Edit3,
  Heart,
} from 'lucide-react';

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Review Form & Eligibility State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [eligibility, setEligibility] = useState({
    canReview: false,
    hasPurchased: false,
    alreadyReviewed: false,
    existingReview: null,
  });
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(`/products/${id}`);
      setProduct(res.data.data.product);
    } catch (err) {
      console.error('Failed to load product details:', err);
      setError(
        err.response?.data?.message ||
          'Failed to load product information. It may have been removed.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchEligibility = useCallback(async () => {
    if (!user) {
      setEligibility({
        canReview: false,
        hasPurchased: false,
        alreadyReviewed: false,
        existingReview: null,
      });
      return;
    }

    try {
      const res = await axiosInstance.get(`/products/${id}/reviews/eligibility`);
      setEligibility(res.data.data);
    } catch (err) {
      console.error('Failed to check review eligibility:', err);
    }
  }, [id, user]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    fetchEligibility();
  }, [fetchEligibility]);

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const newQty = prev + delta;
      if (newQty < 1) return 1;
      if (product && newQty > product.stock) return product.stock;
      return newQty;
    });
  };

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;
    addToCart(product, quantity);
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    fetchProduct();
    fetchEligibility();
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      setDeletingReviewId(reviewId);
      await axiosInstance.delete(`/reviews/${reviewId}`);
      fetchProduct();
      fetchEligibility();
    } catch (err) {
      console.error('Failed to delete review:', err);
      alert(err.response?.data?.message || 'Failed to delete review.');
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-9 h-9 animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-slate-500">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-rose-200 rounded-3xl text-center space-y-4 shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-rose-700">{error || 'Unable to locate product.'}</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Link>
      </div>
    );
  }

  const stats = product.stats || {
    totalReviews: product.reviews?.length || 0,
    averageRating: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-emerald-600 transition">
          Home
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-emerald-600 transition">
          Catalog
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <span className="text-slate-400">{product.category.name}</span>
          </>
        )}
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
        {/* Left: Product Image */}
        <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-square relative border border-slate-100">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80';
            }}
          />
          {product.category && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-slate-800 shadow-sm border border-slate-200/70">
              {product.category.name}
            </span>
          )}
        </div>

        {/* Right: Details & Purchase Controls */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Rating Snapshot Banner */}
            <div className="flex items-center gap-2.5">
              <StarRating rating={stats.averageRating} size="sm" />
              <span className="text-xs font-bold text-slate-800">
                {stats.averageRating > 0 ? stats.averageRating : 'New'}
              </span>
              <span className="text-xs text-slate-400">
                ({stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            {/* Price & Stock Header */}
            <div className="flex flex-wrap items-baseline gap-3 pt-1">
              <span className="text-3xl font-extrabold text-slate-900">
                {formatBDT(product.price)}
              </span>
              <span className="text-sm font-semibold text-slate-400 font-mono">
                ({formatUSD(product.price)})
              </span>

              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ml-auto sm:ml-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  In Stock ({product.stock} units available)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ml-auto sm:ml-0">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Currently Out of Stock
                </span>
              )}
            </div>

            {/* Description */}
            <div className="pt-2 text-sm text-slate-600 leading-relaxed space-y-2 border-t border-slate-100">
              <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">
                Product Description
              </h3>
              <p>{product.description}</p>
            </div>
          </div>

          {/* Action Box */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            {product.stock > 0 ? (
              <div className="space-y-4">
                {/* Quantity Counter */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-slate-700">Quantity:</span>
                  <div className="inline-flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 text-slate-600 hover:bg-slate-200 transition disabled:opacity-40"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-12 text-center text-sm font-bold text-slate-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      className="p-2 text-slate-600 hover:bg-slate-200 transition disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 group"
                >
                  <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Add {quantity} to Cart ({formatBDT(product.price * quantity)})
                </button>
              </div>
            ) : (
              <button
                disabled
                className="w-full py-3.5 px-6 rounded-xl bg-slate-100 text-slate-400 font-semibold text-sm cursor-not-allowed text-center"
              >
                Item Unavailable
              </button>
            )}

            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className={`w-full py-3 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                isInWishlist(product.id)
                  ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  isInWishlist(product.id) ? 'fill-current text-rose-500' : 'text-slate-400'
                }`}
              />
              <span>{isInWishlist(product.id) ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
            </button>

            <button
              onClick={() => navigate('/products')}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition text-center"
            >
              ← Continue Shopping
            </button>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-xl text-slate-900">Customer Ratings & Reviews</h2>
              <p className="text-xs text-slate-500">
                Verified feedback from real customers who purchased this item.
              </p>
            </div>
          </div>

          {/* Review Action Button */}
          {eligibility.canReview && (
            <button
              type="button"
              onClick={() => setShowReviewForm((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {showReviewForm
                ? 'Close Form'
                : eligibility.alreadyReviewed
                ? 'Edit Your Review'
                : 'Write a Review'}
            </button>
          )}
        </div>

        {/* Rating Breakdown Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-slate-50 border border-slate-200/80 rounded-3xl">
          {/* Big Score Card */}
          <div className="flex flex-col items-center justify-center text-center space-y-2 border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
            <span className="text-5xl font-extrabold text-slate-900 tracking-tight">
              {stats.averageRating > 0 ? stats.averageRating : '0.0'}
            </span>
            <StarRating rating={stats.averageRating} size="md" />
            <span className="text-xs text-slate-500">
              Based on {stats.totalReviews} verified {stats.totalReviews === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          {/* Star Breakdown Bars (2 cols on md) */}
          <div className="md:col-span-2 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.breakdown[star] || 0;
              const percentage = stats.percentages[star] || 0;
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-semibold text-slate-600 flex items-center gap-1">
                    {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-slate-400 font-mono text-[11px]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Eligibility Status Banner */}
        {!user ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>Sign in to write a verified customer review.</span>
            </div>
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs text-center hover:bg-slate-800 transition"
            >
              Sign In
            </Link>
          </div>
        ) : !eligibility.hasPurchased ? (
          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-0.5">
              <strong className="font-bold block">Verified Buyer Policy:</strong>
              <p className="text-amber-800 leading-relaxed">
                Only verified buyers who have completed a purchase of this product can write a review. Once you place an order, you will be able to share your experience here!
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Verified Buyer:</strong> You purchased this item!{' '}
                {eligibility.alreadyReviewed
                  ? 'You have already submitted a review.'
                  : 'You are eligible to leave a review.'}
              </span>
            </div>
          </div>
        )}

        {/* Review Form Drawer/Card */}
        {showReviewForm && (
          <ReviewForm
            productId={product.id}
            existingReview={eligibility.existingReview}
            onSuccess={handleReviewSubmitted}
            onCancel={() => setShowReviewForm(false)}
          />
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900">
            Customer Reviews ({product.reviews?.length || 0})
          </h3>

          {product.reviews && product.reviews.length > 0 ? (
            <div className="space-y-4">
              {product.reviews.map((review) => {
                const isAuthorOrAdmin =
                  user && (user.id === review.userId || user.role === 'ADMIN');

                return (
                  <div
                    key={review.id}
                    className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-3 shadow-2xs hover:border-slate-300 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">
                            {review.user?.name || 'Customer'}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Verified Buyer
                          </span>
                        </div>
                        <StarRating rating={review.rating} size="sm" />
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>

                        {isAuthorOrAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(review.id)}
                            disabled={deletingReviewId === review.id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {review.comment && (
                      <p className="text-xs text-slate-600 leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 space-y-2 text-slate-500 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Star className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-medium text-slate-700">No customer reviews yet.</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Be the first verified buyer to leave a review after placing your order!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductDetailsPage;
