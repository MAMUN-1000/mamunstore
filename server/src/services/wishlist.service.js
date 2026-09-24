import prisma from '../config/db.js';

/**
 * Retrieve customer wishlist items with full product and rating details
 */
export const getWishlist = async (userId) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          reviews: {
            select: { rating: true },
          },
        },
      },
    },
  });

  return items.map((item) => {
    const totalReviews = item.product.reviews.length;
    const avgRating =
      totalReviews > 0
        ? parseFloat(
            (
              item.product.reviews.reduce((sum, r) => sum + r.rating, 0) /
              totalReviews
            ).toFixed(1)
          )
        : 0;

    return {
      id: item.id,
      productId: item.productId,
      createdAt: item.createdAt,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        description: item.product.description,
        price: item.product.price,
        stock: item.product.stock,
        imageUrl: item.product.imageUrl,
        category: item.product.category,
        averageRating: avgRating,
        reviewCount: totalReviews,
      },
    };
  });
};

/**
 * Add a product to the customer's wishlist
 */
export const addToWishlist = async ({ userId, productId }) => {
  const parsedProductId = parseInt(productId, 10);
  if (isNaN(parsedProductId)) {
    const error = new Error('Invalid product ID.');
    error.status = 400;
    throw error;
  }

  const product = await prisma.product.findUnique({
    where: { id: parsedProductId },
  });

  if (!product) {
    const error = new Error('Product not found.');
    error.status = 404;
    throw error;
  }

  // Idempotent upsert preventing duplicate entries
  const wishlistItem = await prisma.wishlistItem.upsert({
    where: {
      userId_productId: {
        userId,
        productId: parsedProductId,
      },
    },
    update: {}, // No changes if already exists
    create: {
      userId,
      productId: parsedProductId,
    },
    include: {
      product: true,
    },
  });

  return wishlistItem;
};

/**
 * Remove a product from the customer's wishlist
 */
export const removeFromWishlist = async ({ userId, productId }) => {
  const parsedProductId = parseInt(productId, 10);
  if (isNaN(parsedProductId)) {
    const error = new Error('Invalid product ID.');
    error.status = 400;
    throw error;
  }

  // Check existence
  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId: parsedProductId,
      },
    },
  });

  if (!existing) {
    return { removed: false, message: 'Item not in wishlist.' };
  }

  await prisma.wishlistItem.delete({
    where: {
      userId_productId: {
        userId,
        productId: parsedProductId,
      },
    },
  });

  return { removed: true, productId: parsedProductId };
};

/**
 * Check if a product is in customer's wishlist
 */
export const checkWishlistStatus = async (userId, productId) => {
  const parsedProductId = parseInt(productId, 10);
  if (isNaN(parsedProductId)) return { inWishlist: false };

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId: parsedProductId,
      },
    },
  });

  return { inWishlist: !!existing };
};
