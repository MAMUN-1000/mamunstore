import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/db.js';
import { createTestUser, cleanupTestUser } from './helpers/testUtils.js';

describe('Wishlist Integration Tests', () => {
  let customer = null;
  let testProduct = null;

  beforeAll(async () => {
    customer = await createTestUser({ role: 'CUSTOMER', emailPrefix: 'wish_cust' });

    const category = await prisma.category.findFirst();

    // Create an isolated test product
    testProduct = await prisma.product.create({
      data: {
        name: `Wishlist Test Product ${Date.now()}`,
        slug: `wishlist-test-prod-${Date.now()}`,
        description: 'Testing wishlist operations',
        price: 35.0,
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600',
        categoryId: category.id,
      },
    });
  });

  afterAll(async () => {
    if (customer) await cleanupTestUser(customer.user.id);
    if (testProduct) {
      await prisma.product.deleteMany({ where: { id: testProduct.id } });
    }
  });

  describe('Unauthenticated Wishlist Protection', () => {
    it('GET /api/wishlist - should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/wishlist');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Wishlist Operations (Add, Check, List, Remove)', () => {
    it('should initially return an empty wishlist for new customer', async () => {
      const res = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${customer.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(0);
      expect(res.body.data.items).toEqual([]);
    });

    it('should reject adding invalid non-numeric product ID', async () => {
      const res = await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ productId: 'invalid-id' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid product ID');
    });

    it('should reject adding non-existent product ID with 404', async () => {
      const res = await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ productId: 9999999 });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });

    it('should successfully add a product to the wishlist', async () => {
      const res = await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({ productId: testProduct.id });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.item).toBeDefined();
      expect(res.body.data.item.productId).toBe(testProduct.id);
    });

    it('should check status and return inWishlist: true', async () => {
      const res = await request(app)
        .get(`/api/wishlist/check/${testProduct.id}`)
        .set('Authorization', `Bearer ${customer.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.inWishlist).toBe(true);
    });

    it('should list the product in the customer wishlist', async () => {
      const res = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${customer.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(1);
      expect(res.body.data.items[0].productId).toBe(testProduct.id);
      expect(res.body.data.items[0].product.name).toBe(testProduct.name);
    });

    it('should remove the product from wishlist', async () => {
      const res = await request(app)
        .delete(`/api/wishlist/${testProduct.id}`)
        .set('Authorization', `Bearer ${customer.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.removed).toBe(true);
    });

    it('should check status after removal and return inWishlist: false', async () => {
      const res = await request(app)
        .get(`/api/wishlist/check/${testProduct.id}`)
        .set('Authorization', `Bearer ${customer.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.inWishlist).toBe(false);
    });
  });
});
