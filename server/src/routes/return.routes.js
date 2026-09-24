import express from 'express';
import * as returnController from '../controllers/return.controller.js';
import { verifyAuth } from '../middleware/auth.middleware.js';
import { verifyAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

// All return endpoints require authentication
router.use(verifyAuth);

// Customer endpoints
router.post('/', returnController.createReturnRequest);
router.get('/my-returns', returnController.getMyReturns);

// Admin-only endpoints (MUST be defined before /:id)
router.get('/admin/all', verifyAdmin, returnController.getAllReturnsAdmin);
router.patch('/admin/:id/status', verifyAdmin, returnController.updateReturnStatusAdmin);

// Return request by ID (Customer owner or Admin)
router.get('/:id', returnController.getReturnById);

export default router;
