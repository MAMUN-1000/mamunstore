import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';

export const CartDrawer = () => {
  const {
    isCartOpen,
    closeCart,
    cartItems,
    updateQuantity,
    removeFromCart,
    subtotal,
    itemCount,
  } = useCart();

  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleNavigate = (path) => {
    closeCart();
    navigate(path);
  };

  const freeShippingThreshold = 100;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark Overlay Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over Right Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slideInRight">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Shopping Cart</h2>
                <p className="text-xs text-slate-500">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          {subtotal > 0 && (
            <div className="px-5 py-3 bg-emerald-50/70 border-b border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-900">
              <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              {remainingForFreeShipping > 0 ? (
                <span>
                  Add <strong className="font-bold">${remainingForFreeShipping.toFixed(2)}</strong> more for <strong>FREE shipping</strong>!
                </span>
              ) : (
                <span className="font-semibold text-emerald-700">
                  🎉 You've unlocked FREE Shipping!
                </span>
              )}
            </div>
          )}

          {/* Drawer Body: Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-base">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Looks like you haven't added anything to your cart yet.
                  </p>
                </div>
                <button
                  onClick={() => handleNavigate('/products')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-sm transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex gap-3.5"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-white border border-slate-200 flex-shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80';
                    }}
                  />

                  {/* Info & Controls */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.name}
                        </h4>
                        <span className="text-[11px] text-slate-500 block">
                          ${item.price.toFixed(2)} each
                        </span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity Controls */}
                      <div className="inline-flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <span className="text-xs font-extrabold text-slate-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-600">Subtotal:</span>
                <span className="font-extrabold text-slate-900 text-lg">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Taxes and shipping calculated at checkout.
              </p>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => handleNavigate('/cart')}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs shadow-2xs transition"
                >
                  View Full Cart & Breakdown
                </button>

                <button
                  onClick={() => handleNavigate('/checkout')}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 group"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
