import prisma from '../config/db.js';

// Configurable policy constant for customer return eligibility (7 days from purchase/delivery)
export const RETURN_WINDOW_DAYS = 7;

/**
 * Customer: Create a partial or full return request for specific OrderItems
 */
export const createReturnRequest = async ({
  userId,
  orderId,
  reason,
  customerNotes,
  items,
}) => {
  const parsedOrderId = parseInt(orderId, 10);
  if (isNaN(parsedOrderId)) {
    const error = new Error('Invalid order ID provided.');
    error.status = 400;
    throw error;
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    const error = new Error('Please select at least one item to return.');
    error.status = 400;
    throw error;
  }

  if (!reason || typeof reason !== 'string' || !reason.trim()) {
    const error = new Error('Please provide a reason for the return.');
    error.status = 400;
    throw error;
  }

  // 1. Fetch order with items and past return requests
  const order = await prisma.order.findUnique({
    where: { id: parsedOrderId },
    include: {
      items: {
        include: {
          product: true,
          returnItems: {
            include: {
              returnRequest: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    const error = new Error('Order not found.');
    error.status = 404;
    throw error;
  }

  // Authorization check: Customer can only return their own order
  if (order.userId !== userId) {
    const error = new Error('You do not have permission to request a return for this order.');
    error.status = 403;
    throw error;
  }

  // Eligibility Check 1: Order must have reached DELIVERED status
  if (order.status !== 'DELIVERED') {
    const error = new Error(
      `Only delivered orders are eligible for return. Current order status: "${order.status}". If you need to cancel a pending order, please contact Customer Care.`
    );
    error.status = 400;
    throw error;
  }

  // Eligibility Check 2: Check return window
  const orderAgeMs = Date.now() - new Date(order.createdAt).getTime();
  const maxReturnAgeMs = RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  if (orderAgeMs > maxReturnAgeMs) {
    const error = new Error(
      `Return window has expired. Returns must be requested within ${RETURN_WINDOW_DAYS} days of order confirmation.`
    );
    error.status = 400;
    throw error;
  }

  // 2. Validate individual requested OrderItems and quantities
  const verifiedReturnItems = [];
  let calculatedRefundTotal = 0;

  for (const reqItem of items) {
    const orderItemId = parseInt(reqItem.orderItemId, 10);
    const returnQty = parseInt(reqItem.quantity, 10);

    if (isNaN(orderItemId) || isNaN(returnQty) || returnQty <= 0) {
      const error = new Error('Invalid order item or quantity specified in return request.');
      error.status = 400;
      throw error;
    }

    const orderItem = order.items.find((i) => i.id === orderItemId);
    if (!orderItem) {
      const error = new Error(`Item #${orderItemId} does not belong to Order #${parsedOrderId}.`);
      error.status = 400;
      throw error;
    }

    // Calculate how many units of this OrderItem were already requested/returned (excluding rejected)
    const existingReturnedQty = orderItem.returnItems
      .filter((ri) => ri.returnRequest.status !== 'REJECTED')
      .reduce((sum, ri) => sum + ri.quantity, 0);

    const availableToReturn = orderItem.quantity - existingReturnedQty;

    if (returnQty > availableToReturn) {
      const error = new Error(
        `Cannot return ${returnQty} unit(s) of "${orderItem.product.name}". Only ${availableToReturn} unit(s) remain eligible for return.`
      );
      error.status = 400;
      throw error;
    }

    calculatedRefundTotal += orderItem.unitPrice * returnQty;

    verifiedReturnItems.push({
      orderItemId,
      quantity: returnQty,
    });
  }

  // 3. Create ReturnRequest and ReturnItems inside an atomic transaction
  return await prisma.$transaction(async (tx) => {
    const returnRequest = await tx.returnRequest.create({
      data: {
        orderId: parsedOrderId,
        userId,
        reason: reason.trim(),
        customerNotes: customerNotes ? customerNotes.trim() : null,
        status: 'REQUESTED',
        refundStatus: 'PENDING',
        refundAmount: calculatedRefundTotal,
        items: {
          create: verifiedReturnItems.map((v) => ({
            orderItemId: v.orderItemId,
            quantity: v.quantity,
            restocked: false,
          })),
        },
      },
      include: {
        items: {
          include: {
            orderItem: {
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
        },
      },
    });

    return returnRequest;
    },
    { maxWait: 10000, timeout: 20000 }
  );
};

/**
 * Customer: Retrieve all return requests submitted by the logged-in user
 */
export const getMyReturns = async (userId) => {
  return await prisma.returnRequest.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      order: {
        select: {
          id: true,
          status: true,
          createdAt: true,
          shippingAddress: true,
        },
      },
      items: {
        include: {
          orderItem: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  price: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

/**
 * Customer / Admin: Retrieve details of a specific return request by ID
 */
export const getReturnById = async (returnId, userId, userRole) => {
  const parsedId = parseInt(returnId, 10);
  if (isNaN(parsedId)) {
    const error = new Error('Invalid return request ID.');
    error.status = 400;
    throw error;
  }

  const returnRequest = await prisma.returnRequest.findUnique({
    where: { id: parsedId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      order: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },
      items: {
        include: {
          orderItem: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!returnRequest) {
    const error = new Error('Return request not found.');
    error.status = 404;
    throw error;
  }

  if (returnRequest.userId !== userId && userRole !== 'ADMIN') {
    const error = new Error('You do not have permission to view this return request.');
    error.status = 403;
    throw error;
  }

  return returnRequest;
};

/**
 * Administrator: Retrieve all customer return requests with status filtering & pagination
 */
export const getAllReturnsAdmin = async ({ page = 1, limit = 10, status }) => {
  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNumber - 1) * pageSize;

  const where = {};
  if (status && status !== 'ALL') {
    where.status = status;
  }

  const [returns, total] = await Promise.all([
    prisma.returnRequest.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            createdAt: true,
            shippingAddress: true,
          },
        },
        items: {
          include: {
            orderItem: {
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
        },
      },
    }),
    prisma.returnRequest.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  return {
    returns,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
    },
  };
};

/**
 * Administrator: Update return request status and optionally replenish inventory
 * Executes inside an atomic transaction to ensure zero double-restocking bugs.
 */
export const updateReturnStatusAdmin = async (
  returnId,
  { status: newStatus, adminNotes, refundStatus, restockItems }
) => {
  const parsedId = parseInt(returnId, 10);
  if (isNaN(parsedId)) {
    const error = new Error('Invalid return request ID.');
    error.status = 400;
    throw error;
  }

  const validStatuses = ['REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REFUNDED'];
  if (newStatus && !validStatuses.includes(newStatus)) {
    const error = new Error(
      `Invalid return status. Must be one of: ${validStatuses.join(', ')}`
    );
    error.status = 400;
    throw error;
  }

  return await prisma.$transaction(async (tx) => {
    const existing = await tx.returnRequest.findUnique({
      where: { id: parsedId },
      include: {
        items: {
          include: {
            orderItem: true,
          },
        },
      },
    });

    if (!existing) {
      const error = new Error('Return request not found.');
      error.status = 404;
      throw error;
    }

    const updateData = {};
    if (newStatus) updateData.status = newStatus;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes?.trim() || null;

    // Determine refund status based on return status transition
    if (newStatus === 'REFUNDED') {
      updateData.refundStatus = 'COMPLETED';
    } else if (newStatus === 'REJECTED') {
      updateData.refundStatus = 'REJECTED';
    } else if (refundStatus) {
      updateData.refundStatus = refundStatus;
    }

    // Restock Inventory Safeguard:
    // Restock only if admin requested restock (or marked as REFUNDED)
    // AND only for items where restocked === false
    const shouldRestock =
      restockItems === true || (newStatus === 'REFUNDED' && restockItems !== false);

    if (shouldRestock) {
      for (const item of existing.items) {
        if (!item.restocked) {
          // Increment stock safely in database
          await tx.product.update({
            where: { id: item.orderItem.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });

          // Mark item as restocked to prevent duplicate increments in future status updates
          await tx.returnItem.update({
            where: { id: item.id },
            data: { restocked: true },
          });
        }
      }
    }

    const updated = await tx.returnRequest.update({
      where: { id: parsedId },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        order: true,
        items: {
          include: {
            orderItem: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    return updated;
    },
    { maxWait: 10000, timeout: 20000 }
  );
};
