import express from 'express';
import { verifyAuth } from '../middleware/auth.middleware.js';
import { verifyAdmin } from '../middleware/admin.middleware.js';
import * as productController from '../controllers/product.controller.js';

const router = express.Router();

// GET /api/products - Public
router.get('/', productController.getProducts);

// GET /api/products/:id - Public
router.get('/:id', productController.getProductById);

// Admin-only CRUD Routes
// POST /api/products - Create product
router.post('/', verifyAuth, verifyAdmin, productController.createProduct);

// PUT /api/products/:id - Update product
router.put('/:id', verifyAuth, verifyAdmin, productController.updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', verifyAuth, verifyAdmin, productController.deleteProduct);

export default router;
