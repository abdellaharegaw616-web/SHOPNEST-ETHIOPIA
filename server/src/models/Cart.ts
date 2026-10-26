import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
  unitPrice: number; // Snapshot of unit price in ETB
  selectedAttributes?: Map<string, string>;
}

export interface ICart extends Document {
  user?: Types.ObjectId;
  guestSessionId?: string;
  items: ICartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    selectedAttributes: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { _id: true }
);

const CartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      sparse: true,
      index: true,
    },
    guestSessionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    items: [CartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
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

// Calculate totalAmount before saving
CartSchema.pre<ICart>('save', function (next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  next();
});

export const Cart: Model<ICart> = mongoose.model<ICart>('Cart', CartSchema);
