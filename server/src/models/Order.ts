import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { OrderStatus, PaymentStatus, EthiopianAddress, EthiopianPaymentProvider } from '@shopnest/shared';
import { ETHIOPIA_CONSTANTS } from '@shopnest/shared';

export interface IOrderItem {
  product: Types.ObjectId;
  title: string;
  sku: string;
  price: number; // in ETB
  quantity: number;
  subtotal: number;
}

export interface IOrderTracking {
  status: OrderStatus;
  notes?: string;
  timestamp: Date;
}

export interface IOrder extends Document {
  orderNumber: string;
  user?: Types.ObjectId;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: IOrderItem[];
  shippingAddress: EthiopianAddress;
  deliveryInstructions?: string;
  paymentMethod: EthiopianPaymentProvider;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number; // in ETB
  idempotencyKey?: string;
  trackingHistory: IOrderTracking[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    title: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const OrderTrackingSchema = new Schema<IOrderTracking>(
  {
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      required: true,
    },
    notes: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const OrderAddressSchema = new Schema<EthiopianAddress>(
  {
    fullName: { type: String, required: true },
    phone: {
      type: String,
      required: true,
      match: [ETHIOPIA_CONSTANTS.phoneRegex, 'Invalid Ethiopian phone format'],
    },
    region: { type: String },
    city: { type: String, required: true },
    subCity: { type: String },
    woreda: { type: String },
    houseNumber: { type: String },
    landmark: { type: String },
    instructions: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      sparse: true,
      index: true,
    },
    customerName: { type: String },
    customerPhone: { type: String },
    customerEmail: { type: String },
    items: [OrderItemSchema],
    shippingAddress: {
      type: OrderAddressSchema,
      required: true,
    },
    deliveryInstructions: { type: String },
    paymentMethod: {
      type: String,
      enum: ['telebirr', 'cbe_birr', 'chapa', 'cash_on_delivery'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    couponCode: {
      type: String,
      uppercase: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    trackingHistory: [OrderTrackingSchema],
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

export const Order: Model<IOrder> = mongoose.model<IOrder>('Order', OrderSchema);
