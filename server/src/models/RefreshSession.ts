import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IRefreshSession extends Document {
  user: Types.ObjectId;
  tokenHash: string;
  deviceInfo?: string;
  ipAddress?: string;
  expiresAt: Date;
  isRevoked: boolean;
  replacedByTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RefreshSessionSchema = new Schema<IRefreshSession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      index: true,
    },
    deviceInfo: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    replacedByTokenHash: {
      type: String,
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

// TTL index to automatically purge expired refresh sessions from MongoDB
RefreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshSession: Model<IRefreshSession> = mongoose.model<IRefreshSession>(
  'RefreshSession',
  RefreshSessionSchema
);
