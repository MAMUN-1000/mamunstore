import prisma from '../config/db.js';

/**
 * Retrieve all categories with product counts
 */
export const getAllCategories = async () => {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
};
