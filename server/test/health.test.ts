import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('Server Health and System Endpoints', () => {
  const app = createApp();

  it('GET /api/health should return 200 with operational health data', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('status');
    expect(res.body.data).toHaveProperty('uptime');
    expect(res.body.data).toHaveProperty('database');
    expect(res.body.data.database).toHaveProperty('status');
    expect(res.body.data).toHaveProperty('system');
  });

  it('GET /api/unknown-endpoint should return 404 structured error', async () => {
    const res = await request(app).get('/api/unknown-endpoint');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('statusCode', 404);
    expect(res.body.message).toContain('Endpoint not found');
  });
});
