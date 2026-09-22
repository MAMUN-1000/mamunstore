import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
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
} from 'lucide-react';

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(`/products/${id}`);
        setProduct(res.data.data.product);
      } catch (err) {
        console.error('Failed to fetch product details:', err);
        setError(err.response?.data?.message || 'Product not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (product && next > product.stock) return product.stock;
      return next;
    });
  };

  const handleAddToCartDummy = () => {
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-slate-500">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-rose-200 rounded-2xl text-center space-y-4 shadow-sm">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'The requested product does not exist.'}</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-emerald-600 transition">
          Home
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-emerald-600 transition">
          Catalog
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold line-clamp-1">{product.name}</span>
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
              e.target.src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80';
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
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Price & Stock Header */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-extrabold text-slate-900">
                ${product.price.toFixed(2)}
              </span>

              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  In Stock ({product.stock} units available)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
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

                {/* Add to Cart Button (Ready for Phase 6) */}
                <button
                  type="button"
                  onClick={handleAddToCartDummy}
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 group"
                >
                  <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Add {quantity} to Cart (${(product.price * quantity).toFixed(2)})
                </button>

                {addedNotice && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-medium text-emerald-800 animate-fadeIn">
                    ✓ Selected {quantity} items. Cart state management will be activated in <strong>Phase 6</strong>!
                  </div>
                )}
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
              onClick={() => navigate('/products')}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition text-center"
            >
              ← Continue Shopping
            </button>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900">Verified Customer Reviews</h2>
              <p className="text-xs text-slate-500">
                {product.reviews?.length || 0} reviews for this product
              </p>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800">
                      {review.user?.name || 'Verified Buyer'}
                    </span>
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 space-y-2 text-slate-500">
            <p className="text-sm font-medium">No customer reviews yet.</p>
            <p className="text-xs text-slate-400">
              Purchased items can be reviewed after order completion in Phase 8.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDetailsPage;
