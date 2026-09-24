import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch customer wishlist from server
  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.get('/wishlist');
      setWishlistItems(res.data.data.items || []);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Check if a specific product is saved in wishlist
  const isInWishlist = useCallback(
    (productId) => {
      const pid = parseInt(productId, 10);
      return wishlistItems.some((item) => item.productId === pid);
    },
    [wishlistItems]
  );

  // Add product to wishlist
  const addToWishlist = async (product) => {
    if (!user) {
      return { success: false, requireLogin: true };
    }

    const productId = product.id || product.productId;
    try {
      const res = await axiosInstance.post('/wishlist', { productId });
      await fetchWishlist();
      return { success: true, item: res.data.data.item };
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to add to wishlist.',
      };
    }
  };

  // Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    if (!user) return { success: false };

    const pid = parseInt(productId, 10);
    try {
      // Optimistic update
      setWishlistItems((prev) => prev.filter((item) => item.productId !== pid));
      await axiosInstance.delete(`/wishlist/${pid}`);
      return { success: true };
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      await fetchWishlist(); // Rollback on failure
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to remove from wishlist.',
      };
    }
  };

  // Toggle product in/out of wishlist
  const toggleWishlist = async (product) => {
    if (!user) {
      return { success: false, requireLogin: true };
    }

    const productId = product.id || product.productId;
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(product);
    }
  };

  const value = {
    wishlistItems,
    wishlistCount: wishlistItems.length,
    loading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    refreshWishlist: fetchWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
