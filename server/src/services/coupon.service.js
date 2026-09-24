import prisma from '../config/db.js';

/**
 * Validate a coupon code against current cart items and customer eligibility
 */
export const validateCoupon = async ({ code, items, userId }) => {
  if (!code || typeof code !== 'string' || !code.trim()) {
    const error = new Error('Please enter a coupon code.');
    error.status = 400;
    throw error;
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    const error = new Error('Cannot apply coupon to an empty cart.');
    error.status = 400;
    throw error;
  }

  const normalizedCode = code.trim().toUpperCase();

  // 1. Fetch coupon
  const coupon = await prisma.coupon.findUnique({
    where: { code: normalizedCode },
  });

  if (!coupon) {
    const error = new Error(`Coupon code "${normalizedCode}" is invalid or does not exist.`);
    error.status = 404;
    throw error;
  }

  // 2. Check active status
  if (!coupon.isActive) {
    const error = new Error(`Coupon "${coupon.code}" is currently disabled.`);
    error.status = 400;
    throw error;
  }

  const now = new Date();

  // 3. Check start and expiry dates
  if (coupon.startDate && now < new Date(coupon.startDate)) {
    const error = new Error(
      `Coupon "${coupon.code}" is not valid yet. Active starting ${new Date(
        coupon.startDate
      ).toLocaleDateString()}.`
    );
    error.status = 400;
    throw error;
  }

  if (coupon.expiryDate && now > new Date(coupon.expiryDate)) {
    const error = new Error(
      `Coupon "${coupon.code}" expired on ${new Date(coupon.expiryDate).toLocaleDateString()}.`
    );
    error.status = 400;
    throw error;
  }

  // 4. Check global usage limit
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    const error = new Error(
      `Coupon "${coupon.code}" has reached its maximum global redemption limit.`
    );
    error.status = 400;
    throw error;
  }

  // 5. Check per-customer usage limit
  if (userId) {
    const userUsageCount = await prisma.couponUsage.count({
      where: {
        couponId: coupon.id,
        userId,
      },
    });

    const perUserLimit = coupon.perUserLimit || 1;
    if (userUsageCount >= perUserLimit) {
      const error = new Error(
        `You have already used coupon "${coupon.code}" the maximum allowed number of times (${perUserLimit}x).`
      );
      error.status = 400;
      throw error;
    }
  }

  // 6. Calculate verified items subtotal authoritatively using database product prices
  let verifiedSubtotal = 0;
  for (const item of items) {
    const productId = parseInt(item.productId || item.id, 10);
    const quantity = parseInt(item.quantity, 10);

    if (isNaN(productId) || isNaN(quantity) || quantity <= 0) continue;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { price: true },
    });

    if (product) {
      verifiedSubtotal += product.price * quantity;
    }
  }

  if (verifiedSubtotal <= 0) {
    const error = new Error('No eligible products found in cart for coupon discount.');
    error.status = 400;
    throw error;
  }

  // 7. Check minimum order amount requirement
  if (coupon.minOrderAmount && verifiedSubtotal < coupon.minOrderAmount) {
    const error = new Error(
      `Order subtotal must be at least ৳${coupon.minOrderAmount.toFixed(
        2
      )} to use coupon "${coupon.code}". Current subtotal is ৳${verifiedSubtotal.toFixed(2)}.`
    );
    error.status = 400;
    throw error;
  }

  // 8. Calculate authoritative discount amount
  let discountAmount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    const rawDiscount = (verifiedSubtotal * coupon.discountValue) / 100;
    discountAmount = coupon.maxDiscount
      ? Math.min(rawDiscount, coupon.maxDiscount)
      : rawDiscount;
  } else if (coupon.discountType === 'FIXED') {
    discountAmount = Math.min(coupon.discountValue, verifiedSubtotal);
  }

  // Guard: discount cannot exceed subtotal or be negative
  discountAmount = Math.min(discountAmount, verifiedSubtotal);
  discountAmount = Math.max(0, parseFloat(discountAmount.toFixed(2)));

  const discountedSubtotal = Math.max(0, verifiedSubtotal - discountAmount);

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount,
    },
    discountAmount,
    originalSubtotal: verifiedSubtotal,
    discountedSubtotal,
  };
};

/**
 * Admin: Create a new coupon
 */
export const createCoupon = async (data) => {
  const {
    code,
    discountType = 'PERCENTAGE',
    discountValue,
    minOrderAmount,
    maxDiscount,
    startDate,
    expiryDate,
    usageLimit,
    perUserLimit = 1,
    isActive = true,
  } = data;

  if (!code || typeof code !== 'string' || !code.trim()) {
    const error = new Error('Coupon code is required.');
    error.status = 400;
    throw error;
  }

  const normalizedCode = code.trim().toUpperCase().replace(/\s+/g, '');

  const parsedValue = parseFloat(discountValue);
  if (isNaN(parsedValue) || parsedValue <= 0) {
    const error = new Error('Discount value must be a positive number.');
    error.status = 400;
    throw error;
  }

  if (discountType === 'PERCENTAGE' && parsedValue > 100) {
    const error = new Error('Percentage discount cannot exceed 100%.');
    error.status = 400;
    throw error;
  }

  const existing = await prisma.coupon.findUnique({
    where: { code: normalizedCode },
  });

  if (existing) {
    const error = new Error(`Coupon with code "${normalizedCode}" already exists.`);
    error.status = 400;
    throw error;
  }

  return await prisma.coupon.create({
    data: {
      code: normalizedCode,
      discountType,
      discountValue: parsedValue,
      minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
      startDate: startDate ? new Date(startDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
      perUserLimit: perUserLimit ? parseInt(perUserLimit, 10) : 1,
      isActive: Boolean(isActive),
    },
  });
};

/**
 * Admin: Retrieve all coupons with usage metrics
 */
export const getAllCouponsAdmin = async () => {
  return await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          usages: true,
          orders: true,
        },
      },
    },
  });
};

/**
 * Admin: Update coupon details
 */
export const updateCoupon = async (id, data) => {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    const error = new Error('Invalid coupon ID.');
    error.status = 400;
    throw error;
  }

  const existing = await prisma.coupon.findUnique({
    where: { id: parsedId },
  });

  if (!existing) {
    const error = new Error('Coupon not found.');
    error.status = 404;
    throw error;
  }

  const updateData = {};
  if (data.code) {
    updateData.code = data.code.trim().toUpperCase().replace(/\s+/g, '');
  }
  if (data.discountType) updateData.discountType = data.discountType;
  if (data.discountValue !== undefined) {
    const val = parseFloat(data.discountValue);
    if (isNaN(val) || val <= 0) throw new Error('Discount value must be positive.');
    if (data.discountType === 'PERCENTAGE' && val > 100)
      throw new Error('Percentage discount cannot exceed 100%.');
    updateData.discountValue = val;
  }
  if (data.minOrderAmount !== undefined) {
    updateData.minOrderAmount = data.minOrderAmount ? parseFloat(data.minOrderAmount) : null;
  }
  if (data.maxDiscount !== undefined) {
    updateData.maxDiscount = data.maxDiscount ? parseFloat(data.maxDiscount) : null;
  }
  if (data.startDate !== undefined) {
    updateData.startDate = data.startDate ? new Date(data.startDate) : null;
  }
  if (data.expiryDate !== undefined) {
    updateData.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
  }
  if (data.usageLimit !== undefined) {
    updateData.usageLimit = data.usageLimit ? parseInt(data.usageLimit, 10) : null;
  }
  if (data.perUserLimit !== undefined) {
    updateData.perUserLimit = data.perUserLimit ? parseInt(data.perUserLimit, 10) : 1;
  }
  if (data.isActive !== undefined) {
    updateData.isActive = Boolean(data.isActive);
  }

  return await prisma.coupon.update({
    where: { id: parsedId },
    data: updateData,
  });
};

/**
 * Admin: Toggle active state of a coupon
 */
export const toggleCouponActive = async (id) => {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    const error = new Error('Invalid coupon ID.');
    error.status = 400;
    throw error;
  }

  const existing = await prisma.coupon.findUnique({
    where: { id: parsedId },
  });

  if (!existing) {
    const error = new Error('Coupon not found.');
    error.status = 404;
    throw error;
  }

  return await prisma.coupon.update({
    where: { id: parsedId },
    data: { isActive: !existing.isActive },
  });
};

/**
 * Admin: Safely delete coupon or archive if historical orders exist
 */
export const deleteCoupon = async (id) => {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    const error = new Error('Invalid coupon ID.');
    error.status = 400;
    throw error;
  }

  const existing = await prisma.coupon.findUnique({
    where: { id: parsedId },
    include: {
      _count: {
        select: { orders: true, usages: true },
      },
    },
  });

  if (!existing) {
    const error = new Error('Coupon not found.');
    error.status = 404;
    throw error;
  }

  // If coupon was already used by past orders, deactivate rather than hard deleting to preserve audit integrity
  if (existing._count.orders > 0 || existing._count.usages > 0) {
    await prisma.coupon.update({
      where: { id: parsedId },
      data: { isActive: false },
    });
    return {
      deleted: false,
      archived: true,
      message: `Coupon "${existing.code}" has historical order usages and was deactivated instead of deleted.`,
    };
  }

  await prisma.coupon.delete({
    where: { id: parsedId },
  });

  return {
    deleted: true,
    archived: false,
    message: `Coupon "${existing.code}" deleted successfully.`,
  };
};
