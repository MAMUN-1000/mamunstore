import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import NotificationDropdown from './NotificationDropdown';
import {
  ShoppingBag,
  User,
  LogOut,
  ShieldCheck,
  LogIn,
  UserPlus,
  ShoppingCart,
  Heart,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, loading, isAdmin } = useAuth();
  const { itemCount, toggleCart } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="bg-emerald-600 group-hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors shadow-sm">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">
            Mamun<span className="text-emerald-600">Store</span>
          </span>
        </Link>

        {/* Center / Navigation Links */}
        <nav className="flex items-center gap-3.5 lg:gap-5">
          {isAdmin ? (
            // Dedicated Admin Navigation Links
            <>
              <Link
                to="/"
                className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors whitespace-nowrap"
              >
                Storefront
              </Link>
              <Link
                to="/products"
                className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors whitespace-nowrap"
              >
                Catalog
              </Link>
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors whitespace-nowrap"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                Admin Portal
              </Link>
              <Link
                to="/admin?tab=orders"
                className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors whitespace-nowrap"
              >
                Orders
              </Link>
              <Link
                to="/admin?tab=returns"
                className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors whitespace-nowrap"
              >
                Returns &amp; Refunds
              </Link>
              <Link
                to="/admin?tab=coupons"
                className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors whitespace-nowrap"
              >
                Coupons
              </Link>
              <Link
                to="/admin?tab=products"
                className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors whitespace-nowrap"
              >
                Inventory
              </Link>
            </>
          ) : (
            // Customer & Guest Navigation Links
            <>
              <Link
                to="/"
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors whitespace-nowrap"
              >
                Home
              </Link>
              <Link
                to="/products"
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors whitespace-nowrap"
              >
                Catalog
              </Link>
              {user && (
                <>
                  <Link
                    to="/orders"
                    className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors whitespace-nowrap"
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/orders"
                    className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors whitespace-nowrap"
                  >
                    Returns &amp; Refunds
                  </Link>
                </>
              )}
              <Link
                to="/customer-care"
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors whitespace-nowrap"
              >
                Customer Care
              </Link>
              <Link
                to="/help"
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors whitespace-nowrap"
              >
                Help Center
              </Link>
            </>
          )}
        </nav>

        {/* Right / Auth & Cart Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Wishlist Link (Customer Only) */}
          {user && !isAdmin && (
            <Link
              to="/wishlist"
              className="relative p-2 rounded-xl text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-white font-bold text-[11px] flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>
          )}

          {/* Cart Drawer Trigger */}
          <button
            onClick={toggleCart}
            className="relative p-2 rounded-xl text-slate-700 hover:text-emerald-600 hover:bg-slate-100 transition"
            title="Open Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shadow-sm">
                {itemCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {user && <NotificationDropdown />}

          {loading ? (
            <div className="w-20 h-8 bg-slate-100 animate-pulse rounded-lg ml-2" />
          ) : user ? (
            // Logged In Controls
            <div className="flex items-center gap-2 ml-1">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden sm:inline">{user.name}</span>
              </Link>

              <button
                onClick={handleLogout}
                title="Log out of your account"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            // Logged Out Controls
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
