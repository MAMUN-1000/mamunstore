import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import { verifyAuth } from '../middleware/auth.middleware.js';
import { verifyAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

// All order endpoints require authentication
router.use(verifyAuth);

// Customer endpoints
router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);

// Admin-only endpoints (MUST be defined before /:id)
router.get('/admin/all', verifyAdmin, orderController.getAllOrdersAdmin);
router.patch('/admin/:id/status', verifyAdmin, orderController.updateOrderStatusAdmin);

// Order by ID (Customer owner or Admin)
router.get('/:id', orderController.getOrderById);

export default router;
