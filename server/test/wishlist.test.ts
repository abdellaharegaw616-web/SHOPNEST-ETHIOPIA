import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { Wishlist, Product, User } from '../src/models';
import { connectTestDb, clearTestDb, closeTestDb } from './testDb';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';
import mongoose from 'mongoose';

describe('Wishlist API & Validation Integration Tests', () => {
  const app = createApp();

  beforeEach(async () => {
    vi.restoreAllMocks();
    await connectTestDb();
    await clearTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  const getCustomerToken = () => {
    const userId = new mongoose.Types.ObjectId();
    vi.spyOn(User, 'findById').mockResolvedValue({
      _id: userId,
      name: 'Customer User',
      email: 'customer@shopnest.et',
      role: 'customer',
    } as any);
    return {
      userId: userId.toString(),
      token: jwt.sign(
        { userId: userId.toString(), email: 'customer@shopnest.et', role: 'customer' },
        env.JWT_ACCESS_SECRET,
        { expiresIn: '1h' }
      ),
    };
  };

  it('rejects unauthenticated requests to wishlist with 401', async () => {
    const res = await request(app).get('/api/v1/wishlist');
    expect(res.status).toBe(401);
  });

  it('returns empty wishlist for new user', async () => {
    const { token } = getCustomerToken();
    vi.spyOn(Wishlist, 'findOne').mockReturnValue({
      populate: vi.fn().mockResolvedValue(null),
    } as any);
    vi.spyOn(Wishlist, 'create').mockResolvedValue({ products: [] } as any);

    const res = await request(app)
      .get('/api/v1/wishlist')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.products).toEqual([]);
  });

  it('rejects toggle with invalid payload using 400 Zod error', async () => {
    const { token } = getCustomerToken();

    const res = await request(app)
      .post('/api/v1/wishlist/toggle')
      .set('Authorization', `Bearer ${token}`)
      .send({}); // missing productId

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects toggle with non-existent product with 404', async () => {
    const { token } = getCustomerToken();
    const mockProductId = new mongoose.Types.ObjectId();

    vi.spyOn(Product, 'findById').mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    } as any);

    const res = await request(app)
      .post('/api/v1/wishlist/toggle')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: mockProductId.toString() });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('successfully toggles item into wishlist when product exists', async () => {
    const { token, userId } = getCustomerToken();
    const mockProductId = new mongoose.Types.ObjectId();

    vi.spyOn(Product, 'findById').mockReturnValue({
      select: vi.fn().mockResolvedValue({ _id: mockProductId }),
    } as any);

    const mockWishlist: any = {
      user: userId,
      products: [],
      save: vi.fn().mockResolvedValue(true),
      populate: vi.fn().mockResolvedValue({
        user: userId,
        products: [{ _id: mockProductId, title: 'Ethiopian Opal Pendant' }],
      }),
    };

    vi.spyOn(Wishlist, 'findOne').mockResolvedValue(mockWishlist as any);

    const res = await request(app)
      .post('/api/v1/wishlist/toggle')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: mockProductId.toString() });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Product added to wishlist');
  });

  it('clears wishlist on DELETE /api/v1/wishlist', async () => {
    const { token, userId } = getCustomerToken();

    const mockWishlist: any = {
      user: userId,
      products: [new mongoose.Types.ObjectId()],
      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(Wishlist, 'findOne').mockResolvedValue(mockWishlist);

    const res = await request(app)
      .delete('/api/v1/wishlist')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Wishlist cleared');
  });
});
