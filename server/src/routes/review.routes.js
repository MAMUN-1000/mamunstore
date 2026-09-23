import express from 'express';
import { verifyAuth } from '../middleware/auth.middleware.js';
import * as reviewController from '../controllers/review.controller.js';

const router = express.Router();

// GET /api/products/:productId/reviews (Public - read reviews & aggregated stats)
router.get('/products/:productId/reviews', reviewController.getProductReviews);

// GET /api/products/:productId/reviews/eligibility (Protected - check verified buyer status)
router.get(
  '/products/:productId/reviews/eligibility',
  verifyAuth,
  reviewController.checkEligibility
);

// POST /api/products/:productId/reviews (Protected - write or edit review)
router.post('/products/:productId/reviews', verifyAuth, reviewController.createReview);

// DELETE /api/reviews/:id (Protected - delete review by author or admin)
router.delete('/reviews/:id', verifyAuth, reviewController.deleteReview);

export default router;
