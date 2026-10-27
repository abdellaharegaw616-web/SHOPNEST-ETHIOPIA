import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { IUser, RefreshSession } from '../models';
import { AuthTokens, UserRole } from '@shopnest/shared';
import { AppError } from '../middleware/errorHandler';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateAccessToken = (user: IUser): string => {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: (env.JWT_ACCESS_EXPIRES_IN || '24h') as any,
  });
};

export const generateTokens = async (
  user: IUser,
  ipAddress?: string,
  deviceInfo?: string
): Promise<AuthTokens> => {
  const accessToken = generateAccessToken(user);

  // Generate cryptographic random refresh token
  const rawRefreshToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = hashToken(rawRefreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  // Store refresh session in database
  await RefreshSession.create({
    user: user._id,
    tokenHash,
    ipAddress,
    deviceInfo,
    expiresAt,
    isRevoked: false,
  });

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    expiresIn: 24 * 60 * 60, // 24 hours (86,400 seconds)
  };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
  } catch {
    throw new AppError('Invalid or expired authentication token', 401);
  }
};

export const rotateRefreshToken = async (
  rawOldToken: string,
  ipAddress?: string,
  deviceInfo?: string
): Promise<{ user: IUser; tokens: AuthTokens }> => {
  const oldTokenHash = hashToken(rawOldToken);

  const session = await RefreshSession.findOne({ tokenHash: oldTokenHash }).populate<{ user: IUser }>('user');

  if (!session) {
    throw new AppError('Invalid refresh session', 401);
  }

  // Token reuse detection: if already revoked, compromise detected! Revoke all sessions for this user!
  if (session.isRevoked) {
    await RefreshSession.updateMany({ user: session.user._id }, { isRevoked: true });
    throw new AppError('Compromised refresh token detected. Please sign in again.', 401);
  }

  // Check expiration
  if (new Date() > session.expiresAt) {
    session.isRevoked = true;
    await session.save();
    throw new AppError('Refresh token expired. Please sign in again.', 401);
  }

  // Revoke old session and generate new tokens
  const rawNewRefreshToken = crypto.randomBytes(40).toString('hex');
  const newTokenHash = hashToken(rawNewRefreshToken);

  session.isRevoked = true;
  session.replacedByTokenHash = newTokenHash;
  await session.save();

  // Create new session
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshSession.create({
    user: session.user._id,
    tokenHash: newTokenHash,
    ipAddress,
    deviceInfo,
    expiresAt,
    isRevoked: false,
  });

  const accessToken = generateAccessToken(session.user);

  return {
    user: session.user,
    tokens: {
      accessToken,
      refreshToken: rawNewRefreshToken,
      expiresIn: 24 * 60 * 60,
    },
  };
};

export const revokeRefreshSession = async (rawRefreshToken: string): Promise<void> => {
  const tokenHash = hashToken(rawRefreshToken);
  await RefreshSession.updateOne({ tokenHash }, { isRevoked: true });
};
