import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { Review, Product, User, Order } from '../src/models';
import { connectTestDb, clearTestDb, closeTestDb } from './testDb';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';
import mongoose from 'mongoose';

describe('Verified Photo Reviews API & Moderation Integration Tests', () => {
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
      name: 'Abebe Kebede',
      email: 'abebe@shopnest.et',
      role: 'customer',
    } as any);
    return {
      userId: userId.toString(),
      token: jwt.sign(
        { userId: userId.toString(), email: 'abebe@shopnest.et', role: 'customer' },
        env.JWT_ACCESS_SECRET,
        { expiresIn: '1h' }
      ),
    };
  };

  const getAdminToken = () => {
    const userId = new mongoose.Types.ObjectId();
    vi.spyOn(User, 'findById').mockResolvedValue({
      _id: userId,
      name: 'Abdellah Admin',
      email: 'admin@shopnest.et',
      role: 'admin',
    } as any);
    return {
      userId: userId.toString(),
      token: jwt.sign(
        { userId: userId.toString(), email: 'admin@shopnest.et', role: 'admin' },
        env.JWT_ACCESS_SECRET,
        { expiresIn: '1h' }
      ),
    };
  };

  it('rejects review creation when unauthenticated with 401', async () => {
    const res = await request(app).post('/api/v1/reviews').send({
      productId: new mongoose.Types.ObjectId().toString(),
      rating: 5,
      comment: 'Excellent Ethiopian coffee!',
    });
    expect(res.status).toBe(401);
  });

  it('returns eligibility status false when customer has not purchased product', async () => {
    const { token, userId } = getCustomerToken();
    const productId = new mongoose.Types.ObjectId().toString();

    vi.spyOn(Review, 'findOne').mockResolvedValue(null);
    vi.spyOn(Order, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/v1/reviews/eligibility/${productId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.canReview).toBe(false);
    expect(res.body.data.hasPurchased).toBe(false);
  });

  it('rejects review submission when customer has not purchased product with 403', async () => {
    const { token } = getCustomerToken();
    const productId = new mongoose.Types.ObjectId().toString();

    vi.spyOn(Review, 'findOne').mockResolvedValue(null);
    vi.spyOn(Order, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId,
        rating: 5,
        title: 'Authentic Yirgacheffe Coffee',
        comment: 'Freshly roasted beans with exquisite floral aroma.',
        images: ['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...'],
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('verified purchase');
  });

  it('accepts review submission with photos when customer has a verified purchase order', async () => {
    const { token, userId } = getCustomerToken();
    const productId = new mongoose.Types.ObjectId();
    const dummyReviewId = new mongoose.Types.ObjectId();

    vi.spyOn(Review, 'findOne').mockResolvedValue(null);
    vi.spyOn(Order, 'findOne').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      user: userId,
      orderStatus: 'delivered',
      paymentStatus: 'completed',
      items: [{ product: productId, title: 'Yirgacheffe Coffee', quantity: 1, price: 650 }],
    } as any);

    const createdReview = {
      _id: dummyReviewId,
      id: dummyReviewId.toString(),
      product: productId,
      user: userId,
      rating: 5,
      title: 'Amazing Habesha Kemis',
      comment: 'Top quality embroidery, delivered very fast to Bole!',
      images: ['https://example.com/photo1.jpg'],
      isVerifiedPurchase: true,
      status: 'approved',
    };

    vi.spyOn(Review, 'create').mockResolvedValue(createdReview as any);
    vi.spyOn(Review, 'find').mockReturnValue({
      populate: vi.fn().mockReturnValue({
        sort: vi.fn().mockResolvedValue([createdReview]),
      }),
    } as any);
    vi.spyOn(Product, 'findByIdAndUpdate').mockResolvedValue({} as any);

    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: productId.toString(),
        rating: 5,
        title: 'Amazing Habesha Kemis',
        comment: 'Top quality embroidery, delivered very fast to Bole!',
        images: ['https://example.com/photo1.jpg'],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isVerifiedPurchase).toBe(true);
    expect(res.body.data.rating).toBe(5);
  });

  it('allows author to update their own review', async () => {
    const { token, userId } = getCustomerToken();
    const reviewId = new mongoose.Types.ObjectId().toString();
    const productId = new mongoose.Types.ObjectId();

    const mockReviewDoc = {
      _id: reviewId,
      user: { toString: () => userId },
      product: productId,
      rating: 4,
      title: 'Good product',
      comment: 'Nice quality overall.',
      images: [],
      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(Review, 'findById').mockResolvedValue(mockReviewDoc as any);
    vi.spyOn(Review, 'find').mockResolvedValue([mockReviewDoc] as any);
    vi.spyOn(Product, 'findByIdAndUpdate').mockResolvedValue({} as any);

    const res = await request(app)
      .patch(`/api/v1/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        rating: 5,
        title: 'Updated: Outstanding product!',
        comment: 'After wearing it for a week, it is even better than expected!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockReviewDoc.rating).toBe(5);
    expect(mockReviewDoc.title).toBe('Updated: Outstanding product!');
  });

  it('allows admin to moderate a review (approve/reject)', async () => {
    const { token: adminToken } = getAdminToken();
    const reviewId = new mongoose.Types.ObjectId().toString();
    const productId = new mongoose.Types.ObjectId();

    const mockReviewDoc = {
      _id: reviewId,
      status: 'pending',
      product: productId,
      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(Review, 'findById').mockResolvedValue(mockReviewDoc as any);
    vi.spyOn(Review, 'find').mockResolvedValue([mockReviewDoc] as any);
    vi.spyOn(Product, 'findByIdAndUpdate').mockResolvedValue({} as any);

    const res = await request(app)
      .patch(`/api/v1/reviews/${reviewId}/moderate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'approved',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockReviewDoc.status).toBe('approved');
  });

  it('denies non-admin from moderating reviews with 403', async () => {
    const { token: customerToken } = getCustomerToken();
    const reviewId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .patch(`/api/v1/reviews/${reviewId}/moderate`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        status: 'approved',
      });

    expect(res.status).toBe(403);
  });
});
