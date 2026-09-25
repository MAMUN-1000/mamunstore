import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { createTestUser, cleanupTestUser } from './helpers/testUtils.js';

describe('Server-Side Authorization & Role-Based Access Control', () => {
  let customerUser = null;
  let adminUser = null;

  beforeAll(async () => {
    customerUser = await createTestUser({ role: 'CUSTOMER', emailPrefix: 'authz_cust' });
    adminUser = await createTestUser({ role: 'ADMIN', emailPrefix: 'authz_admin' });
  });

  afterAll(async () => {
    if (customerUser) await cleanupTestUser(customerUser.user.id);
    if (adminUser) await cleanupTestUser(adminUser.user.id);
  });

  describe('Unauthenticated Requests (Missing Token)', () => {
    it('GET /api/admin/metrics - should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/admin/metrics');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Authentication required');
    });

    it('GET /api/orders/admin/all - should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/orders/admin/all');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/returns/admin/all - should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/returns/admin/all');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/coupons/admin/all - should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/coupons/admin/all');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/products - should reject unauthenticated product creation with 401', async () => {
      const res = await request(app).post('/api/products').send({ name: 'Hacked Product' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Customer Role Boundary (403 Forbidden)', () => {
    it('GET /api/admin/metrics - customer must be blocked with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${customerUser.token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Administrator privileges required');
    });

    it('GET /api/orders/admin/all - customer must be blocked with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/orders/admin/all')
        .set('Authorization', `Bearer ${customerUser.token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/returns/admin/all - customer must be blocked with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/returns/admin/all')
        .set('Authorization', `Bearer ${customerUser.token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/coupons/admin/all - customer must be blocked with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/coupons/admin/all')
        .set('Authorization', `Bearer ${customerUser.token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/products - customer cannot create products (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${customerUser.token}`)
        .send({
          name: 'Unauthorized Product',
          price: 99.99,
          stock: 10,
          categoryId: 1,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/admin-check - customer fails admin check with 403', async () => {
      const res = await request(app)
        .get('/api/auth/admin-check')
        .set('Authorization', `Bearer ${customerUser.token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('Admin Role Authorization Success', () => {
    it('GET /api/admin/metrics - admin should successfully retrieve platform metrics', async () => {
      const res = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.kpis).toBeDefined();
      expect(typeof res.body.data.kpis.totalRevenue).toBe('number');
    });

    it('GET /api/auth/admin-check - admin passes check with 200 OK', async () => {
      const res = await request(app)
        .get('/api/auth/admin-check')
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Administrator authorization confirmed');
    });

    it('GET /api/coupons/admin/all - admin can access coupon management list', async () => {
      const res = await request(app)
        .get('/api/coupons/admin/all')
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.coupons)).toBe(true);
    });
  });
});
