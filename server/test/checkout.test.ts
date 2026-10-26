import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderService } from '../src/services/order.service';
import { PaymentService } from '../src/services/payment.service';
import { Product, Order, Coupon, Payment, InventoryMovement } from '../src/models';
import { createOrderSchema } from '../src/validators/order.validator';
import { ethiopianAddressSchema } from '../src/validators/auth.validator';
import { ETHIOPIA_CONSTANTS } from '@shopnest/shared';
import mongoose from 'mongoose';

describe('Step 7 — Cart and Checkout Business Logic & Security Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Ethiopian Address & Phone Number Validation', () => {
    it('accepts valid Ethiopian phone number formats (+2519..., 09..., +2517..., 07...)', () => {
      const validNumbers = [
        '+251911223344',
        '0911223344',
        '+251711223344',
        '0711223344',
        '+251988776655',
        '0988776655',
      ];

      for (const phone of validNumbers) {
        const address = {
          fullName: 'Almaz Ayana',
          phone,
          city: 'Addis Ababa',
          subCity: 'Bole',
        };
        const parsed = ethiopianAddressSchema.safeParse(address);
        expect(parsed.success).toBe(true);
      }
    });

    it('rejects invalid mobile phone formats and non-Ethiopian country codes', () => {
      const invalidNumbers = [
        '+12025550199', // US phone number
        '0811223344',   // Invalid mobile prefix for Ethiopia
        '+251811223344',// Invalid prefix
        '09112233',     // Too short
        '091122334455', // Too long
        'abcdefghij',   // Non-numeric
      ];

      for (const phone of invalidNumbers) {
        const address = {
          fullName: 'Test User',
          phone,
          city: 'Addis Ababa',
        };
        const parsed = ethiopianAddressSchema.safeParse(address);
        expect(parsed.success).toBe(false);
      }
    });

    it('rejects checkout schema when required address fields are missing', () => {
      const invalidPayload = {
        body: {
          shippingAddress: {
            // Missing fullName and city
            phone: '0911223344',
          },
          paymentMethod: 'telebirr',
        },
      };

      const result = createOrderSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('accepts regional and sub-city details with delivery instructions', () => {
      const payload = {
        body: {
          shippingAddress: {
            fullName: 'Derartu Tulu',
            phone: '+251912345678',
            region: 'Oromia',
            city: 'Adama',
            woreda: 'Kebele 02',
            landmark: 'Near Post Office',
            instructions: 'Call recipient on arrival',
          },
          paymentMethod: 'cash_on_delivery',
          deliveryInstructions: 'Leave with gate keeper if unavailable',
        },
      };

      const result = createOrderSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });

  describe('2. Backend Price Source of Truth & Total Calculations', () => {
    it('calculates total using database product prices regardless of client numbers', async () => {
      const mockProductId = new mongoose.Types.ObjectId();
      const mockProduct: any = {
        _id: mockProductId,
        title: 'Buna Desta Roasted Coffee',
        sku: 'BUNA-001',
        price: 800,
        discountPrice: 700, // True price should be 700 ETB
        stock: 50,
        isPublished: true,
      };

      vi.spyOn(Product, 'findById').mockResolvedValue(mockProduct);
      vi.spyOn(Product, 'findOneAndUpdate').mockResolvedValue({ ...mockProduct, stock: 48 });
      vi.spyOn(InventoryMovement, 'create').mockResolvedValue({} as any);
      vi.spyOn(Payment, 'create').mockResolvedValue({} as any);

      let savedOrder: any = null;
      vi.spyOn(Order, 'create').mockImplementation(async (data: any) => {
        savedOrder = { ...data, _id: new mongoose.Types.ObjectId() };
        return savedOrder as any;
      });

      await OrderService.createOrder({
        shippingAddress: {
          fullName: 'Abebe Bikila',
          phone: '0911223344',
          city: 'Addis Ababa',
        },
        paymentMethod: 'telebirr',
        items: [{ productId: mockProductId.toString(), quantity: 2 }],
      });

      // 2 units * 700 ETB = 1400 ETB subtotal
      expect(savedOrder.subtotal).toBe(1400);
      // Under 2500 ETB threshold in Addis Ababa -> 150 ETB delivery fee
      expect(savedOrder.deliveryFee).toBe(150);
      expect(savedOrder.totalAmount).toBe(1550);
    });

    it('applies free delivery for orders above the 2,500 ETB threshold', async () => {
      const mockProductId = new mongoose.Types.ObjectId();
      const mockProduct: any = {
        _id: mockProductId,
        title: 'Premium Ethiopian Leather Jacket',
        sku: 'LTH-001',
        price: 3500,
        stock: 10,
        isPublished: true,
      };

      vi.spyOn(Product, 'findById').mockResolvedValue(mockProduct);
      vi.spyOn(Product, 'findOneAndUpdate').mockResolvedValue({ ...mockProduct, stock: 9 });
      vi.spyOn(InventoryMovement, 'create').mockResolvedValue({} as any);
      vi.spyOn(Payment, 'create').mockResolvedValue({} as any);

      let savedOrder: any = null;
      vi.spyOn(Order, 'create').mockImplementation(async (data: any) => {
        savedOrder = { ...data, _id: new mongoose.Types.ObjectId() };
        return savedOrder as any;
      });

      await OrderService.createOrder({
        shippingAddress: {
          fullName: 'Haile Gebrselassie',
          phone: '0911223344',
          city: 'Addis Ababa',
        },
        paymentMethod: 'cbe_birr',
        items: [{ productId: mockProductId.toString(), quantity: 1 }],
      });

      expect(savedOrder.subtotal).toBe(3500);
      expect(savedOrder.deliveryFee).toBe(0); // Free delivery
      expect(savedOrder.totalAmount).toBe(3500);
    });

    it('charges regional delivery fee (250 ETB) for cities outside Addis Ababa when under threshold', async () => {
      const mockProductId = new mongoose.Types.ObjectId();
      const mockProduct: any = {
        _id: mockProductId,
        title: 'Traditional Handwoven Scarf',
        sku: 'NET-002',
        price: 1200,
        stock: 15,
        isPublished: true,
      };

      vi.spyOn(Product, 'findById').mockResolvedValue(mockProduct);
      vi.spyOn(Product, 'findOneAndUpdate').mockResolvedValue({ ...mockProduct, stock: 14 });
      vi.spyOn(InventoryMovement, 'create').mockResolvedValue({} as any);
      vi.spyOn(Payment, 'create').mockResolvedValue({} as any);

      let savedOrder: any = null;
      vi.spyOn(Order, 'create').mockImplementation(async (data: any) => {
        savedOrder = { ...data, _id: new mongoose.Types.ObjectId() };
        return savedOrder as any;
      });

      await OrderService.createOrder({
        shippingAddress: {
          fullName: 'Tilahun Gessesse',
          phone: '0911223344',
          region: 'Sidama',
          city: 'Hawassa', // Outside Addis
        },
        paymentMethod: 'telebirr',
        items: [{ productId: mockProductId.toString(), quantity: 1 }],
      });

      expect(savedOrder.subtotal).toBe(1200);
      expect(savedOrder.deliveryFee).toBe(250); // Regional fee
      expect(savedOrder.totalAmount).toBe(1450);
    });
  });

  describe('3. Coupon Rules & Discounts', () => {
    it('applies percentage discount and caps at maxDiscount', async () => {
      const mockProductId = new mongoose.Types.ObjectId();
      const mockProduct: any = {
        _id: mockProductId,
        title: 'Modern Coffee Roaster',
        sku: 'RST-100',
        price: 10000,
        stock: 5,
        isPublished: true,
      };

      const mockCoupon: any = {
        code: 'BIGDEAL20',
        discountType: 'percentage',
        discountValue: 20, // 20% of 10000 = 2000 ETB
        maxDiscount: 1000, // Capped at 1000 ETB
        minOrderValue: 2000,
        usedCount: 5,
        usageLimit: 100,
        expiryDate: new Date(Date.now() + 86400000),
        isActive: true,
        isValid: () => true,
        save: vi.fn(),
      };

      vi.spyOn(Product, 'findById').mockResolvedValue(mockProduct);
      vi.spyOn(Product, 'findOneAndUpdate').mockResolvedValue({ ...mockProduct, stock: 4 });
      vi.spyOn(Coupon, 'findOne').mockResolvedValue(mockCoupon);
      vi.spyOn(InventoryMovement, 'create').mockResolvedValue({} as any);
      vi.spyOn(Payment, 'create').mockResolvedValue({} as any);

      let savedOrder: any = null;
      vi.spyOn(Order, 'create').mockImplementation(async (data: any) => {
        savedOrder = { ...data, _id: new mongoose.Types.ObjectId() };
        return savedOrder as any;
      });

      await OrderService.createOrder({
        shippingAddress: {
          fullName: 'Kenenisa Bekele',
          phone: '0911223344',
          city: 'Addis Ababa',
        },
        paymentMethod: 'chapa',
        couponCode: 'BIGDEAL20',
        items: [{ productId: mockProductId.toString(), quantity: 1 }],
      });

      expect(savedOrder.subtotal).toBe(10000);
      // Discount is capped at maxDiscount: 1000 ETB
      expect(savedOrder.discountAmount).toBe(1000);
      expect(savedOrder.totalAmount).toBe(9000); // 10000 - 1000 + 0 delivery (subtotal >= 2500)
      expect(mockCoupon.usedCount).toBe(6);
    });

    it('ignores coupon if order subtotal does not meet minOrderValue', async () => {
      const mockProductId = new mongoose.Types.ObjectId();
      const mockProduct: any = {
        _id: mockProductId,
        title: 'Single Pack Coffee Beans',
        sku: 'SGL-01',
        price: 400,
        stock: 50,
        isPublished: true,
      };

      const mockCoupon: any = {
        code: 'MIN1000',
        discountType: 'fixed_amount',
        discountValue: 150,
        minOrderValue: 1000, // Requires 1000 ETB
        usedCount: 0,
        usageLimit: 50,
        expiryDate: new Date(Date.now() + 86400000),
        isActive: true,
        isValid: () => true,
        save: vi.fn(),
      };

      vi.spyOn(Product, 'findById').mockResolvedValue(mockProduct);
      vi.spyOn(Product, 'findOneAndUpdate').mockResolvedValue({ ...mockProduct, stock: 49 });
      vi.spyOn(Coupon, 'findOne').mockResolvedValue(mockCoupon);
      vi.spyOn(InventoryMovement, 'create').mockResolvedValue({} as any);
      vi.spyOn(Payment, 'create').mockResolvedValue({} as any);

      let savedOrder: any = null;
      vi.spyOn(Order, 'create').mockImplementation(async (data: any) => {
        savedOrder = { ...data, _id: new mongoose.Types.ObjectId() };
        return savedOrder as any;
      });

      await OrderService.createOrder({
        shippingAddress: {
          fullName: 'Tigist Assefa',
          phone: '0911223344',
          city: 'Addis Ababa',
        },
        paymentMethod: 'telebirr',
        couponCode: 'MIN1000',
        items: [{ productId: mockProductId.toString(), quantity: 1 }],
      });

      expect(savedOrder.discountAmount).toBe(0);
      expect(savedOrder.subtotal).toBe(400);
      expect(mockCoupon.usedCount).toBe(0); // Not consumed
    });
  });

  describe('4. Duplicate Request Protection & Idempotency Key', () => {
    it('returns existing order without duplicate deduction when same idempotency key is submitted', async () => {
      const existingOrder: any = {
        orderNumber: 'SNE-2026-99999',
        idempotencyKey: 'idemp_unique_key_123',
        subtotal: 1500,
        totalAmount: 1650,
        paymentStatus: 'pending',
        orderStatus: 'pending',
      };

      // Mock finding existing order
      vi.spyOn(Order, 'findOne').mockReturnValue({
        populate: vi.fn().mockResolvedValue(existingOrder),
      } as any);

      const findProductSpy = vi.spyOn(Product, 'findOneAndUpdate');
      const createOrderSpy = vi.spyOn(Order, 'create');

      const result = await OrderService.createOrder({
        shippingAddress: {
          fullName: 'Repeat Customer',
          phone: '0911223344',
          city: 'Addis Ababa',
        },
        paymentMethod: 'telebirr',
        idempotencyKey: 'idemp_unique_key_123',
        items: [{ productId: new mongoose.Types.ObjectId().toString(), quantity: 1 }],
      });

      expect(result.orderNumber).toBe('SNE-2026-99999');
      // Zero database deductions or creations should occur on idempotent retry
      expect(findProductSpy).not.toHaveBeenCalled();
      expect(createOrderSpy).not.toHaveBeenCalled();
    });
  });

  describe('5. Stock Conflict & Overselling Prevention', () => {
    it('rejects order when product has insufficient stock before deduction', async () => {
      const mockProductId = new mongoose.Types.ObjectId();
      const mockProduct: any = {
        _id: mockProductId,
        title: 'Handmade Jebena Pot',
        price: 1500,
        stock: 2, // Only 2 in stock
        isPublished: true,
      };

      vi.spyOn(Product, 'findById').mockResolvedValue(mockProduct);

      await expect(
        OrderService.createOrder({
          shippingAddress: {
            fullName: 'Abebe Test',
            phone: '0911223344',
            city: 'Addis Ababa',
          },
          paymentMethod: 'telebirr',
          items: [{ productId: mockProductId.toString(), quantity: 5 }], // Requesting 5
        })
      ).rejects.toThrow(/insufficient stock/i);
    });

    it('rolls back previously decremented items if a subsequent item suffers a concurrent stock conflict', async () => {
      const item1Id = new mongoose.Types.ObjectId();
      const item2Id = new mongoose.Types.ObjectId();

      const prod1: any = { _id: item1Id, title: 'Item 1', price: 500, stock: 10, isPublished: true };
      const prod2: any = { _id: item2Id, title: 'Item 2', price: 600, stock: 1, isPublished: true };

      vi.spyOn(Product, 'findById').mockImplementation(async (id: any) => {
        if (id.toString() === item1Id.toString()) return prod1;
        return prod2;
      });

      const findOneAndUpdateSpy = vi.spyOn(Product, 'findOneAndUpdate');
      // Item 1 succeeds atomic decrement
      findOneAndUpdateSpy.mockResolvedValueOnce({ ...prod1, stock: 9 });
      // Item 2 fails due to concurrent race condition (returns null)
      findOneAndUpdateSpy.mockResolvedValueOnce(null);

      const rollbackSpy = vi.spyOn(Product, 'findByIdAndUpdate').mockResolvedValue({} as any);

      await expect(
        OrderService.createOrder({
          shippingAddress: {
            fullName: 'Concurrent Customer',
            phone: '0911223344',
            city: 'Addis Ababa',
          },
          paymentMethod: 'telebirr',
          items: [
            { productId: item1Id.toString(), quantity: 1 },
            { productId: item2Id.toString(), quantity: 1 },
          ],
        })
      ).rejects.toThrow(/stock conflict/i);

      // Verify compensation rollback restored item 1's stock
      expect(rollbackSpy).toHaveBeenCalledWith(item1Id, {
        $inc: { stock: 1 },
      });
    });
  });

  describe('6. Separation of Order Status and Simulated Payment Provider', () => {
    it('creates orders with distinct pending orderStatus and pending paymentStatus', async () => {
      const mockProductId = new mongoose.Types.ObjectId();
      const mockProduct: any = {
        _id: mockProductId,
        title: 'Ethiopian Flag Scarf',
        price: 500,
        stock: 20,
        isPublished: true,
      };

      vi.spyOn(Product, 'findById').mockResolvedValue(mockProduct);
      vi.spyOn(Product, 'findOneAndUpdate').mockResolvedValue({ ...mockProduct, stock: 19 });
      vi.spyOn(InventoryMovement, 'create').mockResolvedValue({} as any);
      vi.spyOn(Payment, 'create').mockResolvedValue({} as any);

      let savedOrder: any = null;
      vi.spyOn(Order, 'create').mockImplementation(async (data: any) => {
        savedOrder = { ...data, _id: new mongoose.Types.ObjectId() };
        return savedOrder as any;
      });

      await OrderService.createOrder({
        shippingAddress: {
          fullName: 'Customer Status Test',
          phone: '0911223344',
          city: 'Addis Ababa',
        },
        paymentMethod: 'telebirr',
        items: [{ productId: mockProductId.toString(), quantity: 1 }],
      });

      // Strict separation: Reaching completion/creation does NOT set payment to completed
      expect(savedOrder.orderStatus).toBe('pending');
      expect(savedOrder.paymentStatus).toBe('pending');
    });

    it('simulates payment success and transitions paymentStatus to completed and orderStatus to processing', async () => {
      const orderId = new mongoose.Types.ObjectId();
      const paymentId = new mongoose.Types.ObjectId();

      const mockOrder: any = {
        _id: orderId,
        orderNumber: 'SNE-2026-11223',
        paymentMethod: 'telebirr',
        orderStatus: 'pending',
        paymentStatus: 'pending',
        trackingHistory: [],
        save: vi.fn(),
      };

      const mockPayment: any = {
        _id: paymentId,
        order: orderId,
        status: 'pending',
        paymentMetadata: new Map(),
        save: vi.fn(),
      };

      vi.spyOn(Payment, 'findById').mockResolvedValue(mockPayment);
      vi.spyOn(Order, 'findById').mockResolvedValue(mockOrder);

      const result = await PaymentService.simulatePayment({
        paymentId: paymentId.toString(),
        action: 'success',
      });

      expect(result.payment.status).toBe('completed');
      expect(result.order.paymentStatus).toBe('completed');
      expect(result.order.orderStatus).toBe('processing');
      expect(mockPayment.save).toHaveBeenCalled();
      expect(mockOrder.save).toHaveBeenCalled();
    });

    it('simulates payment failure and updates paymentStatus to failed while orderStatus remains pending', async () => {
      const orderId = new mongoose.Types.ObjectId();
      const paymentId = new mongoose.Types.ObjectId();

      const mockOrder: any = {
        _id: orderId,
        orderNumber: 'SNE-2026-33445',
        paymentMethod: 'cbe_birr',
        orderStatus: 'pending',
        paymentStatus: 'pending',
        trackingHistory: [],
        save: vi.fn(),
      };

      const mockPayment: any = {
        _id: paymentId,
        order: orderId,
        status: 'pending',
        paymentMetadata: new Map(),
        save: vi.fn(),
      };

      vi.spyOn(Payment, 'findById').mockResolvedValue(mockPayment);
      vi.spyOn(Order, 'findById').mockResolvedValue(mockOrder);

      const result = await PaymentService.simulatePayment({
        paymentId: paymentId.toString(),
        action: 'failure',
        failureReason: 'Customer canceled telebirr PIN entry',
      });

      expect(result.payment.status).toBe('failed');
      expect(result.order.paymentStatus).toBe('failed');
      expect(result.order.orderStatus).toBe('pending'); // Still pending, allowed to retry
    });
  });
});
