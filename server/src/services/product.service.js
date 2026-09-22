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
      },
      skip,
      take: pageSize,
      orderBy,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  return {
    products,
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

  return product;
};
