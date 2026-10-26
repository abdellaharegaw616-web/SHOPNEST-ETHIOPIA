import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('ShopNest Ethiopia API Endpoints Integration Tests', () => {
  const app = createApp();

  describe('Diagnostics & Documentation', () => {
    it('GET /api/health returns 200 with system & database status', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('status');
      expect(res.body.data).toHaveProperty('uptime');
      expect(res.body.data).toHaveProperty('database');
      expect(res.body.data.system).toHaveProperty('nodeVersion');
    });

    it('GET /api/docs.json returns valid OpenAPI specification', async () => {
      const res = await request(app).get('/api/docs.json');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('openapi', '3.0.0');
      expect(res.body.info.title).toContain('ShopNest Ethiopia');
      expect(res.body.paths).toHaveProperty('/v1/auth/register');
      expect(res.body.paths).toHaveProperty('/v1/orders');
    });
  });

  describe('Authentication Endpoints & Validation', () => {
    it('POST /api/v1/auth/register rejects missing fields with 400 Zod error', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('POST /api/v1/auth/register rejects non-Ethiopian phone format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Kebede Test',
          email: 'kebede@test.et',
          password: 'password123',
          phone: '+14155552671', // Invalid for Ethiopia
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(JSON.stringify(res.body.errors)).toContain('Invalid Ethiopian phone format');
    });

    it('POST /api/v1/auth/login rejects empty payload with 400', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/auth/me returns 401 Unauthorized without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Authentication required');
    });
  });

  describe('Protected Admin Routes Authorization', () => {
    it('GET /api/v1/admin/stats returns 401 Unauthorized for unauthenticated requests', async () => {
      const res = await request(app).get('/api/v1/admin/stats');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Catalog & Shopping Endpoints', () => {
    it('GET /api/v1/products returns 200 with product list and pagination metadata', async () => {
      const res = await request(app).get('/api/v1/products');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('products');
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('page');
    });

    it('GET /api/v1/categories returns 200 with category list', async () => {
      const res = await request(app).get('/api/v1/categories');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
