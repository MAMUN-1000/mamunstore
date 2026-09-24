import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatBDT, formatUSD } from '../utils/currency';
import {
  Heart,
  ShoppingCart,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Star,
  ShoppingBag,
  ArrowRight,
  Eye,
} from 'lucide-react';

export const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  if (loading && wishlistItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-80 bg-white border border-slate-200 rounded-3xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              My Saved Wishlist
            </h1>
            <p className="text-xs text-slate-500">
              {wishlistItems.length} product{wishlistItems.length === 1 ? '' : 's'} saved for later
            </p>
          </div>
        </div>

        {wishlistItems.length > 0 && (
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Wishlist Items Grid or Empty State */}
      {wishlistItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-rose-50 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Your Wishlist is Empty</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Save products you want to buy later by tapping the heart icon on any product card or details page.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition"
          >
            <ShoppingBag className="w-4 h-4" />
            Explore Store Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => {
            const product = item.product;
            if (!product) return null;

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Product Thumbnail */}
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80';
                      }}
                    />

                    {/* Stock Pill Badge */}
                    <div className="absolute top-3 left-3">
                      {product.stock > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs backdrop-blur-xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          In Stock ({product.stock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs backdrop-blur-xs">
                          <AlertTriangle className="w-3 h-3 text-rose-500" />
                          Sold Out
                        </span>
                      )}
                    </div>

                    {/* Quick Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-xl bg-white/90 text-slate-400 hover:text-rose-600 hover:bg-white shadow-sm transition backdrop-blur-xs cursor-pointer"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="p-5 space-y-2">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>

                    {product.category && (
                      <span className="inline-block text-[11px] font-medium text-slate-500">
                        {product.category.name}
                      </span>
                    )}

                    {/* Rating Pill */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-slate-800">
                        {product.averageRating > 0 ? product.averageRating : 'New'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({product.reviewCount || 0})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="pt-2">
                      <span className="text-base font-extrabold text-slate-900 block">
                        {formatBDT(product.price)}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatUSD(product.price)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <Link
                    to={`/products/${product.id}`}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-semibold text-xs flex items-center justify-center gap-1.5 transition text-center shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </Link>

                  <button
                    type="button"
                    onClick={() => addToCart(product, 1)}
                    disabled={product.stock <= 0}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition text-center shadow-2xs cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
