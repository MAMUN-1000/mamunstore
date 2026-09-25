import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/db.js';
import { createTestUser, cleanupTestUser } from './helpers/testUtils.js';

describe('Notifications Integration Tests', () => {
  let customer = null;
  let notif1 = null;
  let notif2 = null;

  beforeAll(async () => {
    customer = await createTestUser({ role: 'CUSTOMER', emailPrefix: 'notif_cust' });

    // Seed 2 unread notifications for this customer
    notif1 = await prisma.notification.create({
      data: {
        userId: customer.user.id,
        type: 'ORDER_PLACED',
        title: 'Order #101 Placed',
        message: 'Your order has been confirmed successfully.',
        isRead: false,
      },
    });

    notif2 = await prisma.notification.create({
      data: {
        userId: customer.user.id,
        type: 'RETURN_UPDATED',
        title: 'Return Approved',
        message: 'Your return request has been approved by admin.',
        isRead: false,
      },
    });
  });

  afterAll(async () => {
    if (customer) await cleanupTestUser(customer.user.id);
  });

  describe('Unauthenticated Protection', () => {
    it('GET /api/notifications - should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/notifications');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Notification Management (List, Mark Read, Mark All Read)', () => {
    it('should retrieve customer notifications with correct unread count', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${customer.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notifications).toBeDefined();
      expect(res.body.data.unreadCount).toBe(2);
      expect(res.body.data.notifications.length).toBeGreaterThanOrEqual(2);
    });

    it('should mark a single notification as read', async () => {
      const res = await request(app)
        .patch(`/api/notifications/${notif1.id}/read`)
        .set('Authorization', `Bearer ${customer.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notification.isRead).toBe(true);

      // Verify unread count decreases to 1
      const check = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${customer.token}`);

      expect(check.body.data.unreadCount).toBe(1);
    });

    it('should mark all remaining notifications as read', async () => {
      const res = await request(app)
        .patch('/api/notifications/read-all')
        .set('Authorization', `Bearer ${customer.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify unread count becomes 0
      const check = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${customer.token}`);

      expect(check.body.data.unreadCount).toBe(0);
    });
  });
});
