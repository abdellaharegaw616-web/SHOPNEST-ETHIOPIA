import mongoose, { Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole, EthiopianAddress } from '@shopnest/shared';
import { ETHIOPIA_CONSTANTS } from '@shopnest/shared';

export interface IUserAddress extends EthiopianAddress {}

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  addresses: IUserAddress[];
  isVerified: boolean;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AddressSchema = new mongoose.Schema<IUserAddress>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      match: [ETHIOPIA_CONSTANTS.phoneRegex, 'Invalid Ethiopian phone number'],
    },
    region: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    subCity: { type: String, trim: true },
    woreda: { type: String, trim: true },
    houseNumber: { type: String, trim: true },
    landmark: { type: String, trim: true },
    instructions: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [ETHIOPIA_CONSTANTS.phoneRegex, 'Invalid Ethiopian phone format (+2519... / 09... / +2517... / 07...)'],
      index: true,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
      index: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    addresses: [AddressSchema],
    isVerified: {
      type: Boolean,
      default: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        delete ret.password;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
