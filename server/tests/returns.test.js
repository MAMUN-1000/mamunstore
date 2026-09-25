import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/db.js';
import { createTestUser, cleanupTestUser } from './helpers/testUtils.js';

describe('Returns & Refunds Integration Tests', () => {
  let customer = null;
  let otherCustomer = null;
  let admin = null;
  let testProduct = null;
  let deliveredOrder = null;
  let pendingOrder = null;
  let createdReturnId = null;

  beforeAll(async () => {
    customer = await createTestUser({ role: 'CUSTOMER', emailPrefix: 'ret_cust' });
    otherCustomer = await createTestUser({ role: 'CUSTOMER', emailPrefix: 'ret_other' });
    admin = await createTestUser({ role: 'ADMIN', emailPrefix: 'ret_admin' });

    const category = await prisma.category.findFirst();

    // Create an isolated test product
    testProduct = await prisma.product.create({
      data: {
        name: `Return Test Product ${Date.now()}`,
        slug: `return-test-prod-${Date.now()}`,
        description: 'For testing partial returns and inventory restocking',
        price: 80.0,
        stock: 10,
        imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600',
        categoryId: category.id,
      },
    });

    // Create a DELIVERED order for customer
    deliveredOrder = await prisma.order.create({
      data: {
        userId: customer.user.id,
        status: 'DELIVERED',
        totalAmount: 240.0,
        shippingAddress: '123 Delivery Road, Dhaka',
        items: {
          create: [
            {
              productId: testProduct.id,
              quantity: 3,
              unitPrice: 80.0,
            },
          ],
        },
      },
      include: {
        items: true,
      },
    });

    // Create a PENDING order to test eligibility checks
    pendingOrder = await prisma.order.create({
      data: {
        userId: customer.user.id,
        status: 'PENDING',
        totalAmount: 80.0,
        shippingAddress: '123 Pending Road, Dhaka',
        items: {
          create: [
            {
              productId: testProduct.id,
              quantity: 1,
              unitPrice: 80.0,
            },
          ],
        },
      },
      include: {
        items: true,
      },
    });
  });

  afterAll(async () => {
    if (customer) await cleanupTestUser(customer.user.id);
    if (otherCustomer) await cleanupTestUser(otherCustomer.user.id);
    if (admin) await cleanupTestUser(admin.user.id);

    if (testProduct) {
      await prisma.product.deleteMany({ where: { id: testProduct.id } });
    }
  });

  describe('Return Eligibility & Validation Rules', () => {
    it('should reject return request if order is not in DELIVERED status', async () => {
      const res = await request(app)
        .post('/api/returns')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({
          orderId: pendingOrder.id,
          reason: 'Item defective',
          items: [{ orderItemId: pendingOrder.items[0].id, quantity: 1 }],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Only delivered orders are eligible');
    });

    it('should prevent non-owner from submitting return on another customer order (403)', async () => {
      const res = await request(app)
        .post('/api/returns')
        .set('Authorization', `Bearer ${otherCustomer.token}`)
        .send({
          orderId: deliveredOrder.id,
          reason: 'Attempting unauthorized return',
          items: [{ orderItemId: deliveredOrder.items[0].id, quantity: 1 }],
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('permission');
    });

    it('should reject return request if requested return quantity exceeds purchased quantity', async () => {
      const res = await request(app)
        .post('/api/returns')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({
          orderId: deliveredOrder.id,
          reason: 'Too many items',
          items: [{ orderItemId: deliveredOrder.items[0].id, quantity: 99 }],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('remain eligible for return');
    });
  });

  describe('Customer Return Submission & Tracking', () => {
    it('should allow customer to submit a partial return request (1 of 3 units)', async () => {
      const res = await request(app)
        .post('/api/returns')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({
          orderId: deliveredOrder.id,
          reason: 'Defective item',
          customerNotes: 'One unit has a minor tear.',
          items: [{ orderItemId: deliveredOrder.items[0].id, quantity: 1 }],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.returnRequest).toBeDefined();

      const returnReq = res.body.data.returnRequest;
      createdReturnId = returnReq.id;

      expect(returnReq.status).toBe('REQUESTED');
      expect(returnReq.items.length).toBe(1);
      expect(returnReq.items[0].quantity).toBe(1);
      expect(returnReq.items[0].restocked).toBe(false);
    });

    it('should allow customer to view their returns in /api/returns/my-returns', async () => {
      const res = await request(app)
        .get('/api/returns/my-returns')
        .set('Authorization', `Bearer ${customer.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.returns)).toBe(true);
      const found = res.body.data.returns.find((r) => r.id === createdReturnId);
      expect(found).toBeDefined();
    });

    it('should allow customer to view return details by ID', async () => {
      const res = await request(app)
        .get(`/api/returns/${createdReturnId}`)
        .set('Authorization', `Bearer ${customer.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.returnRequest.id).toBe(createdReturnId);
    });
  });

  describe('Admin Return Management & Restocking Idempotency', () => {
    it('should allow admin to update return status to APPROVED', async () => {
      const res = await request(app)
        .patch(`/api/returns/admin/${createdReturnId}/status`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          status: 'APPROVED',
          adminNotes: 'Inspection passed. Return approved.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.returnRequest.status).toBe('APPROVED');
    });

    it('should restock inventory when transitioned to REFUNDED and prevent double-restocking', async () => {
      const productBefore = await prisma.product.findUnique({
        where: { id: testProduct.id },
      });
      const stockBefore = productBefore.stock;

      // 1. Transition to REFUNDED (should increment stock by 1)
      const res1 = await request(app)
        .patch(`/api/returns/admin/${createdReturnId}/status`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          status: 'REFUNDED',
          adminNotes: 'Refund completed via original payment method.',
        });

      expect(res1.status).toBe(200);
      expect(res1.body.data.returnRequest.status).toBe('REFUNDED');
      expect(res1.body.data.returnRequest.refundStatus).toBe('COMPLETED');

      const productAfter1 = await prisma.product.findUnique({
        where: { id: testProduct.id },
      });
      expect(productAfter1.stock).toBe(stockBefore + 1);

      // 2. Transition again to verify idempotency (must NOT increment stock a second time)
      const res2 = await request(app)
        .patch(`/api/returns/admin/${createdReturnId}/status`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          status: 'REFUNDED',
          adminNotes: 'Duplicate transition call to test restock idempotency.',
        });

      expect(res2.status).toBe(200);
      const productAfter2 = await prisma.product.findUnique({
        where: { id: testProduct.id },
      });
      expect(productAfter2.stock).toBe(productAfter1.stock); // Remains identical!
    });
  });
});
