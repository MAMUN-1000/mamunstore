import express from 'express';
import * as categoryController from '../controllers/category.controller.js';

const router = express.Router();

// GET /api/categories - Public
router.get('/', categoryController.getCategories);

export default router;
