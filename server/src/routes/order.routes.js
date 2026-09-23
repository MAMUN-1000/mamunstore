import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import { verifyAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// All order endpoints require authentication
router.use(verifyAuth);

router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);

export default router;
