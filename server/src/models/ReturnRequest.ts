import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { ReturnReason, ReturnRequestStatus, EthiopianPaymentProvider } from '@shopnest/shared';

export interface IReturnItem {
  product: Types.ObjectId;
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface IReturnRequest extends Document {
  order: Types.ObjectId;
  orderNumber: string;
  user: Types.ObjectId;
  items: IReturnItem[];
  reason: ReturnReason;
  customerNote?: string;
  images: string[];
  status: ReturnRequestStatus;
  adminNotes?: string;
  rejectionReason?: string;
  refundAmount?: number;
  refundMethod?: EthiopianPaymentProvider;
  refundReference?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnItemSchema = new Schema<IReturnItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const ReturnRequestSchema = new Schema<IReturnRequest>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [ReturnItemSchema],
      default: [],
    },
    reason: {
      type: String,
      required: true,
      enum: [
        'damaged_item',
        'wrong_item',
        'quality_issue',
        'size_not_fitting',
        'defective',
        'other',
      ],
      index: true,
    },
    customerNote: {
      type: String,
      trim: true,
      maxlength: 1500,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: string[]) => !arr || arr.length <= 3,
        message: 'A maximum of 3 return photos may be attached',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'refunded'],
      default: 'pending',
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 1500,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    refundAmount: {
      type: Number,
      min: 0,
    },
    refundMethod: {
      type: String,
      enum: ['telebirr', 'cbe_birr', 'chapa', 'cash'],
    },
    refundReference: {
      type: String,
      trim: true,
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ReturnRequestSchema.index({ order: 1, status: 1 });

export const ReturnRequest: Model<IReturnRequest> = mongoose.model<IReturnRequest>(
  'ReturnRequest',
  ReturnRequestSchema
);
