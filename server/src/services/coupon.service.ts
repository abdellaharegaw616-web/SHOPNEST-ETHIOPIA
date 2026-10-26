import mongoose from 'mongoose';
import { Coupon, ICoupon } from '../models';
import { AppError } from '../middleware/errorHandler';
import { ValidateCouponResultDTO, DiscountType } from '@shopnest/shared';

export interface CartItemInput {
  product?: string;
  productId?: string;
  price?: number;
  quantity?: number;
  category?: string;
}

export interface CreateCouponInput {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiryDate: string | Date;
  usageLimit?: number;
  perCustomerLimit?: number;
  eligibleCategories?: string[];
  eligibleProducts?: string[];
  isActive?: boolean;
}

export class CouponService {
  /**
   * Real-time coupon validation against active subtotal, customer limits, and eligible categories/products.
   */
  static async validateCoupon(
    rawCode: string,
    subtotal: number,
    userId?: string,
    items?: CartItemInput[]
  ): Promise<ValidateCouponResultDTO> {
    const code = rawCode.trim().toUpperCase();

    const coupon = await Coupon.findOne({ code });
    if (!coupon) {
      throw new AppError(`Coupon code "${rawCode}" is invalid or does not exist.`, 404);
    }

    if (!coupon.isActive) {
      throw new AppError(`Coupon "${coupon.code}" is currently disabled or inactive.`, 400);
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      throw new AppError(
        `Coupon "${coupon.code}" expired on ${new Date(coupon.expiryDate).toLocaleDateString()}.`,
        400
      );
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      throw new AppError(
        `Coupon "${coupon.code}" has reached its maximum redemption limit (${coupon.usageLimit} uses).`,
        400
      );
    }

    // Per-Customer Limit check
    if (userId && coupon.customerUsage && coupon.customerUsage.length > 0) {
      const userRedemptions = coupon.customerUsage.filter(
        (u) => u.user && u.user.toString() === userId.toString()
      ).length;
      const maxPerUser = coupon.perCustomerLimit || 1;
      if (userRedemptions >= maxPerUser) {
        throw new AppError(
          `Coupon "${coupon.code}" has already been redeemed the maximum of ${maxPerUser} time(s) for your account.`,
          400
        );
      }
    }

    if (subtotal < coupon.minOrderValue) {
      throw new AppError(
        `Coupon "${coupon.code}" requires a minimum order value of ETB ${coupon.minOrderValue.toLocaleString()}. (Current order is ETB ${subtotal.toLocaleString()}).`,
        400
      );
    }

    // Category / Product restriction check
    let eligibleSubtotal = subtotal;
    const hasCategoryRestrictions = coupon.eligibleCategories && coupon.eligibleCategories.length > 0;
    const hasProductRestrictions = coupon.eligibleProducts && coupon.eligibleProducts.length > 0;

    if ((hasCategoryRestrictions || hasProductRestrictions) && items && items.length > 0) {
      const allowedProdIds = (coupon.eligibleProducts || []).map((p) => p.toString());
      const allowedCatIds = (coupon.eligibleCategories || []).map((c) => c.toString());

      const matchingItems = items.filter((it) => {
        const prodId = (it.productId || it.product || '').toString();
        const catId = (it.category || '').toString();

        const prodMatch = allowedProdIds.length === 0 || allowedProdIds.includes(prodId);
        const catMatch = allowedCatIds.length === 0 || allowedCatIds.includes(catId);

        return (hasProductRestrictions && prodMatch) || (hasCategoryRestrictions && catMatch);
      });

      if (matchingItems.length === 0) {
        throw new AppError(
          `Coupon "${coupon.code}" is only valid for selected eligible products or categories in your cart.`,
          400
        );
      }

      eligibleSubtotal = matchingItems.reduce(
        (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
        0
      );
    }

    // Calculate discount amount against eligible subtotal
    const calculationBase = Math.min(subtotal, eligibleSubtotal > 0 ? eligibleSubtotal : subtotal);
    let calculatedDiscount = 0;

    if (coupon.discountType === 'percentage') {
      calculatedDiscount = (calculationBase * coupon.discountValue) / 100;
      if (coupon.maxDiscount && calculatedDiscount > coupon.maxDiscount) {
        calculatedDiscount = coupon.maxDiscount;
      }
    } else {
      calculatedDiscount = coupon.discountValue;
    }

    // Ensure discount does not exceed total subtotal
    const discountAmount = Math.min(subtotal, Math.round(calculatedDiscount * 100) / 100);
    const newTotal = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);

    const message =
      coupon.discountType === 'percentage'
        ? `${coupon.discountValue}% discount applied! You save ETB ${discountAmount.toLocaleString()}`
        : `ETB ${coupon.discountValue.toLocaleString()} fixed discount applied!`;

    return {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      minOrderValue: coupon.minOrderValue,
      maxDiscount: coupon.maxDiscount,
      perCustomerLimit: coupon.perCustomerLimit || 1,
      eligibleSubtotal,
      subtotal,
      newTotal,
      message,
    };
  }

  /**
   * Records a confirmed usage of a coupon by a customer
   */
  static async recordUsage(
    code: string,
    userId?: string,
    orderId?: string
  ): Promise<ICoupon | null> {
    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) return null;

    coupon.usedCount += 1;
    if (userId && mongoose.isValidObjectId(userId)) {
      if (!coupon.customerUsage) coupon.customerUsage = [];
      coupon.customerUsage.push({
        user: new mongoose.Types.ObjectId(userId),
        orderId: orderId && mongoose.isValidObjectId(orderId) ? new mongoose.Types.ObjectId(orderId) : undefined,
        usedAt: new Date(),
      });
    }

    await coupon.save();
    return coupon;
  }

  static async getAllCoupons(): Promise<ICoupon[]> {
    return Coupon.find().sort({ createdAt: -1 });
  }

  static async createCoupon(input: CreateCouponInput): Promise<ICoupon> {
    const cleanCode = input.code.trim().toUpperCase();

    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      throw new AppError(`Coupon code "${cleanCode}" already exists`, 409);
    }

    const eligibleCategories = (input.eligibleCategories || [])
      .filter((id) => mongoose.isValidObjectId(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const eligibleProducts = (input.eligibleProducts || [])
      .filter((id) => mongoose.isValidObjectId(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const coupon = await Coupon.create({
      code: cleanCode,
      discountType: input.discountType,
      discountValue: input.discountValue,
      minOrderValue: input.minOrderValue ?? 0,
      maxDiscount: input.maxDiscount,
      expiryDate: new Date(input.expiryDate),
      usageLimit: input.usageLimit ?? 100,
      perCustomerLimit: input.perCustomerLimit ?? 1,
      eligibleCategories,
      eligibleProducts,
      isActive: input.isActive ?? true,
    });

    return coupon;
  }

  static async toggleCouponActive(couponId: string): Promise<ICoupon> {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();
    return coupon;
  }

  static async deleteCoupon(couponId: string): Promise<void> {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }

    await Coupon.findByIdAndDelete(couponId);
  }
}
