import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/db.js';
import { createTestUser, cleanupTestUser } from './helpers/testUtils.js';

describe('Reviews & Ratings Integration Tests', () => {
  let buyer = null;
  let nonBuyer = null;
  let admin = null;
  let testProduct = null;
  let createdReviewId = null;

  beforeAll(async () => {
    buyer = await createTestUser({ role: 'CUSTOMER', emailPrefix: 'rev_buyer' });
    nonBuyer = await createTestUser({ role: 'CUSTOMER', emailPrefix: 'rev_nonbuyer' });
    admin = await createTestUser({ role: 'ADMIN', emailPrefix: 'rev_admin' });

    const category = await prisma.category.findFirst();

    // Create an isolated test product
    testProduct = await prisma.product.create({
      data: {
        name: `Review Test Product ${Date.now()}`,
        slug: `review-test-prod-${Date.now()}`,
        description: 'For testing verified buyer reviews',
        price: 45.0,
        stock: 20,
        imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600',
        categoryId: category.id,
      },
    });

    // Create a PAID order for buyer containing the test product
    await prisma.order.create({
      data: {
        userId: buyer.user.id,
        status: 'PAID',
        totalAmount: 45.0,
        shippingAddress: '123 Verified Road, Dhaka',
        items: {
          create: [
            {
              productId: testProduct.id,
              quantity: 1,
              unitPrice: 45.0,
            },
          ],
        },
      },
    });
  });

  afterAll(async () => {
    if (buyer) await cleanupTestUser(buyer.user.id);
    if (nonBuyer) await cleanupTestUser(nonBuyer.user.id);
    if (admin) await cleanupTestUser(admin.user.id);

    if (testProduct) {
      await prisma.product.deleteMany({ where: { id: testProduct.id } });
    }
  });

  describe('GET /api/products/:productId/reviews (Public Fetch)', () => {
    it('should return reviews and aggregated rating stats', async () => {
      const res = await request(app).get(`/api/products/${testProduct.id}/reviews`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.reviews)).toBe(true);
      expect(res.body.data.stats).toBeDefined();
      expect(typeof res.body.data.stats.totalReviews).toBe('number');
    });
  });

  describe('Verified Buyer Eligibility Check', () => {
    it('should report canReview: true for verified purchaser', async () => {
      const res = await request(app)
        .get(`/api/products/${testProduct.id}/reviews/eligibility`)
        .set('Authorization', `Bearer ${buyer.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hasPurchased).toBe(true);
      expect(res.body.data.canReview).toBe(true);
    });

    it('should report canReview: false for customer without purchase', async () => {
      const res = await request(app)
        .get(`/api/products/${testProduct.id}/reviews/eligibility`)
        .set('Authorization', `Bearer ${nonBuyer.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hasPurchased).toBe(false);
      expect(res.body.data.canReview).toBe(false);
    });
  });

  describe('POST /api/products/:productId/reviews (Submission & Rules)', () => {
    it('should reject review submission from non-purchaser with 403 Forbidden', async () => {
      const res = await request(app)
        .post(`/api/products/${testProduct.id}/reviews`)
        .set('Authorization', `Bearer ${nonBuyer.token}`)
        .send({
          rating: 5,
          comment: 'Fake review without buying!',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Verified Purchase Required');
    });

    it('should reject review with out-of-range rating (e.g. 7 stars)', async () => {
      const res = await request(app)
        .post(`/api/products/${testProduct.id}/reviews`)
        .set('Authorization', `Bearer ${buyer.token}`)
        .send({
          rating: 7,
          comment: 'Too high rating!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('between 1 and 5');
    });

    it('should allow verified purchaser to create a 5-star review', async () => {
      const res = await request(app)
        .post(`/api/products/${testProduct.id}/reviews`)
        .set('Authorization', `Bearer ${buyer.token}`)
        .send({
          rating: 5,
          comment: 'Excellent quality and fast delivery!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.review).toBeDefined();
      expect(res.body.data.review.rating).toBe(5);
      createdReviewId = res.body.data.review.id;
    });
  });

  describe('DELETE /api/reviews/:id (Author & Admin Authorization)', () => {
    it('should prevent non-author customer from deleting the review (403 Forbidden)', async () => {
      const res = await request(app)
        .delete(`/api/reviews/${createdReviewId}`)
        .set('Authorization', `Bearer ${nonBuyer.token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('permission');
    });

    it('should allow author customer to delete their own review', async () => {
      const res = await request(app)
        .delete(`/api/reviews/${createdReviewId}`)
        .set('Authorization', `Bearer ${buyer.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await prisma.review.findUnique({ where: { id: createdReviewId } });
      expect(check).toBeNull();
      createdReviewId = null;
    });
  });
});
