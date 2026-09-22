import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { verifyAuth } from '../middleware/auth.middleware.js';
import { verifyAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Authenticated routes
router.post('/logout', verifyAuth, authController.logout);
router.get('/me', verifyAuth, authController.getMe);

// Admin-only route (protected by both verifyAuth and verifyAdmin)
router.get('/admin-check', verifyAuth, verifyAdmin, authController.adminCheck);

export default router;
