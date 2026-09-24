import prisma from '../config/db.js';
import { notifyAdmins } from './notification.service.js';

/**
 * Creates an order inside an atomic Prisma transaction:
 * 1. Checks current product existence & verifies stock availability
 * 2. Validates and computes authoritative coupon discount if couponCode is provided
 * 3. Decrements product stock in PostgreSQL
 * 4. Creates Order with frozen unit price snapshot & coupon details
 * 5. Creates CouponUsage and customer/admin notifications
 */
export const createOrder = async ({ userId, items, shippingAddress, couponCode }) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    const error = new Error('Your cart is empty. Please add items before checking out.');
    error.status = 400;
    throw error;
  }

  // Execute inside an atomic transaction with remote network tolerance
  const result = await prisma.$transaction(
    async (tx) => {
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

      // 2. Validate and apply coupon if provided
      let appliedCoupon = null;
      let discountAmount = 0;

      if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
        const normalizedCode = couponCode.trim().toUpperCase().replace(/\s+/g, '');
        const coupon = await tx.coupon.findUnique({
          where: { code: normalizedCode },
        });

        if (!coupon) {
          const error = new Error(`Coupon code "${normalizedCode}" is invalid.`);
          error.status = 404;
          throw error;
        }

        if (!coupon.isActive) {
          const error = new Error(`Coupon "${coupon.code}" is currently disabled.`);
          error.status = 400;
          throw error;
        }

        const now = new Date();
        if (coupon.startDate && now < new Date(coupon.startDate)) {
          const error = new Error(`Coupon "${coupon.code}" is not yet active.`);
          error.status = 400;
          throw error;
        }

        if (coupon.expiryDate && now > new Date(coupon.expiryDate)) {
          const error = new Error(`Coupon "${coupon.code}" has expired.`);
          error.status = 400;
          throw error;
        }

        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
          const error = new Error(`Coupon "${coupon.code}" has reached its maximum global usage limit.`);
          error.status = 400;
          throw error;
        }

        const userUsages = await tx.couponUsage.count({
          where: {
            couponId: coupon.id,
            userId,
          },
        });

        const perUserLimit = coupon.perUserLimit || 1;
        if (userUsages >= perUserLimit) {
          const error = new Error(
            `You have already redeemed coupon "${coupon.code}" the maximum allowed number of times (${perUserLimit}x).`
          );
          error.status = 400;
          throw error;
        }

        if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
          const error = new Error(
            `Order subtotal must be at least ৳${coupon.minOrderAmount.toFixed(
              2
            )} to use coupon "${coupon.code}".`
          );
          error.status = 400;
          throw error;
        }

        if (coupon.discountType === 'PERCENTAGE') {
          const rawDiscount = (subtotal * coupon.discountValue) / 100;
          discountAmount = coupon.maxDiscount
            ? Math.min(rawDiscount, coupon.maxDiscount)
            : rawDiscount;
        } else if (coupon.discountType === 'FIXED') {
          discountAmount = Math.min(coupon.discountValue, subtotal);
        }

        discountAmount = Math.min(discountAmount, subtotal);
        discountAmount = Math.max(0, parseFloat(discountAmount.toFixed(2)));

        appliedCoupon = coupon;

        // Increment coupon global usedCount within the transaction
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      // 3. Calculate tax, shipping, and authoritative grand total
      const discountedSubtotal = Math.max(0, subtotal - discountAmount);
      const shipping = subtotal > 100 ? 0 : 10;
      const estimatedTax = discountedSubtotal * 0.08;
      const totalAmount = discountedSubtotal + shipping + estimatedTax;

      // 4. Decrement stock for all items and check low stock threshold
      const lowStockAlerts = [];
      for (const item of verifiedItems) {
        const updatedProduct = await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updatedProduct.stock <= 3) {
          lowStockAlerts.push({
            productId: updatedProduct.id,
            name: updatedProduct.name,
            remainingStock: updatedProduct.stock,
          });
        }
      }

      // 5. Create the Order with coupon snapshots
      const paymentMethod = typeof shippingAddress === 'object' ? shippingAddress?.paymentMethod : 'card';
      const initialStatus = paymentMethod === 'cod' ? 'PENDING' : 'PAID';

      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: initialStatus,
          shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress),
          couponId: appliedCoupon ? appliedCoupon.id : null,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          discountAmount,
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
          coupon: {
            select: {
              id: true,
              code: true,
              discountType: true,
              discountValue: true,
            },
          },
        },
      });

      // 6. Record CouponUsage if coupon was applied
      if (appliedCoupon) {
        await tx.couponUsage.create({
          data: {
            couponId: appliedCoupon.id,
            userId,
            orderId: order.id,
          },
        });
      }

      // 7. Create in-app Notification for customer
      await tx.notification.create({
        data: {
          userId,
          type: 'ORDER_PLACED',
          title: 'Order Placed Successfully',
          message: `Your Order #${order.id} has been placed for ৳${totalAmount.toFixed(2)}${
            discountAmount > 0 ? ` (Coupon ${appliedCoupon.code} applied: -৳${discountAmount.toFixed(2)})` : ''
          }.`,
          link: `/orders`,
        },
      });

      return { order, lowStockAlerts };
    },
    { maxWait: 10000, timeout: 20000 }
  );

  // Dispatch asynchronous admin notifications
  try {
    await notifyAdmins({
      type: 'ORDER_PLACED',
      title: `New Order #${result.order.id} Received`,
      message: `Order #${result.order.id} placed for ৳${result.order.totalAmount.toFixed(2)}${
        result.order.couponCode ? ` with coupon ${result.order.couponCode}` : ''
      }.`,
      link: `/admin`,
    });

    for (const low of result.lowStockAlerts) {
      await notifyAdmins({
        type: 'SYSTEM',
        title: `Low Stock Warning: ${low.name}`,
        message: `Only ${low.remainingStock} unit(s) remaining for "${low.name}". Please replenish stock.`,
        link: `/admin`,
      });
    }
  } catch (err) {
    console.error('Failed to notify admins of new order:', err.message);
  }

  return result.order;
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
          returnItems: {
            include: {
              returnRequest: {
                select: {
                  id: true,
                  status: true,
                  refundStatus: true,
                  reason: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      },
      returnRequests: {
        include: {
          items: true,
        },
      },
      coupon: {
        select: {
          id: true,
          code: true,
          discountType: true,
          discountValue: true,
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
          returnItems: {
            include: {
              returnRequest: true,
            },
          },
        },
      },
      returnRequests: {
        include: {
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
      },
      coupon: {
        select: {
          id: true,
          code: true,
          discountType: true,
          discountValue: true,
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
        coupon: {
          select: {
            id: true,
            code: true,
            discountType: true,
            discountValue: true,
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

  // Create in-app notification for the customer
  try {
    await prisma.notification.create({
      data: {
        userId: updatedOrder.userId,
        type: 'ORDER_STATUS_CHANGED',
        title: `Order #${updatedOrder.id} Status Updated`,
        message: `Your Order #${updatedOrder.id} status is now "${newStatus}".`,
        link: `/orders`,
      },
    });
  } catch (err) {
    console.error('Failed to create status change notification:', err.message);
  }

  return updatedOrder;
};
