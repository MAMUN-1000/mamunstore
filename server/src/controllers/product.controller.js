import * as productService from '../services/product.service.js';

/**
 * Get paginated & filtered list of products
 * GET /api/products
 */
export const getProducts = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, sortBy, page, limit } = req.query;

    const result = await productService.getProducts({
      search,
      categoryId: category,
      minPrice,
      maxPrice,
      sortBy,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single product by ID
 * GET /api/products/:id
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    return res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (err) {
    next(err);
  }
};
