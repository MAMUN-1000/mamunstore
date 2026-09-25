import { Router } from 'express';
import { verifyAuth } from '../middleware/auth.middleware.js';
import { verifyAdmin } from '../middleware/admin.middleware.js';
import * as couponController from '../controllers/coupon.controller.js';

import { sensitiveOpLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// Customer or authenticated user coupon validation route (Rate-limited against brute-force guessing)
router.post('/validate', verifyAuth, sensitiveOpLimiter, couponController.validateCoupon);

// Admin-only management endpoints (supports both /admin/* and /* paths)
router.get('/admin/all', verifyAuth, verifyAdmin, couponController.getAllCouponsAdmin);
router.get('/', verifyAuth, verifyAdmin, couponController.getAllCouponsAdmin);
router.post('/admin', verifyAuth, verifyAdmin, couponController.createCoupon);
router.post('/', verifyAuth, verifyAdmin, couponController.createCoupon);
router.put('/admin/:id', verifyAuth, verifyAdmin, couponController.updateCoupon);
router.put('/:id', verifyAuth, verifyAdmin, couponController.updateCoupon);
router.patch('/admin/:id/toggle', verifyAuth, verifyAdmin, couponController.toggleCouponActive);
router.patch('/:id/toggle', verifyAuth, verifyAdmin, couponController.toggleCouponActive);
router.delete('/admin/:id', verifyAuth, verifyAdmin, couponController.deleteCoupon);
router.delete('/:id', verifyAuth, verifyAdmin, couponController.deleteCoupon);

export default router;
