import express from 'express';
import { verifyAuth } from '../middleware/auth.middleware.js';
import { verifyAdmin } from '../middleware/admin.middleware.js';
import * as adminController from '../controllers/admin.controller.js';

const router = express.Router();

// GET /api/admin/metrics (Protected by verifyAuth and verifyAdmin)
router.get('/metrics', verifyAuth, verifyAdmin, adminController.getAdminMetrics);

export default router;
