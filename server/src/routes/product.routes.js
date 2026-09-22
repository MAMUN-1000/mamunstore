import express from 'express';
import * as productController from '../controllers/product.controller.js';

const router = express.Router();

// GET /api/products - Public
router.get('/', productController.getProducts);

// GET /api/products/:id - Public
router.get('/:id', productController.getProductById);

export default router;
