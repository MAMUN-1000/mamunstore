import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Health and Security Headers Integration Tests', () => {
  it('GET /api/health - should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('healthy');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /api/health/db - should verify PostgreSQL connectivity', async () => {
    const res = await request(app).get('/api/health/db');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.database).toBe('PostgreSQL');
    expect(res.body.counts).toBeDefined();
    expect(typeof res.body.counts.products).toBe('number');
  });

  it('Security Headers - Helmet should set standard protection headers', async () => {
    const res = await request(app).get('/api/health');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  it('GET /api/nonexistent-route - should return 404 structured error', async () => {
    const res = await request(app).get('/api/nonexistent-route-for-testing-404');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Route not found');
  });
});
