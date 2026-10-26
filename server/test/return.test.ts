import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { ReturnRequest, Order, User } from '../src/models';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';
import mongoose from 'mongoose';

describe('Returns & Refunds Workflow Integration Tests', () => {
  const app = createApp();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const getCustomerToken = () => {
    const userId = new mongoose.Types.ObjectId();
    vi.spyOn(User, 'findById').mockImplementation(async (id: any) => {
      const actualId = id ? id.toString() : userId.toString();
      return {
        _id: new mongoose.Types.ObjectId(actualId),
        id: actualId,
        name: 'Selamawit Tadesse',
        email: 'selam@shopnest.et',
        phone: '0912345678',
        role: 'customer',
      } as any;
    });
    return {
      userId: userId.toString(),
      token: jwt.sign(
        { userId: userId.toString(), email: 'selam@shopnest.et', role: 'customer' },
        env.JWT_ACCESS_SECRET,
        { expiresIn: '1h' }
      ),
    };
  };

  const getAdminToken = () => {
    const userId = new mongoose.Types.ObjectId();
    vi.spyOn(User, 'findById').mockImplementation(async (id: any) => {
      const actualId = id ? id.toString() : userId.toString();
      return {
        _id: new mongoose.Types.ObjectId(actualId),
        id: actualId,
        name: 'Abdellah Admin',
        email: 'admin@shopnest.et',
        phone: '0979567153',
        role: 'admin',
      } as any;
    });
    return {
      userId: userId.toString(),
      token: jwt.sign(
        { userId: userId.toString(), email: 'admin@shopnest.et', role: 'admin' },
        env.JWT_ACCESS_SECRET,
        { expiresIn: '1h' }
      ),
    };
  };

  const getMockOrder = (userId: string, orderStatus = 'delivered', totalAmount = 1850) => {
    const orderId = new mongoose.Types.ObjectId();
    const productId = new mongoose.Types.ObjectId();
    return {
      _id: orderId,
      orderNumber: 'SNE-2026-88771',
      user: { toString: () => userId },
      customerName: 'Selamawit Tadesse',
      customerPhone: '0912345678',
      items: [
        {
          product: productId,
          title: 'Authentic Yirgacheffe Coffee',
          price: 850,
          quantity: 2,
          sku: 'COF-YIRG-001',
          subtotal: 1700,
        },
      ],
      shippingAddress: {
        fullName: 'Selamawit Tadesse',
        phone: '0912345678',
        city: 'Addis Ababa',
        subCity: 'Bole',
      },
      paymentMethod: 'telebirr',
      paymentStatus: 'completed',
      subtotal: 1700,
      deliveryFee: 150,
      discountAmount: 0,
      totalAmount,
      orderStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
      save: vi.fn().mockResolvedValue(true),
    };
  };

  describe('Customer Return Requests (POST /api/v1/returns)', () => {
    it('rejects unauthenticated requests with 401', async () => {
      const res = await request(app).post('/api/v1/returns').send({
        orderId: new mongoose.Types.ObjectId().toString(),
        reason: 'damaged_item',
      });
      expect(res.status).toBe(401);
    });

    it('rejects return request for an order that is not delivered with 400', async () => {
      const { token, userId } = getCustomerToken();
      const mockOrder = getMockOrder(userId, 'shipped');
      vi.spyOn(Order, 'findById').mockResolvedValue(mockOrder as any);

      const res = await request(app)
        .post('/api/v1/returns')
        .set('Authorization', `Bearer ${token}`)
        .send({
          orderId: mockOrder._id.toString(),
          reason: 'damaged_item',
          customerNote: 'Package arrived torn',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('delivered orders');
    });

    it('rejects return request for an order belonging to another customer with 403', async () => {
      const { token } = getCustomerToken();
      const anotherUserId = new mongoose.Types.ObjectId().toString();
      const mockOrder = getMockOrder(anotherUserId, 'delivered');
      vi.spyOn(Order, 'findById').mockResolvedValue(mockOrder as any);

      const res = await request(app)
        .post('/api/v1/returns')
        .set('Authorization', `Bearer ${token}`)
        .send({
          orderId: mockOrder._id.toString(),
          reason: 'wrong_item',
        });

      expect(res.status).toBe(403);
    });

    it('accepts return request with photos for a verified delivered order', async () => {
      const { token, userId } = getCustomerToken();
      const mockOrder = getMockOrder(userId, 'delivered');
      vi.spyOn(Order, 'findById').mockResolvedValue(mockOrder as any);
      vi.spyOn(ReturnRequest, 'findOne').mockResolvedValue(null);

      const returnDoc = {
        _id: new mongoose.Types.ObjectId(),
        order: mockOrder._id,
        orderNumber: mockOrder.orderNumber,
        user: new mongoose.Types.ObjectId(userId),
        items: [
          {
            product: mockOrder.items[0].product,
            title: mockOrder.items[0].title,
            quantity: 2,
            unitPrice: 850,
          },
        ],
        reason: 'damaged_item',
        customerNote: 'The seal was broken and package damaged in transit.',
        images: ['https://images.shopnest.et/returns/damage1.webp'],
        status: 'pending',
        processedAt: null,
      };

      vi.spyOn(ReturnRequest, 'create').mockResolvedValue(returnDoc as any);

      const res = await request(app)
        .post('/api/v1/returns')
        .set('Authorization', `Bearer ${token}`)
        .send({
          orderId: mockOrder._id.toString(),
          reason: 'damaged_item',
          customerNote: 'The seal was broken and package damaged in transit.',
          images: ['https://images.shopnest.et/returns/damage1.webp'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.orderNumber).toBe(mockOrder.orderNumber);
      expect(res.body.data.images).toHaveLength(1);
    });

    it('rejects duplicate return request on the same order with 400', async () => {
      const { token, userId } = getCustomerToken();
      const mockOrder = getMockOrder(userId, 'delivered');
      vi.spyOn(Order, 'findById').mockResolvedValue(mockOrder as any);
      vi.spyOn(ReturnRequest, 'findOne').mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        status: 'pending',
      } as any);

      const res = await request(app)
        .post('/api/v1/returns')
        .set('Authorization', `Bearer ${token}`)
        .send({
          orderId: mockOrder._id.toString(),
          reason: 'defective',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already currently active');
    });

    it('allows customer to list their own return requests', async () => {
      const { token, userId } = getCustomerToken();
      const mockReturnDoc = {
        _id: new mongoose.Types.ObjectId(),
        orderNumber: 'SNE-2026-88771',
        reason: 'size_not_fitting',
        status: 'pending',
      };

      vi.spyOn(ReturnRequest, 'find').mockReturnValue({
        populate: vi.fn().mockReturnValue({
          sort: vi.fn().mockResolvedValue([mockReturnDoc]),
        }),
      } as any);

      const res = await request(app)
        .get('/api/v1/returns/my-returns')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].reason).toBe('size_not_fitting');
    });
  });

  describe('Admin Return Moderation & Refund Processing', () => {
    it('denies non-admin from listing all returns with 403', async () => {
      const { token } = getCustomerToken();
      const res = await request(app)
        .get('/api/v1/returns')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('allows admin to list all returns', async () => {
      const { token: adminToken } = getAdminToken();
      const mockReturnDoc = {
        _id: new mongoose.Types.ObjectId(),
        orderNumber: 'SNE-2026-88771',
        reason: 'damaged_item',
        status: 'pending',
      };

      vi.spyOn(ReturnRequest, 'find').mockReturnValue({
        populate: vi.fn().mockReturnValue({
          populate: vi.fn().mockReturnValue({
            sort: vi.fn().mockResolvedValue([mockReturnDoc]),
          }),
        }),
      } as any);

      const res = await request(app)
        .get('/api/v1/returns')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('allows admin to approve a return request', async () => {
      const { token: adminToken } = getAdminToken();
      const userId = new mongoose.Types.ObjectId().toString();
      const mockOrder = getMockOrder(userId, 'delivered');

      const mockReturnDoc = {
        _id: new mongoose.Types.ObjectId(),
        order: mockOrder._id,
        user: new mongoose.Types.ObjectId(userId),
        status: 'pending',
        adminNotes: '',
        save: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(ReturnRequest, 'findById').mockResolvedValue(mockReturnDoc as any);
      vi.spyOn(Order, 'findById').mockResolvedValue(mockOrder as any);

      const res = await request(app)
        .patch(`/api/v1/returns/${mockReturnDoc._id}/moderate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'approved',
          adminNotes: 'Inspection photo verified; return accepted.',
        });

      expect(res.status).toBe(200);
      expect(mockReturnDoc.status).toBe('approved');
      expect(mockReturnDoc.adminNotes).toBe('Inspection photo verified; return accepted.');
    });

    it('allows admin to reject a return request with explanation', async () => {
      const { token: adminToken } = getAdminToken();
      const userId = new mongoose.Types.ObjectId().toString();
      const mockOrder = getMockOrder(userId, 'delivered');

      const mockReturnDoc = {
        _id: new mongoose.Types.ObjectId(),
        order: mockOrder._id,
        user: new mongoose.Types.ObjectId(userId),
        status: 'pending',
        rejectionReason: '',
        save: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(ReturnRequest, 'findById').mockResolvedValue(mockReturnDoc as any);
      vi.spyOn(Order, 'findById').mockResolvedValue(mockOrder as any);

      const res = await request(app)
        .patch(`/api/v1/returns/${mockReturnDoc._id}/moderate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'rejected',
          rejectionReason: 'Items used beyond reasonable inspection.',
        });

      expect(res.status).toBe(200);
      expect(mockReturnDoc.status).toBe('rejected');
      expect(mockReturnDoc.rejectionReason).toContain('Items used');
    });

    it('rejects refund processing if return request is not yet approved with 400', async () => {
      const { token: adminToken } = getAdminToken();
      const userId = new mongoose.Types.ObjectId().toString();
      const mockOrder = getMockOrder(userId, 'delivered');

      const mockReturnDoc = {
        _id: new mongoose.Types.ObjectId(),
        order: mockOrder._id,
        user: new mongoose.Types.ObjectId(userId),
        status: 'pending', // Not yet approved
      };

      vi.spyOn(ReturnRequest, 'findById').mockResolvedValue(mockReturnDoc as any);

      const res = await request(app)
        .post(`/api/v1/returns/${mockReturnDoc._id}/refund`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          refundAmount: 850,
          refundMethod: 'telebirr',
          refundReference: 'TB-REF-99887766',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('must be approved');
    });

    it('records and completes refund when admin provides valid transaction reference', async () => {
      const { token: adminToken } = getAdminToken();
      const userId = new mongoose.Types.ObjectId().toString();
      const mockOrder = getMockOrder(userId, 'delivered', 1850);

      const mockReturnDoc = {
        _id: new mongoose.Types.ObjectId(),
        order: mockOrder._id,
        user: new mongoose.Types.ObjectId(userId),
        status: 'approved',
        refundAmount: 0,
        refundMethod: null,
        refundReference: '',
        processedAt: null,
        save: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(ReturnRequest, 'findById').mockResolvedValue(mockReturnDoc as any);
      vi.spyOn(Order, 'findById').mockResolvedValue(mockOrder as any);

      const res = await request(app)
        .post(`/api/v1/returns/${mockReturnDoc._id}/refund`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          refundAmount: 850,
          refundMethod: 'telebirr',
          refundReference: 'TB-CONFIRMED-992211',
          adminNotes: 'Transferred via Telebirr merchant portal.',
        });

      expect(res.status).toBe(200);
      expect(mockReturnDoc.status).toBe('refunded');
      expect(mockReturnDoc.refundAmount).toBe(850);
      expect(mockReturnDoc.refundMethod).toBe('telebirr');
      expect(mockReturnDoc.refundReference).toBe('TB-CONFIRMED-992211');
      expect(mockReturnDoc.processedAt).toBeDefined();
      expect(mockOrder.paymentStatus).toBe('refunded');
    });
  });
});
