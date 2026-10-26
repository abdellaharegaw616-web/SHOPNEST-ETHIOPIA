import mongoose, { Document, Schema, Model } from 'mongoose';
import { DiscountType } from '@shopnest/shared';

export interface ICoupon extends Document {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number; // in ETB
  maxDiscount?: number; // in ETB
  expiryDate: Date;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isValid(): boolean;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed_amount'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: [1, 'Discount value must be at least 1'],
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    usageLimit: {
      type: Number,
      default: 100,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

CouponSchema.methods.isValid = function (): boolean {
  if (!this.isActive) return false;
  if (this.usedCount >= this.usageLimit) return false;
  if (new Date() > this.expiryDate) return false;
  return true;
};

export const Coupon: Model<ICoupon> = mongoose.model<ICoupon>('Coupon', CouponSchema);
