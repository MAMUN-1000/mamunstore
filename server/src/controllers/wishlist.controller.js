import * as wishlistService from '../services/wishlist.service.js';

export const getWishlist = async (req, res) => {
  try {
    const items = await wishlistService.getWishlist(req.user.id);
    res.status(200).json({
      success: true,
      data: { items, count: items.length },
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to fetch wishlist.',
    });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const productId = req.body.productId || req.params.productId;
    const item = await wishlistService.addToWishlist({
      userId: req.user.id,
      productId,
    });
    res.status(201).json({
      success: true,
      message: 'Product added to wishlist.',
      data: { item },
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to add product to wishlist.',
    });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const productId = req.params.productId;
    const result = await wishlistService.removeFromWishlist({
      userId: req.user.id,
      productId,
    });
    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist.',
      data: result,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to remove product from wishlist.',
    });
  }
};

export const checkWishlistStatus = async (req, res) => {
  try {
    const productId = req.params.productId;
    const status = await wishlistService.checkWishlistStatus(req.user.id, productId);
    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to check wishlist status.',
    });
  }
};
