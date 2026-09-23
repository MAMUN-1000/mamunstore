import prisma from '../config/db.js';

/**
 * Creates an order inside an atomic Prisma transaction:
 * 1. Checks current product existence & verifies stock availability
 * 2. Decrements product stock in PostgreSQL
 * 3. Creates the Order record with shipping address & calculated totals
 * 4. Creates OrderItem records freezing the unit price at purchase time
 */
export const createOrder = async ({ userId, items, shippingAddress }) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    const error = new Error('Your cart is empty. Please add items before checking out.');
    error.status = 400;
    throw error;
  }

  // Execute inside an atomic transaction
  return await prisma.$transaction(async (tx) => {
    let subtotal = 0;
    const verifiedItems = [];

    // 1. Verify all products and check stock availability
    for (const item of items) {
      const productId = parseInt(item.productId || item.id, 10);
      const quantity = parseInt(item.quantity, 10);

      if (isNaN(productId) || isNaN(quantity) || quantity <= 0) {
        const error = new Error('Invalid product or quantity specified.');
        error.status = 400;
        throw error;
      }

      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        const error = new Error(`Product with ID ${productId} no longer exists.`);
        error.status = 404;
        throw error;
      }

      if (product.stock < quantity) {
        const error = new Error(
          `Insufficient stock for "${product.name}". Only ${product.stock} units remain available.`
        );
        error.status = 400;
        throw error;
      }

      subtotal += product.price * quantity;
      verifiedItems.push({
        productId: product.id,
        quantity,
        unitPrice: product.price, // Freeze price snapshot
      });
    }

    // 2. Calculate tax and shipping
    const shipping = subtotal > 100 ? 0 : 10;
    const estimatedTax = subtotal * 0.08;
    const totalAmount = subtotal + shipping + estimatedTax;

    // 3. Decrement stock for all items
    for (const item of verifiedItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // 4. Create the Order with nested OrderItems
    const paymentMethod = typeof shippingAddress === 'object' ? shippingAddress?.paymentMethod : 'card';
    const initialStatus = paymentMethod === 'cod' ? 'PENDING' : 'PAID';

    const order = await tx.order.create({
      data: {
        userId,
        totalAmount,
        status: initialStatus, // COD starts as PENDING until courier delivery, MFS/Card are PAID
        shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress),
        items: {
          create: verifiedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return order;
  });
};

/**
 * Retrieve all past orders for a specific customer
 */
export const getMyOrders = async (userId) => {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Retrieve details of a specific order by ID
 */
export const getOrderById = async (orderId, userId, userRole) => {
  const parsedId = parseInt(orderId, 10);
  if (isNaN(parsedId)) {
    const error = new Error('Invalid order ID provided.');
    error.status = 400;
    throw error;
  }

  const order = await prisma.order.findUnique({
    where: { id: parsedId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!order) {
    const error = new Error('Order not found.');
    error.status = 404;
    throw error;
  }

  // Authorization check: only order owner or an administrator can view
  if (order.userId !== userId && userRole !== 'ADMIN') {
    const error = new Error('You do not have permission to view this order.');
    error.status = 403;
    throw error;
  }

  return order;
};

/**
 * Administrator: Retrieve all customer orders with filtering and pagination
 */
export const getAllOrdersAdmin = async ({ page = 1, limit = 10, status }) => {
  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNumber - 1) * pageSize;

  const where = {};
  if (status && status !== 'ALL') {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: pageSize,
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
                imageUrl: true,
              },
            },
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  return {
    orders,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
    },
  };
};

/**
 * Administrator: Update the fulfillment status of an order
 */
export const updateOrderStatusAdmin = async (orderId, newStatus) => {
  const parsedId = parseInt(orderId, 10);
  if (isNaN(parsedId)) {
    const error = new Error('Invalid order ID provided.');
    error.status = 400;
    throw error;
  }

  const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(newStatus)) {
    const error = new Error(
      `Invalid order status. Must be one of: ${validStatuses.join(', ')}`
    );
    error.status = 400;
    throw error;
  }

  const existingOrder = await prisma.order.findUnique({
    where: { id: parsedId },
  });

  if (!existingOrder) {
    const error = new Error('Order not found.');
    error.status = 404;
    throw error;
  }

  const updatedOrder = await prisma.order.update({
    where: { id: parsedId },
    data: {
      status: newStatus,
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
          product: true,
        },
      },
    },
  });

  return updatedOrder;
};

