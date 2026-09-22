import * as categoryService from '../services/category.service.js';

/**
 * Get all product categories
 * GET /api/categories
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    return res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (err) {
    next(err);
  }
};
