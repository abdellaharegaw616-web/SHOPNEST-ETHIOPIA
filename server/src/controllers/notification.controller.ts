import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { NotificationService } from '../services/notification.service';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, NotificationPreferencesDTO } from '@shopnest/shared';

export class NotificationController {
  /**
   * Get authenticated user's notification preferences
   */
  static async getPreferences(
    req: Request,
    res: Response<ApiResponse<NotificationPreferencesDTO>>,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const prefs: NotificationPreferencesDTO = {
        telegramEnabled: user.notificationPreferences?.telegramEnabled ?? true,
        smsEnabled: user.notificationPreferences?.smsEnabled ?? true,
        telegramChatId: user.notificationPreferences?.telegramChatId || '',
        orderUpdates: user.notificationPreferences?.orderUpdates ?? true,
        promotions: user.notificationPreferences?.promotions ?? false,
      };

      res.status(200).json({
        success: true,
        data: prefs,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update authenticated user's notification preferences
   */
  static async updatePreferences(
    req: Request,
    res: Response<ApiResponse<NotificationPreferencesDTO>>,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { telegramEnabled, smsEnabled, telegramChatId, orderUpdates, promotions } = req.body;

      const user = await User.findById(req.user._id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (!user.notificationPreferences) {
        user.notificationPreferences = {
          telegramEnabled: true,
          smsEnabled: true,
          telegramChatId: '',
          orderUpdates: true,
          promotions: false,
        };
      }

      if (typeof telegramEnabled === 'boolean') {
        user.notificationPreferences.telegramEnabled = telegramEnabled;
      }
      if (typeof smsEnabled === 'boolean') {
        user.notificationPreferences.smsEnabled = smsEnabled;
      }
      if (typeof telegramChatId === 'string') {
        user.notificationPreferences.telegramChatId = telegramChatId.trim();
      }
      if (typeof orderUpdates === 'boolean') {
        user.notificationPreferences.orderUpdates = orderUpdates;
      }
      if (typeof promotions === 'boolean') {
        user.notificationPreferences.promotions = promotions;
      }

      await user.save();

      const updatedPrefs: NotificationPreferencesDTO = {
        telegramEnabled: user.notificationPreferences.telegramEnabled,
        smsEnabled: user.notificationPreferences.smsEnabled,
        telegramChatId: user.notificationPreferences.telegramChatId || '',
        orderUpdates: user.notificationPreferences.orderUpdates,
        promotions: user.notificationPreferences.promotions,
      };

      res.status(200).json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: updatedPrefs,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send a test notification to verify Telegram or SMS
   */
  static async sendTestNotification(
    req: Request,
    res: Response<ApiResponse<any>>,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { channel = 'both', chatId, phone } = req.body;
      const isAdmin = req.user.role === 'admin';

      // For non-admin, use their own configured chat ID or phone
      const targetChatId = isAdmin
        ? (chatId || req.user.notificationPreferences?.telegramChatId)
        : req.user.notificationPreferences?.telegramChatId;

      const targetPhone = isAdmin
        ? (phone || req.user.phone)
        : req.user.phone;

      const result = await NotificationService.sendTestNotification({
        channel,
        chatId: targetChatId,
        phone: targetPhone,
      });

      res.status(200).json({
        success: true,
        message: 'Test notification triggered',
        data: {
          telegramSuccess: result.telegramSuccess ?? false,
          smsSuccess: result.smsSuccess ?? false,
          channel,
          targetChatId: targetChatId ? `...${targetChatId.slice(-4)}` : undefined,
          targetPhone: targetPhone ? `...${targetPhone.slice(-4)}` : undefined,
          recentLogs: result.logs,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get notification gateway status (Admin only)
   */
  static async getGatewayStatus(
    _req: Request,
    res: Response<ApiResponse<any>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const status = NotificationService.getStatus();
      res.status(200).json({
        success: true,
        data: status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
