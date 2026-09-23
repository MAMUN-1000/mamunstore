import prisma from '../config/db.js';

/**
 * Retrieve paginated, filtered, and sorted products
 */
export const getProducts = async ({
  search = '',
  categoryId,
  minPrice,
  maxPrice,
  sortBy = 'newest',
  page = 1,
  limit = 6,
}) => {
  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.max(1, parseInt(limit, 10) || 6);
  const skip = (pageNumber - 1) * pageSize;

  // Build the dynamic WHERE filter object for Prisma
  const where = {};

  // 1. Keyword search (case-insensitive across name and description)
  if (search && search.trim().length > 0) {
    const trimmed = search.trim();
    where.OR = [
      { name: { contains: trimmed, mode: 'insensitive' } },
      { description: { contains: trimmed, mode: 'insensitive' } },
    ];
  }

  // 2. Category filter
  if (categoryId) {
    const parsedCatId = parseInt(categoryId, 10);
    if (!isNaN(parsedCatId)) {
      where.categoryId = parsedCatId;
    }
  }

  // 3. Price range filter
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice && !isNaN(parseFloat(minPrice))) {
      where.price.gte = parseFloat(minPrice);
    }
    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      where.price.lte = parseFloat(maxPrice);
    }
  }

  // 4. Sort order configuration
  let orderBy = { createdAt: 'desc' }; // default: newest
  if (sortBy === 'price-asc') {
    orderBy = { price: 'asc' };
  } else if (sortBy === 'price-desc') {
    orderBy = { price: 'desc' };
  } else if (sortBy === 'name-asc') {
    orderBy = { name: 'asc' };
  }

  // Execute data query and count query concurrently for optimal performance
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      skip,
      take: pageSize,
      orderBy,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  // Enrich products with computed rating metrics
  const enrichedProducts = products.map((prod) => {
    const count = prod.reviews?.length || 0;
    const avg =
      count > 0
        ? Number((prod.reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1))
        : 0;
    const { reviews, ...rest } = prod;
    return {
      ...rest,
      reviewCount: count,
      averageRating: avg,
    };
  });

  return {
    products: enrichedProducts,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
    },
  };
};

/**
 * Retrieve a single product by its Primary Key ID with category and customer reviews
 */
export const getProductById = async (id) => {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    const error = new Error('Invalid product ID provided.');
    error.status = 400;
    throw error;
  }

  const product = await prisma.product.findUnique({
    where: { id: parsedId },
    include: {
      category: true,
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!product) {
    const error = new Error('Product not found.');
    error.status = 404;
    throw error;
  }

  // Calculate review aggregation statistics
  const totalReviews = product.reviews.length;
  let averageRating = 0;
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const percentages = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  if (totalReviews > 0) {
    const sum = product.reviews.reduce((acc, r) => {
      if (breakdown[r.rating] !== undefined) {
        breakdown[r.rating] += 1;
      }
      return acc + r.rating;
    }, 0);

    averageRating = Number((sum / totalReviews).toFixed(1));

    for (let star = 1; star <= 5; star++) {
      percentages[star] = Math.round((breakdown[star] / totalReviews) * 100);
    }
  }

    return {
      ...product,
      stats: {
        totalReviews,
        averageRating,
        breakdown,
        percentages,
      },
    };
  };

  /**
   * Administrator: Create a new product
   */
  export const createProduct = async ({
    name,
    description,
    price,
    stock,
    imageUrl,
    categoryId,
  }) => {
    if (!name || !name.trim()) {
      const error = new Error('Product name is required.');
      error.status = 400;
      throw error;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      const error = new Error('Valid non-negative price is required.');
      error.status = 400;
      throw error;
    }

    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      const error = new Error('Valid non-negative stock count is required.');
      error.status = 400;
      throw error;
    }

    const parsedCategoryId = parseInt(categoryId, 10);
    if (isNaN(parsedCategoryId)) {
      const error = new Error('Valid category must be selected.');
      error.status = 400;
      throw error;
    }

    // Verify Category exists
    const category = await prisma.category.findUnique({
      where: { id: parsedCategoryId },
    });
    if (!category) {
      const error = new Error('Selected category does not exist.');
      error.status = 404;
      throw error;
    }

    // Generate unique slug
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        slug,
        description: description ? description.trim() : '',
        price: parsedPrice,
        stock: parsedStock,
        imageUrl:
          imageUrl && imageUrl.trim()
            ? imageUrl.trim()
            : 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80',
        categoryId: parsedCategoryId,
      },
      include: {
        category: true,
      },
    });

    return newProduct;
  };

  /**
   * Administrator: Update an existing product
   */
  export const updateProduct = async (id, updateData) => {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      const error = new Error('Invalid product ID.');
      error.status = 400;
      throw error;
    }

    const existing = await prisma.product.findUnique({
      where: { id: parsedId },
    });

    if (!existing) {
      const error = new Error('Product not found.');
      error.status = 404;
      throw error;
    }

    const dataToUpdate = {};

    if (updateData.name !== undefined) {
      dataToUpdate.name = updateData.name.trim();
    }
    if (updateData.description !== undefined) {
      dataToUpdate.description = updateData.description.trim();
    }
    if (updateData.price !== undefined) {
      const p = parseFloat(updateData.price);
      if (isNaN(p) || p < 0) {
        const error = new Error('Valid non-negative price is required.');
        error.status = 400;
        throw error;
      }
      dataToUpdate.price = p;
    }
    if (updateData.stock !== undefined) {
      const s = parseInt(updateData.stock, 10);
      if (isNaN(s) || s < 0) {
        const error = new Error('Valid non-negative stock count is required.');
        error.status = 400;
        throw error;
      }
      dataToUpdate.stock = s;
    }
    if (updateData.imageUrl !== undefined && updateData.imageUrl.trim()) {
      dataToUpdate.imageUrl = updateData.imageUrl.trim();
    }
    if (updateData.categoryId !== undefined) {
      const cId = parseInt(updateData.categoryId, 10);
      if (!isNaN(cId)) {
        const cat = await prisma.category.findUnique({ where: { id: cId } });
        if (!cat) {
          const error = new Error('Category not found.');
          error.status = 404;
          throw error;
        }
        dataToUpdate.categoryId = cId;
      }
    }

    const updated = await prisma.product.update({
      where: { id: parsedId },
      data: dataToUpdate,
      include: {
        category: true,
      },
    });

    return updated;
  };

  /**
   * Administrator: Delete a product (protected against deleting items with order history)
   */
  export const deleteProduct = async (id) => {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      const error = new Error('Invalid product ID.');
      error.status = 400;
      throw error;
    }

    const existing = await prisma.product.findUnique({
      where: { id: parsedId },
    });

    if (!existing) {
      const error = new Error('Product not found.');
      error.status = 404;
      throw error;
    }

    // Check for foreign key restriction with past customer orders
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: parsedId },
    });

    if (orderItemsCount > 0) {
      const error = new Error(
        'Cannot delete this product because it has past customer order history in the system. To discontinue it, please set its stock to 0.'
      );
      error.status = 400;
      throw error;
    }

    await prisma.product.delete({
      where: { id: parsedId },
    });

    return { message: 'Product deleted successfully.' };
  };
