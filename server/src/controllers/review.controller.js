import * as reviewService from '../services/review.service.js';

/**
 * Submit or update a review for a product
 * POST /api/products/:productId/reviews
 */
export const createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    const review = await reviewService.addOrUpdateReview({
      userId: req.user.id,
      productId,
      rating,
      comment,
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: { review },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all reviews & calculated stats for a product
 * GET /api/products/:productId/reviews
 */
export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const result = await reviewService.getProductReviews(productId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Check if current user is eligible to write a review for a product
 * GET /api/products/:productId/reviews/eligibility
 */
export const checkEligibility = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const eligibility = await reviewService.checkReviewEligibility(
      req.user.id,
      productId
    );

    return res.status(200).json({
      success: true,
      data: eligibility,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a review by ID
 * DELETE /api/reviews/:id
 */
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await reviewService.deleteReview(id, req.user.id, req.user.role);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
};
