import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { PaymentStatus, EthiopianPaymentProvider } from '@shopnest/shared';

export interface IPayment extends Document {
  order: Types.ObjectId;
  user?: Types.ObjectId;
  amount: number; // in ETB
  currency: 'ETB';
  provider: EthiopianPaymentProvider;
  transactionReference: string;
  status: PaymentStatus;
  paymentMetadata: Map<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      sparse: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'ETB',
      enum: ['ETB'],
    },
    provider: {
      type: String,
      enum: ['telebirr', 'cbe_birr', 'chapa', 'cash_on_delivery'],
      required: true,
      index: true,
    },
    transactionReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentMetadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
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

export const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', PaymentSchema);
