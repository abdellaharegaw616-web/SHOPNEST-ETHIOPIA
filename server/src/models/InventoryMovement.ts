import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { InventoryMovementType } from '@shopnest/shared';

export interface IInventoryMovement extends Document {
  product: Types.ObjectId;
  type: InventoryMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  referenceId?: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['stock_in', 'stock_out', 'adjustment', 'order_reservation'],
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    referenceId: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

export const InventoryMovement: Model<IInventoryMovement> = mongoose.model<IInventoryMovement>(
  'InventoryMovement',
  InventoryMovementSchema
);
