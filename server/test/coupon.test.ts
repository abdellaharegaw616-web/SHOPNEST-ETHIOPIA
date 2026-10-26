import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { Coupon, User } from '../src/models';
import { connectTestDb, clearTestDb, closeTestDb } from './testDb';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';
import mongoose from 'mongoose';

describe('Coupon Validation & Management Integration Tests', () => {
  const app = createApp();
  beforeEach(async () => {
    vi.restoreAllMocks();
    await connectTestDb();
    await clearTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  const getAdminToken = () => {
    const adminId = new mongoose.Types.ObjectId();
    vi.spyOn(User, 'findById').mockResolvedValue({
      _id: adminId,
      name: 'Admin User',
      email: 'admin@shopnest.et',
      role: 'admin',
    } as any);
    return jwt.sign(
      { userId: adminId.toString(), email: 'admin@shopnest.et', role: 'admin' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '1h' }
    );
  };

  const getCustomerToken = () => {
    const customerId = new mongoose.Types.ObjectId();
    vi.spyOn(User, 'findById').mockResolvedValue({
      _id: customerId,
      name: 'Customer User',
      email: 'customer@shopnest.et',
      role: 'customer',
    } as any);
    return jwt.sign(
      { userId: customerId.toString(), email: 'customer@shopnest.et', role: 'customer' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '1h' }
    );
  };

  describe('POST /api/v1/coupons/validate (Public / Customer)', () => {
    it('validates a percentage coupon and calculates discount accurately', async () => {
      const mockCoupon = {
        code: 'HABESHA15',
        discountType: 'percentage',
        discountValue: 15,
        minOrderValue: 500,
        maxDiscount: 300,
        expiryDate: new Date(Date.now() + 86400000), // tomorrow
        usageLimit: 100,
        usedCount: 0,
        isActive: true,
      };

      vi.spyOn(Coupon, 'findOne').mockResolvedValue(mockCoupon as any);

      const res = await request(app)
        .post('/api/v1/coupons/validate')
        .send({
          code: 'habesha15',
          subtotal: 1000,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('HABESHA15');
      // 15% of 1000 = 150 ETB
      expect(res.body.data.discountAmount).toBe(150);
      expect(res.body.data.newTotal).toBe(850);
    });

    it('caps percentage discount at maxDiscount limit', async () => {
      const mockCoupon = {
        code: 'MEGA50',
        discountType: 'percentage',
        discountValue: 50,
        minOrderValue: 1000,
        maxDiscount: 500, // Capped at 500
        expiryDate: new Date(Date.now() + 86400000),
        usageLimit: 100,
        usedCount: 0,
        isActive: true,
      };

      vi.spyOn(Coupon, 'findOne').mockResolvedValue(mockCoupon as any);

      const res = await request(app)
        .post('/api/v1/coupons/validate')
        .send({
          code: 'MEGA50',
          subtotal: 2000,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.discountAmount).toBe(500); // Not 1000
      expect(res.body.data.newTotal).toBe(1500);
    });

    it('rejects coupon when subtotal does not meet minOrderValue with 400', async () => {
      const mockCoupon = {
        code: 'HIGHMIN',
        discountType: 'fixed_amount',
        discountValue: 100,
        minOrderValue: 2500,
        expiryDate: new Date(Date.now() + 86400000),
        usageLimit: 100,
        usedCount: 0,
        isActive: true,
      };

      vi.spyOn(Coupon, 'findOne').mockResolvedValue(mockCoupon as any);

      const res = await request(app)
        .post('/api/v1/coupons/validate')
        .send({
          code: 'HIGHMIN',
          subtotal: 1200,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('minimum order value of ETB 2,500');
    });

    it('rejects expired coupon with 400', async () => {
      const mockCoupon = {
        code: 'EXPIRED10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 0,
        expiryDate: new Date(Date.now() - 86400000), // yesterday
        usageLimit: 100,
        usedCount: 0,
        isActive: true,
      };

      vi.spyOn(Coupon, 'findOne').mockResolvedValue(mockCoupon as any);

      const res = await request(app)
        .post('/api/v1/coupons/validate')
        .send({
          code: 'EXPIRED10',
          subtotal: 1000,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('expired');
    });

    it('rejects invalid or non-existent coupon code with 404', async () => {
      vi.spyOn(Coupon, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/coupons/validate')
        .send({
          code: 'DOESNOTEXIST',
          subtotal: 1000,
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('rejects invalid request payload with 400 Zod error', async () => {
      const res = await request(app)
        .post('/api/v1/coupons/validate')
        .send({
          subtotal: -50, // invalid subtotal and missing code
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Admin Coupon Endpoints (Protected)', () => {
    it('allows admin to list all coupons', async () => {
      const adminToken = getAdminToken();
      vi.spyOn(Coupon, 'find').mockReturnValue({
        sort: vi.fn().mockResolvedValue([
          { code: 'WELCOME10', discountValue: 10, isActive: true },
        ]),
      } as any);

      const res = await request(app)
        .get('/api/v1/coupons')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('denies access to non-admin users with 403', async () => {
      const customerToken = getCustomerToken();

      const res = await request(app)
        .get('/api/v1/coupons')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('creates new coupon with admin token', async () => {
      const adminToken = getAdminToken();
      vi.spyOn(Coupon, 'findOne').mockResolvedValue(null);
      vi.spyOn(Coupon, 'create').mockResolvedValue({
        code: 'NEWYEAR2026',
        discountType: 'percentage',
        discountValue: 20,
        minOrderValue: 1000,
        isActive: true,
      } as any);

      const res = await request(app)
        .post('/api/v1/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'NEWYEAR2026',
          discountType: 'percentage',
          discountValue: 20,
          minOrderValue: 1000,
          expiryDate: new Date(Date.now() + 864000000).toISOString(),
          usageLimit: 200,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('NEWYEAR2026');
    });
  });
});
