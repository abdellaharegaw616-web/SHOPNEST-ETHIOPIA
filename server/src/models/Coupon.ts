import mongoose, { Document, Schema, Model } from 'mongoose';
import { DiscountType } from '@shopnest/shared';

export interface ICouponCustomerUsage {
  user: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  usedAt: Date;
}

export interface ICoupon extends Document {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number; // in ETB
  maxDiscount?: number; // in ETB
  expiryDate: Date;
  usageLimit: number;
  usedCount: number;
  perCustomerLimit: number;
  eligibleCategories: mongoose.Types.ObjectId[];
  eligibleProducts: mongoose.Types.ObjectId[];
  customerUsage: ICouponCustomerUsage[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isValid(userId?: string): boolean;
}

const CouponCustomerUsageSchema = new Schema<ICouponCustomerUsage>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

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
    perCustomerLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    eligibleCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    eligibleProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    customerUsage: {
      type: [CouponCustomerUsageSchema],
      default: [],
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

CouponSchema.methods.isValid = function (userId?: string): boolean {
  if (!this.isActive) return false;
  if (this.usedCount >= this.usageLimit) return false;
  if (new Date() > this.expiryDate) return false;

  if (userId && this.customerUsage && this.customerUsage.length > 0) {
    const userUses = this.customerUsage.filter(
      (u: ICouponCustomerUsage) => u.user && u.user.toString() === userId
    ).length;
    if (userUses >= (this.perCustomerLimit || 1)) {
      return false;
    }
  }

  return true;
};

export const Coupon: Model<ICoupon> = mongoose.model<ICoupon>('Coupon', CouponSchema);
