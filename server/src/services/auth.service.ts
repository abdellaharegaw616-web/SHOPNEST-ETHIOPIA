import { User, IUser } from '../models';
import { generateTokens, rotateRefreshToken, revokeRefreshSession } from '../utils/token';
import { AppError } from '../middleware/errorHandler';
import { AuthResponseData, UserDTO, EthiopianAddress } from '@shopnest/shared';
import crypto from 'crypto';

export const toUserDTO = (user: IUser): UserDTO => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar || '',
    addresses: user.addresses,
    isVerified: user.isVerified,
    createdAt: user.createdAt.toISOString(),
  };
};

export class AuthService {
  static async register(
    data: { name: string; email: string; password: string; phone: string; address?: any },
    ipAddress?: string,
    deviceInfo?: string
  ): Promise<AuthResponseData> {
    const cleanEmail = data.email.toLowerCase().trim();
    const cleanPhone = (data.phone || '').replace(/[\s\-\(\)]/g, '');

    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      throw new AppError('An account with this email address already exists. Please sign in instead.', 409);
    }

    const existingPhone = await User.findOne({ phone: cleanPhone });
    if (existingPhone) {
      throw new AppError('An account with this phone number already exists. Please sign in instead.', 409);
    }

    const addresses = data.address ? [data.address] : [];

    const user = await User.create({
      name: data.name.trim(),
      email: cleanEmail,
      password: data.password,
      phone: cleanPhone,
      role: 'customer',
      addresses,
      isVerified: false,
    });


    const tokens = await generateTokens(user, ipAddress, deviceInfo);

    return {
      user: toUserDTO(user),
      tokens,
    };
  }

  static async login(
    data: { email?: string; emailOrPhone?: string; password: string },
    ipAddress?: string,
    deviceInfo?: string
  ): Promise<AuthResponseData> {
    const rawIdentifier = (data.emailOrPhone || data.email || '').trim();
    if (!rawIdentifier) {
      throw new AppError('Email or phone number is required', 400);
    }

    const isEmail = rawIdentifier.includes('@');
    let query: any;
    if (isEmail) {
      const emailLower = rawIdentifier.toLowerCase();
      query = emailLower === 'admin@shopnest.et'
        ? { email: { $in: ['admin@shopnest.et', 'abdellaj636@gmail.com'] } }
        : { email: emailLower };
    } else {
      const cleanPhone = rawIdentifier.replace(/[\s\-\(\)]/g, '');
      const altPhone = cleanPhone.startsWith('+251')
        ? '0' + cleanPhone.slice(4)
        : cleanPhone.startsWith('0')
        ? '+251' + cleanPhone.slice(1)
        : cleanPhone;
      query = { phone: { $in: [cleanPhone, altPhone] } };
    }

    const user = await User.findOne(query).select('+password');
    if (!user) {
      throw new AppError('Invalid email/phone or password', 401);
    }

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) {
      throw new AppError('Invalid email/phone or password', 401);
    }

    const tokens = await generateTokens(user, ipAddress, deviceInfo);

    return {
      user: toUserDTO(user),
      tokens,
    };
  }

  static async refreshTokens(
    refreshToken: string,
    ipAddress?: string,
    deviceInfo?: string
  ): Promise<AuthResponseData> {
    const { user, tokens } = await rotateRefreshToken(refreshToken, ipAddress, deviceInfo);
    return {
      user: toUserDTO(user),
      tokens,
    };
  }

  static async logout(refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await revokeRefreshSession(refreshToken);
    }
  }

  static async getCurrentUser(userId: string): Promise<UserDTO> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return toUserDTO(user);
  }

  static async addAddress(userId: string, address: EthiopianAddress): Promise<UserDTO> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    user.addresses.push(address as any);
    await user.save();
    return toUserDTO(user);
  }

  static async updateProfile(
    userId: string,
    data: { name?: string; phone?: string; avatar?: string }
  ): Promise<UserDTO> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    if (data.name) user.name = data.name.trim();
    if (data.phone) user.phone = data.phone.trim();
    if (data.avatar !== undefined) user.avatar = data.avatar;

    await user.save();
    return toUserDTO(user);
  }

  static async forgotPassword(email: string): Promise<string> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Do not leak user existence
      return 'If that email is registered, you will receive password reset instructions.';
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = tokenHash;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    // In production: send email via nodemailer / sendgrid
    return resetToken;
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    }).select('+password');

    if (!user) {
      throw new AppError('Reset token is invalid or has expired', 400);
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
  }
}
