import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  titleAmharic?: string;
  slug: string;
  description: string;
  descriptionAmharic?: string;
  price: number; // in ETB
  discountPrice?: number; // in ETB
  category: Types.ObjectId;
  stock: number;
  sku: string;
  images: string[];
  attributes: Map<string, string>;
  rating: number;
  reviewCount: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      index: true,
    },
    titleAmharic: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    descriptionAmharic: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, 'Price in ETB is required'],
      min: [0, 'Price cannot be negative'],
      index: true,
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
      validate: {
        validator: function (this: IProduct, val?: number) {
          if (val === undefined || val === null) return true;
          return val < this.price;
        },
        message: 'Discount price must be less than regular price',
      },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required'],
      index: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    images: {
      type: [String],
      default: [],
    },
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublished: {
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

// Text index for search functionality
ProductSchema.index({ title: 'text', titleAmharic: 'text', description: 'text' });

// Catalog compound indexes for optimized queries
ProductSchema.index({ isPublished: 1, createdAt: -1 });
ProductSchema.index({ isPublished: 1, price: 1 });
ProductSchema.index({ isPublished: 1, rating: -1 });
ProductSchema.index({ isPublished: 1, stock: 1 });
ProductSchema.index({ category: 1, isPublished: 1 });

export const Product: Model<IProduct> = mongoose.model<IProduct>('Product', ProductSchema);
