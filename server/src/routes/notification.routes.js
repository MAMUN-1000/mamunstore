import { Router } from 'express';
import { verifyAuth } from '../middleware/auth.middleware.js';
import * as notificationController from '../controllers/notification.controller.js';

const router = Router();

// All notification endpoints require authenticated user
router.use(verifyAuth);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

export default router;
