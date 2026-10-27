import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { env } from '../config/env';
import { ApiResponse, AuthResponseData, UserDTO } from '@shopnest/shared';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
};

export const register = async (
  req: Request,
  res: Response<ApiResponse<AuthResponseData>>,
  next: NextFunction
): Promise<void> => {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const deviceInfo = req.headers['user-agent'];

    const result = await AuthService.register(req.body, ipAddress, deviceInfo);

    // Set secure HTTP-only cookies
    res.cookie('shopnest_access_token', result.tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    res.cookie('shopnest_refresh_token', result.tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response<ApiResponse<AuthResponseData>>,
  next: NextFunction
): Promise<void> => {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const deviceInfo = req.headers['user-agent'];

    const result = await AuthService.login(req.body, ipAddress, deviceInfo);

    res.cookie('shopnest_access_token', result.tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    res.cookie('shopnest_refresh_token', result.tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response<ApiResponse<AuthResponseData>>,
  next: NextFunction
): Promise<void> => {
  try {
    const rawToken = req.body.refreshToken || req.cookies.shopnest_refresh_token;
    if (!rawToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token is required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const ipAddress = req.ip || req.socket.remoteAddress;
    const deviceInfo = req.headers['user-agent'];

    const result = await AuthService.refreshTokens(rawToken, ipAddress, deviceInfo);

    res.cookie('shopnest_access_token', result.tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    res.cookie('shopnest_refresh_token', result.tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response<ApiResponse<{ loggedOut: boolean }>>,
  next: NextFunction
): Promise<void> => {
  try {
    const rawToken = req.body.refreshToken || req.cookies.shopnest_refresh_token;
    await AuthService.logout(rawToken);

    res.clearCookie('shopnest_access_token', COOKIE_OPTIONS);
    res.clearCookie('shopnest_refresh_token', COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: { loggedOut: true },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response<ApiResponse<UserDTO>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await AuthService.getCurrentUser(req.user!._id.toString());
    res.status(200).json({
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (
  req: Request,
  res: Response<ApiResponse<UserDTO>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await AuthService.addAddress(req.user!._id.toString(), req.body);
    res.status(201).json({
      success: true,
      message: 'Address saved to profile',
      data: user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response<ApiResponse<{ message: string; resetToken?: string }>>,
  next: NextFunction
): Promise<void> => {
  try {
    const resetToken = await AuthService.forgotPassword(req.body.email);
    res.status(200).json({
      success: true,
      message: 'If the email exists, reset instructions will be processed.',
      data: {
        message: 'Password reset token generated.',
        // Expose token in dev/test only for testing convenience
        resetToken: env.NODE_ENV !== 'production' ? resetToken : undefined,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response<ApiResponse<{ reset: boolean }>>,
  next: NextFunction
): Promise<void> => {
  try {
    await AuthService.resetPassword(req.body.token, req.body.newPassword);
    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. Please sign in.',
      data: { reset: true },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response<ApiResponse<UserDTO>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await AuthService.updateProfile(req.user!.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
