import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Eye, CheckCircle2, AlertTriangle, ShoppingCart, Star, Heart } from 'lucide-react';
import { formatBDT } from '../utils/currency';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group">
      {/* Product Image */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Category Pill Tag */}
        {product.category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-sm text-slate-700 shadow-sm border border-slate-200/60">
            {product.category.name}
          </span>
        )}

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute bottom-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all shadow-sm cursor-pointer ${
            isWishlisted
              ? 'bg-rose-500 text-white hover:bg-rose-600'
              : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          {product.stock > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              In Stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
              <AlertTriangle className="w-3 h-3 text-rose-500" />
              Sold Out
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <Link to={`/products/${product.id}`}>
            <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1 text-base">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Rating Pill */}
          <div className="flex items-center gap-1.5 pt-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-slate-800">
              {product.averageRating > 0 ? product.averageRating : 'New'}
            </span>
            <span className="text-[11px] text-slate-400">
              ({product.reviewCount || 0})
            </span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Price</span>
            <span className="text-base font-extrabold text-slate-900 block leading-tight">
              {formatBDT(product.price)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              to={`/products/${product.id}`}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all shadow-2xs"
              title="View product details"
            >
              <Eye className="w-3.5 h-3.5" />
              View
            </Link>

            <button
              onClick={() => addToCart(product, 1)}
              disabled={product.stock <= 0}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
              title="Add 1 to cart"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
