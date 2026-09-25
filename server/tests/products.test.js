import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/db.js';
import { createTestUser, cleanupTestUser } from './helpers/testUtils.js';

describe('Products & Catalog Integration Tests', () => {
  let adminUser = null;
  let testCategory = null;
  let createdProductId = null;

  beforeAll(async () => {
    adminUser = await createTestUser({ role: 'ADMIN', emailPrefix: 'prod_admin' });

    // Fetch an existing category from the database
    testCategory = await prisma.category.findFirst();
  });

  afterAll(async () => {
    if (createdProductId) {
      await prisma.product.deleteMany({ where: { id: createdProductId } });
    }
    if (adminUser) {
      await cleanupTestUser(adminUser.user.id);
    }
  });

  describe('GET /api/products (Public Listing & Filtering)', () => {
    it('should return paginated products list with metadata', async () => {
      const res = await request(app).get('/api/products?page=1&limit=6');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data.products)).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.pagination.page).toBe(1);
    });

    it('should filter products by search keyword', async () => {
      const res = await request(app).get('/api/products?search=shirt');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.products)).toBe(true);
    });

    it('should filter products by price range', async () => {
      const res = await request(app).get('/api/products?minPrice=5&maxPrice=500');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.products.forEach((prod) => {
        expect(prod.price).toBeGreaterThanOrEqual(5);
        expect(prod.price).toBeLessThanOrEqual(500);
      });
    });

    it('should sort products by price ascending', async () => {
      const res = await request(app).get('/api/products?sortBy=price-asc&limit=10');

      expect(res.status).toBe(200);
      const prices = res.body.data.products.map((p) => p.price);
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
      }
    });
  });

  describe('GET /api/products/:id (Single Product Details)', () => {
    it('should reject invalid non-numeric ID with 400', async () => {
      const res = await request(app).get('/api/products/invalid-id-string');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid product ID');
    });

    it('should return 404 for non-existent product ID', async () => {
      const res = await request(app).get('/api/products/9999999');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });

    it('should return product details with category and reviews for valid ID', async () => {
      const existingProduct = await prisma.product.findFirst();
      if (!existingProduct) return;

      const res = await request(app).get(`/api/products/${existingProduct.id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product).toBeDefined();
      expect(res.body.data.product.id).toBe(existingProduct.id);
      expect(res.body.data.product.category).toBeDefined();
    });
  });

  describe('Admin Product Management (POST / PUT / DELETE)', () => {
    it('should allow admin to create a new product', async () => {
      if (!testCategory) return;

      const uniqueSuffix = Date.now();
      const payload = {
        name: `Integration Test Product ${uniqueSuffix}`,
        description: 'Quality tested product created via test runner.',
        price: 149.99,
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600',
        categoryId: testCategory.id,
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product).toBeDefined();
      expect(res.body.data.product.name).toBe(payload.name);
      expect(res.body.data.product.price).toBe(payload.price);
      createdProductId = res.body.data.product.id;
    });

    it('should validate non-negative price on creation', async () => {
      if (!testCategory) return;

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({
          name: 'Negative Price Product',
          price: -10,
          stock: 5,
          categoryId: testCategory.id,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('non-negative price');
    });

    it('should allow admin to update the product details', async () => {
      if (!createdProductId) return;

      const res = await request(app)
        .put(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({
          price: 179.99,
          stock: 30,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product.price).toBe(179.99);
      expect(res.body.data.product.stock).toBe(30);
    });

    it('should allow admin to delete the test product', async () => {
      if (!createdProductId) return;

      const res = await request(app)
        .delete(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion in database
      const check = await prisma.product.findUnique({ where: { id: createdProductId } });
      expect(check).toBeNull();
      createdProductId = null; // Marked as deleted
    });
  });
});
