import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/db.js';
import { createTestUser, cleanupTestUser } from './helpers/testUtils.js';

describe('Coupons & Discounts Integration Tests', () => {
  let customer = null;
  let admin = null;
  let testProduct = null;
  let activeCoupon = null;
  let expiredCoupon = null;
  let inactiveCoupon = null;
  let createdCouponId = null;

  beforeAll(async () => {
    customer = await createTestUser({ role: 'CUSTOMER', emailPrefix: 'coup_cust' });
    admin = await createTestUser({ role: 'ADMIN', emailPrefix: 'coup_admin' });

    const category = await prisma.category.findFirst();

    // Create an isolated test product
    testProduct = await prisma.product.create({
      data: {
        name: `Coupon Test Product ${Date.now()}`,
        slug: `coupon-test-prod-${Date.now()}`,
        description: 'For testing coupon calculations',
        price: 100.0,
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600',
        categoryId: category.id,
      },
    });

    const timestamp = Date.now();

    // Create active 20% coupon with min order 150
    activeCoupon = await prisma.coupon.create({
      data: {
        code: `TEST20_${timestamp}`,
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderAmount: 150,
        isActive: true,
      },
    });

    // Create expired coupon
    expiredCoupon = await prisma.coupon.create({
      data: {
        code: `TESTEXP_${timestamp}`,
        discountType: 'FIXED',
        discountValue: 15,
        expiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
        isActive: true,
      },
    });

    // Create disabled coupon
    inactiveCoupon = await prisma.coupon.create({
      data: {
        code: `TESTOFF_${timestamp}`,
        discountType: 'PERCENTAGE',
        discountValue: 10,
        isActive: false,
      },
    });
  });

  afterAll(async () => {
    const couponCodes = [
      activeCoupon?.code,
      expiredCoupon?.code,
      inactiveCoupon?.code,
    ].filter(Boolean);

    if (couponCodes.length > 0) {
      await prisma.coupon.deleteMany({ where: { code: { in: couponCodes } } });
    }

    if (createdCouponId) {
      await prisma.coupon.deleteMany({ where: { id: createdCouponId } });
    }

    if (testProduct) {
      await prisma.product.deleteMany({ where: { id: testProduct.id } });
    }

    if (customer) await cleanupTestUser(customer.user.id);
    if (admin) await cleanupTestUser(admin.user.id);
  });

  describe('POST /api/coupons/validate (Validation & Discount Calculation)', () => {
    it('should reject validation if coupon code is empty', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({
          code: '',
          items: [{ productId: testProduct.id, quantity: 1 }],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('enter a coupon code');
    });

    it('should reject validation if cart is empty', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({
          code: activeCoupon.code,
          items: [],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('empty cart');
    });

    it('should return 404 for non-existent coupon code', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({
          code: 'NON_EXISTENT_COUPON_123',
          items: [{ productId: testProduct.id, quantity: 2 }],
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('invalid or does not exist');
    });

    it('should reject inactive/disabled coupon', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({
          code: inactiveCoupon.code,
          items: [{ productId: testProduct.id, quantity: 2 }],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('disabled');
    });

    it('should reject expired coupon', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({
          code: expiredCoupon.code,
          items: [{ productId: testProduct.id, quantity: 2 }],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('expired');
    });

    it('should reject if order subtotal is below minimum order amount requirement', async () => {
      // testProduct price is 100; minOrderAmount is 150
      const res = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({
          code: activeCoupon.code,
          items: [{ productId: testProduct.id, quantity: 1 }], // 1 * 100 = 100 < 150
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('at least');
    });

    it('should successfully validate active coupon and calculate percentage discount correctly', async () => {
      // testProduct price is 100; quantity 2 -> subtotal = 200 >= 150 minOrderAmount
      // 20% of 200 = 40
      const res = await request(app)
        .post('/api/coupons/validate')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({
          code: activeCoupon.code,
          items: [{ productId: testProduct.id, quantity: 2 }],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.originalSubtotal).toBe(200);
      expect(res.body.data.discountAmount).toBe(40);
      expect(res.body.data.discountedSubtotal).toBe(160);
    });
  });

  describe('Admin Coupon Management (CRUD)', () => {
    it('should allow admin to create a new fixed-discount coupon', async () => {
      const code = `ADMFIX_${Date.now()}`;
      const res = await request(app)
        .post('/api/coupons/admin')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          code,
          discountType: 'FIXED',
          discountValue: 25,
          minOrderAmount: 50,
          isActive: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.coupon).toBeDefined();
      expect(res.body.data.coupon.code).toBe(code);
      createdCouponId = res.body.data.coupon.id;
    });

    it('should allow admin to toggle active status of a coupon', async () => {
      if (!createdCouponId) return;

      const res = await request(app)
        .patch(`/api/coupons/admin/${createdCouponId}/toggle`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.coupon.isActive).toBe(false);
    });

    it('should allow admin to delete the test coupon', async () => {
      if (!createdCouponId) return;

      const res = await request(app)
        .delete(`/api/coupons/admin/${createdCouponId}`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      createdCouponId = null;
    });
  });
});
