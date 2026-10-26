import { Coupon, ICoupon } from '../models';
import { AppError } from '../middleware/errorHandler';
import { ValidateCouponResultDTO, DiscountType } from '@shopnest/shared';

export interface CreateCouponInput {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiryDate: string | Date;
  usageLimit?: number;
  isActive?: boolean;
}

export class CouponService {
  /**
   * Real-time coupon validation against active subtotal with full business rule verification.
   */
  static async validateCoupon(
    rawCode: string,
    subtotal: number
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

    if (subtotal < coupon.minOrderValue) {
      throw new AppError(
        `Coupon "${coupon.code}" requires a minimum order value of ETB ${coupon.minOrderValue.toLocaleString()}. (Current order is ETB ${subtotal.toLocaleString()}).`,
        400
      );
    }

    let calculatedDiscount = 0;
    if (coupon.discountType === 'percentage') {
      calculatedDiscount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && calculatedDiscount > coupon.maxDiscount) {
        calculatedDiscount = coupon.maxDiscount;
      }
    } else {
      calculatedDiscount = coupon.discountValue;
    }

    // Ensure discount does not exceed subtotal
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
      subtotal,
      newTotal,
      message,
    };
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

    const coupon = await Coupon.create({
      code: cleanCode,
      discountType: input.discountType,
      discountValue: input.discountValue,
      minOrderValue: input.minOrderValue ?? 0,
      maxDiscount: input.maxDiscount,
      expiryDate: new Date(input.expiryDate),
      usageLimit: input.usageLimit ?? 100,
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
