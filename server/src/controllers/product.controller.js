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

/**
 * Create a new product (Admin only)
 * POST /api/products
 */
export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: { product },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing product (Admin only)
 * PUT /api/products/:id
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: { product },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a product (Admin only)
 * DELETE /api/products/:id
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await productService.deleteProduct(id);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
};
