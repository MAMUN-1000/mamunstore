import bcrypt from 'bcryptjs';
import prisma from '../../src/config/db.js';
import { generateToken } from '../../src/utils/token.js';

export const TEST_PREFIX = `test_${Date.now()}`;

/**
 * Creates an isolated test user directly in the database
 */
export const createTestUser = async ({
  role = 'CUSTOMER',
  emailPrefix = 'customer',
  name = 'Test User',
  password = 'password123',
} = {}) => {
  const uniqueId = Math.random().toString(36).substring(2, 8);
  const email = `${emailPrefix}_${Date.now()}_${uniqueId}@test.mamunstore.local`;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  } catch (err) {
    // Transient Neon cloud connection recovery retry
    await new Promise((resolve) => setTimeout(resolve, 1500));
    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return { user, token, rawPassword: password };
};

/**
 * Cleans up a test user and all related test records (wishlist, orders, returns, notifications, coupons)
 */
export const cleanupTestUser = async (userId) => {
  if (!userId) return;
  try {
    // 1. Delete notifications
    await prisma.notification.deleteMany({ where: { userId } });
    // 2. Delete wishlist items
    await prisma.wishlistItem.deleteMany({ where: { userId } });
    // 3. Delete reviews
    await prisma.review.deleteMany({ where: { userId } });
    // 4. Delete return requests & items
    const returnRequests = await prisma.returnRequest.findMany({
      where: { userId },
      select: { id: true },
    });
    const returnIds = returnRequests.map((r) => r.id);
    if (returnIds.length > 0) {
      await prisma.returnItem.deleteMany({
        where: { returnRequestId: { in: returnIds } },
      });
      await prisma.returnRequest.deleteMany({
        where: { id: { in: returnIds } },
      });
    }

    // 5. Delete coupon usages
    await prisma.couponUsage.deleteMany({ where: { userId } });

    // 6. Delete orders and items
    const orders = await prisma.order.findMany({
      where: { userId },
      select: { id: true },
    });
    const orderIds = orders.map((o) => o.id);
    if (orderIds.length > 0) {
      await prisma.orderItem.deleteMany({
        where: { orderId: { in: orderIds } },
      });
      await prisma.order.deleteMany({
        where: { id: { in: orderIds } },
      });
    }

    // 7. Delete the user
    await prisma.user.deleteMany({ where: { id: userId } });
  } catch (err) {
    console.warn(`[Cleanup Warning] Failed to clean user ${userId}:`, err.message);
  }
};

/**
 * Helper to fetch a seed or existing product from the database
 */
export const getExistingProduct = async () => {
  let product = await prisma.product.findFirst({
    where: { stock: { gt: 5 } },
    include: { category: true },
  });

  if (!product) {
    // Fallback: any product
    product = await prisma.product.findFirst({
      include: { category: true },
    });
  }

  return product;
};
