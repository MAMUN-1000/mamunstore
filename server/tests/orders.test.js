import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/db.js';
import { createTestUser, cleanupTestUser } from './helpers/testUtils.js';

describe('Orders & Checkout Integration Tests', () => {
  let customer = null;
  let otherCustomer = null;
  let admin = null;
  let testProduct = null;
  let createdOrderId = null;

  beforeAll(async () => {
    customer = await createTestUser({ role: 'CUSTOMER', emailPrefix: 'order_cust' });
    otherCustomer = await createTestUser({ role: 'CUSTOMER', emailPrefix: 'order_other' });
    admin = await createTestUser({ role: 'ADMIN', emailPrefix: 'order_admin' });

    // Fetch existing category
    const category = await prisma.category.findFirst();

    // Create an isolated test product specifically for order placement
    testProduct = await prisma.product.create({
      data: {
        name: `Checkout Test Item ${Date.now()}`,
        slug: `checkout-test-item-${Date.now()}`,
        description: 'Test product for verifying atomic checkout and inventory decrement',
        price: 50.0,
        stock: 20,
        imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600',
        categoryId: category.id,
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

  describe('POST /api/orders (Checkout Validation)', () => {
    it('should reject order if items array is empty', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({
          items: [],
          shippingAddress: {
            street: '123 Test St',
            city: 'Dhaka',
            postalCode: '1200',
            country: 'Bangladesh',
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('empty');
    });

    it('should reject order if shipping address is incomplete', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({
          items: [{ productId: testProduct.id, quantity: 1 }],
          shippingAddress: {
            street: '123 Test St',
            // missing city, postalCode, country
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Shipping address');
    });

    it('should reject order if quantity requested exceeds available stock', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({
          items: [{ productId: testProduct.id, quantity: 9999 }],
          shippingAddress: {
            street: '123 Test St',
            city: 'Dhaka',
            postalCode: '1200',
            country: 'Bangladesh',
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Insufficient stock');
    });

    it('should successfully place order, deduct stock, and return order snapshot', async () => {
      const initialStock = testProduct.stock;
      const orderQuantity = 2;

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({
          items: [{ productId: testProduct.id, quantity: orderQuantity }],
          shippingAddress: {
            street: 'House 42, Road 7',
            city: 'Dhaka',
            postalCode: '1212',
            country: 'Bangladesh',
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order).toBeDefined();

      const order = res.body.data.order;
      createdOrderId = order.id;

      expect(['PAID', 'PENDING']).toContain(order.status);
      expect(order.totalAmount).toBeGreaterThanOrEqual(testProduct.price * orderQuantity);
      expect(order.items.length).toBe(1);
      expect(order.items[0].unitPrice).toBe(testProduct.price);

      // Verify PostgreSQL inventory decrement
      const updatedProduct = await prisma.product.findUnique({
        where: { id: testProduct.id },
      });
      expect(updatedProduct.stock).toBe(initialStock - orderQuantity);
    });
  });

  describe('GET /api/orders/my-orders & GET /api/orders/:id', () => {
    it('should retrieve customer order history containing the placed order', async () => {
      const res = await request(app)
        .get('/api/orders/my-orders')
        .set('Authorization', `Bearer ${customer.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.orders)).toBe(true);
      const found = res.body.data.orders.find((o) => o.id === createdOrderId);
      expect(found).toBeDefined();
    });

    it('should allow customer to view their own order details by ID', async () => {
      const res = await request(app)
        .get(`/api/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${customer.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.id).toBe(createdOrderId);
    });

    it('should prevent another customer from viewing this order (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${otherCustomer.token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('permission');
    });

    it('should allow administrator to view any order details by ID', async () => {
      const res = await request(app)
        .get(`/api/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.id).toBe(createdOrderId);
    });
  });

  describe('PATCH /api/orders/admin/:id/status (Admin Workflow)', () => {
    it('should allow admin to update order status to DELIVERED', async () => {
      const res = await request(app)
        .patch(`/api/orders/admin/${createdOrderId}/status`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ status: 'DELIVERED' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.status).toBe('DELIVERED');
    });
  });
});
