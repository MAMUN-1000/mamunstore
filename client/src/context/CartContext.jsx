import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // 1. Initialize cart from LocalStorage if available
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('ecommerce_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (err) {
      console.error('Failed to parse cart from localStorage:', err);
      return [];
    }
  });

  // State to control slide-over Cart Drawer visibility
  const [isCartOpen, setIsCartOpen] = useState(false);

  // 2. Synchronize cart state to LocalStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem('ecommerce_cart', JSON.stringify(cartItems));
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err);
    }
  }, [cartItems]);

  // Open/Close Cart Drawer controls
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  /**
   * Add a product to the cart
   * @param {Object} product - Product model from backend
   * @param {number} quantity - Quantity to add (default 1)
   */
  const addToCart = (product, quantity = 1) => {
    if (!product || product.stock <= 0) return;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === product.id);

      if (existingIndex > -1) {
        // Item exists: update quantity without exceeding available inventory
        const existingItem = prevItems[existingIndex];
        const newQuantity = Math.min(existingItem.quantity + quantity, product.stock);

        const updated = [...prevItems];
        updated[existingIndex] = {
          ...existingItem,
          quantity: newQuantity,
          stock: product.stock, // Ensure latest stock limit
        };
        return updated;
      } else {
        // New item: append to cart
        const newItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          stock: product.stock,
          categoryName: product.category?.name || '',
          quantity: Math.min(quantity, product.stock),
        };
        return [...prevItems, newItem];
      }
    });

    // Automatically slide open the drawer for instant feedback
    setIsCartOpen(true);
  };

  /**
   * Update the quantity of a specific item in the cart
   */
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === productId) {
          const clampedQty = Math.min(newQuantity, item.stock);
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  /**
   * Remove an item completely from the cart
   */
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  /**
   * Wipe cart items (used after checkout)
   */
  const clearCart = () => {
    setCartItems([]);
  };

  // ==========================================
  // Derived State (Calculated on the fly)
  // ==========================================
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Free shipping on orders over $100, otherwise flat $10 (free if cart empty)
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 10;
  // Estimated sales tax at 8%
  const estimatedTax = subtotal * 0.08;
  const grandTotal = subtotal + shipping + estimatedTax;

  const value = {
    cartItems,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    itemCount,
    subtotal,
    shipping,
    estimatedTax,
    grandTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
