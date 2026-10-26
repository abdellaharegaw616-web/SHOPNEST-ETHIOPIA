import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token';
import { User, IUser } from '../models';
import { AppError } from './errorHandler';
import { UserRole } from '@shopnest/shared';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.shopnest_access_token) {
      // Or check HTTP-only cookie
      token = req.cookies.shopnest_access_token;
    }

    if (!token) {
      throw new AppError('Authentication required. Please sign in.', 401);
    }

    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.userId);
    if (!user) {
      throw new AppError('The user belonging to this token no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuthenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.shopnest_access_token) {
      token = req.cookies.shopnest_access_token;
    }

    if (token) {
      try {
        const payload = verifyAccessToken(token);
        const user = await User.findById(payload.userId);
        if (user) {
          req.user = user;
        }
      } catch {
        // Continue unauthenticated if token is invalid or expired
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }

    next();
  };
};
