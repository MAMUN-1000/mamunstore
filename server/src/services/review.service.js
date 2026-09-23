import prisma from '../config/db.js';

/**
 * Submit or update a customer product review with Verified Buyer enforcement
 */
export const addOrUpdateReview = async ({ userId, productId, rating, comment }) => {
  const parsedProductId = parseInt(productId, 10);
  const parsedRating = parseInt(rating, 10);

  if (isNaN(parsedProductId)) {
    const error = new Error('Invalid product ID.');
    error.status = 400;
    throw error;
  }

  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    const error = new Error('Rating must be an integer between 1 and 5 stars.');
    error.status = 400;
    throw error;
  }

  // 1. Verify Product exists
  const product = await prisma.product.findUnique({
    where: { id: parsedProductId },
  });

  if (!product) {
    const error = new Error('Product not found.');
    error.status = 404;
    throw error;
  }

  // 2. Verified Buyer Check: Customer must have an order containing this product
  // with status PAID, SHIPPED, or DELIVERED.
  const verifiedPurchase = await prisma.orderItem.findFirst({
    where: {
      productId: parsedProductId,
      order: {
        userId,
        status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
      },
    },
  });

  if (!verifiedPurchase) {
    const error = new Error(
      'Verified Purchase Required: Only customers who have purchased this product can leave a review.'
    );
    error.status = 403;
    throw error;
  }

  // 3. Upsert Review: If customer already reviewed, update; otherwise create
  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      productId: parsedProductId,
    },
  });

  let review;
  if (existingReview) {
    review = await prisma.review.update({
      where: { id: existingReview.id },
      data: {
        rating: parsedRating,
        comment: comment ? comment.trim() : null,
      },
      include: {
        user: {
          select: { id: true, name: true, role: true },
        },
      },
    });
  } else {
    review = await prisma.review.create({
      data: {
        userId,
        productId: parsedProductId,
        rating: parsedRating,
        comment: comment ? comment.trim() : null,
      },
      include: {
        user: {
          select: { id: true, name: true, role: true },
        },
      },
    });
  }

  return review;
};

/**
 * Retrieve all reviews for a product with computed rating aggregates & breakdown
 */
export const getProductReviews = async (productId) => {
  const parsedProductId = parseInt(productId, 10);
  if (isNaN(parsedProductId)) {
    const error = new Error('Invalid product ID.');
    error.status = 400;
    throw error;
  }

  const reviews = await prisma.review.findMany({
    where: { productId: parsedProductId },
    include: {
      user: {
        select: { id: true, name: true, role: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculate Aggregations
  const totalReviews = reviews.length;
  let averageRating = 0;
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const percentages = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  if (totalReviews > 0) {
    const sum = reviews.reduce((acc, r) => {
      if (breakdown[r.rating] !== undefined) {
        breakdown[r.rating] += 1;
      }
      return acc + r.rating;
    }, 0);

    averageRating = Number((sum / totalReviews).toFixed(1));

    for (let star = 1; star <= 5; star++) {
      percentages[star] = Math.round((breakdown[star] / totalReviews) * 100);
    }
  }

  return {
    reviews,
    stats: {
      totalReviews,
      averageRating,
      breakdown,
      percentages,
    },
  };
};

/**
 * Check if the currently authenticated user is eligible to write a review
 */
export const checkReviewEligibility = async (userId, productId) => {
  const parsedProductId = parseInt(productId, 10);
  if (isNaN(parsedProductId)) {
    return { canReview: false, hasPurchased: false, existingReview: null };
  }

  // Check purchase history
  const verifiedPurchase = await prisma.orderItem.findFirst({
    where: {
      productId: parsedProductId,
      order: {
        userId,
        status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
      },
    },
  });

  // Check if review already exists
  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      productId: parsedProductId,
    },
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  });

  return {
    hasPurchased: Boolean(verifiedPurchase),
    canReview: Boolean(verifiedPurchase),
    alreadyReviewed: Boolean(existingReview),
    existingReview: existingReview || null,
  };
};

/**
 * Delete a review (restricted to author or ADMIN)
 */
export const deleteReview = async (reviewId, userId, userRole) => {
  const parsedReviewId = parseInt(reviewId, 10);
  if (isNaN(parsedReviewId)) {
    const error = new Error('Invalid review ID.');
    error.status = 400;
    throw error;
  }

  const review = await prisma.review.findUnique({
    where: { id: parsedReviewId },
  });

  if (!review) {
    const error = new Error('Review not found.');
    error.status = 404;
    throw error;
  }

  if (review.userId !== userId && userRole !== 'ADMIN') {
    const error = new Error('You do not have permission to delete this review.');
    error.status = 403;
    throw error;
  }

  await prisma.review.delete({
    where: { id: parsedReviewId },
  });

  return { message: 'Review deleted successfully.' };
};
