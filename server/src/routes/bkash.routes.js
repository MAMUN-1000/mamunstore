import express from 'express';
import { verifyAuth } from '../middleware/auth.middleware.js';
import * as bkashController from '../controllers/bkash.controller.js';

const router = express.Router();

/**
 * @route   POST /api/bkash/create-payment
 * @desc    Initiate bKash Sandbox payment session
 * @access  Private (Authenticated Customers)
 */
router.post('/create-payment', verifyAuth, bkashController.createPaymentHandler);

/**
 * @route   GET /api/bkash/callback
 * @desc    Handle bKash redirect callback after user completes/cancels payment
 * @access  Public (Called via browser redirect by bKash)
 */
router.get('/callback', bkashController.handleCallback);

/**
 * @route   POST /api/bkash/callback
 * @desc    Handle bKash redirect callback via POST if applicable
 * @access  Public
 */
router.post('/callback', bkashController.handleCallback);

export default router;
