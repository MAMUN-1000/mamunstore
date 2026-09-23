import prisma from '../config/db.js';

/**
 * Retrieve high-level store KPIs and business analytics for administrators
 */
export const getAdminMetrics = async () => {
  // Execute aggregation and count queries concurrently
  const [
    revenueResult,
    totalOrders,
    totalProducts,
    totalCustomers,
    lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    // Total Revenue (excluding cancelled orders)
    prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        status: {
          not: 'CANCELLED',
        },
      },
    }),

    // Total Orders placed
    prisma.order.count(),

    // Total Products in catalog
    prisma.product.count(),

    // Total Registered Customers
    prisma.user.count({
      where: {
        role: 'CUSTOMER',
      },
    }),

    // Products with 5 or fewer items remaining in stock
    prisma.product.findMany({
      where: {
        stock: {
          lte: 5,
        },
      },
      include: {
        category: {
          select: { name: true },
        },
      },
      orderBy: {
        stock: 'asc',
      },
      take: 10,
    }),

    // 5 Most recent customer orders
    prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const totalRevenue = revenueResult._sum.totalAmount || 0;

  return {
    kpis: {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      lowStockCount: lowStockProducts.length,
    },
    lowStockProducts,
    recentOrders,
  };
};
