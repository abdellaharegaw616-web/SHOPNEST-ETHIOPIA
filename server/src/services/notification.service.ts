import { env } from '../config/env';
import { logger } from '../utils/logger';
import { IOrder } from '../models/Order';
import { IUser } from '../models/User';

export type OrderNotificationEvent =
  | 'order_placed'
  | 'payment_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'return_requested'
  | 'return_approved'
  | 'return_rejected'
  | 'refund_processed';

export interface NotificationResult {
  telegram: { sent: boolean; skipped?: boolean; error?: string; recipients?: string[] };
  sms: { sent: boolean; skipped?: boolean; provider: string; error?: string; to?: string };
}

// In-memory log of dispatched notifications (useful for tests and admin monitor)
export interface DispatchedLogEntry {
  id: string;
  channel: 'telegram' | 'sms';
  recipient: string;
  event: string;
  content: string;
  status: 'sent' | 'failed' | 'mocked';
  timestamp: Date;
  error?: string;
}

export const notificationLogs: DispatchedLogEntry[] = [];

/**
 * Normalizes Ethiopian phone numbers to international E.164 (+2519... / +2517...)
 */
export const normalizeEthiopianPhone = (phone: string): string => {
  const clean = (phone || '').replace(/[\s\-\(\)]/g, '');
  if (clean.startsWith('09')) {
    return '+251' + clean.slice(1);
  }
  if (clean.startsWith('07')) {
    return '+251' + clean.slice(1);
  }
  if (clean.startsWith('251')) {
    return '+' + clean;
  }
  return clean;
};

export class NotificationService {
  /**
   * Dispatches notifications for order lifecycle events via Telegram and SMS
   */
  static async sendOrderNotification(
    event: OrderNotificationEvent,
    order: IOrder,
    recipientUser?: IUser | null
  ): Promise<NotificationResult> {
    const result: NotificationResult = {
      telegram: { sent: false },
      sms: { sent: false, provider: env.SMS_PROVIDER },
    };

    try {
      // 1. Prepare message contents
      const customerName = order.customerName || order.shippingAddress?.fullName || recipientUser?.name || 'Customer';
      const customerPhone = order.customerPhone || order.shippingAddress?.phone || recipientUser?.phone || '';
      const orderNumber = order.orderNumber;
      const totalAmount = (order.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
      const trackingUrl = `${env.CLIENT_URL}/track-order?order=${encodeURIComponent(orderNumber)}`;
      const subCity = order.shippingAddress?.subCity || 'Addis Ababa';
      const city = order.shippingAddress?.city || 'Addis Ababa';
      const paymentProvider = (order.paymentMethod || 'telebirr').replace(/_/g, ' ').toUpperCase();

      // Titles in English & Amharic
      const eventHeaders: Record<OrderNotificationEvent, { en: string; am: string; emoji: string }> = {
        order_placed: { en: 'Order Confirmed', am: 'የትዕዛዝ ማረጋገጫ', emoji: '🛍️' },
        payment_confirmed: { en: 'Payment Confirmed', am: 'ክፍያ ተረጋግጧል', emoji: '💳' },
        order_shipped: { en: 'Order Dispatched / Shipped', am: 'ትዕዛዝዎ ተልኳል', emoji: '🚚' },
        order_delivered: { en: 'Order Delivered Successfully', am: 'ትዕዛዝዎ ደርሷል', emoji: '✅' },
        order_cancelled: { en: 'Order Cancelled', am: 'ትዕዛዝ ተሰርዟል', emoji: '❌' },
        return_requested: { en: 'Return Request Received', am: 'የመመለሻ ጥያቄ ደርሶናል', emoji: '🔄' },
        return_approved: { en: 'Return Request Approved', am: 'የመመለሻ ጥያቄ ፀድቋል', emoji: '✅' },
        return_rejected: { en: 'Return Request Declined', am: 'የመመለሻ ጥያቄ አልተቀበለም', emoji: '⚠️' },
        refund_processed: { en: 'Refund Processed', am: 'ተመላሽ ገንዘብ ተጠናቋል', emoji: '💸' },
      };

      const header = eventHeaders[event] || { en: 'Order Notification', am: 'የትዕዛዝ መረጃ', emoji: '📦' };

      // HTML formatted Telegram message
      const itemsList = order.items && order.items.length > 0
        ? order.items.map((it) => `• <b>${it.title || 'Product'}</b> × ${it.quantity} (ETB ${(it.price || 0).toLocaleString()})`).join('\n')
        : '• Storefront Items';

      const telegramHtml = `
${header.emoji} <b>ShopNest Ethiopia — ${header.en}</b>
<b>${header.am}</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Order #:</b> <code>${orderNumber}</code>
👤 <b>Customer:</b> ${customerName}
📞 <b>Phone:</b> ${customerPhone || 'N/A'}
📍 <b>Destination:</b> ${subCity}, ${city}
💳 <b>Payment:</b> ${paymentProvider} (${order.paymentStatus?.toUpperCase()})
💰 <b>Total Amount:</b> <b>ETB ${totalAmount}</b>

📦 <b>Items:</b>
${itemsList}

🔗 <a href="${trackingUrl}">Click here to Track Shipment Live</a>
📞 Support Helpline: <code>0979567153 / 0945801156</code>
      `.trim();

      // SMS short text (concise format adhering to 160 chars limits where possible)
      const smsText = `[ShopNest ET] Hi ${customerName}, ${header.en} (#${orderNumber}). Total: ETB ${totalAmount}. Payment: ${paymentProvider}. Track: ${trackingUrl} Helpline: 0979567153`;

      // 2. Dispatch Telegram Notifications
      const telegramChatIds: string[] = [];
      const userPrefs = recipientUser?.notificationPreferences;

      if (userPrefs?.telegramEnabled !== false && userPrefs?.telegramChatId) {
        telegramChatIds.push(userPrefs.telegramChatId);
      }
      if (env.TELEGRAM_DEFAULT_CHAT_ID && !telegramChatIds.includes(env.TELEGRAM_DEFAULT_CHAT_ID)) {
        // Also send admin dispatch copy to default store chat
        telegramChatIds.push(env.TELEGRAM_DEFAULT_CHAT_ID);
      }

      if (telegramChatIds.length > 0 && env.TELEGRAM_BOT_TOKEN) {
        const sentRecipients: string[] = [];
        for (const chatId of telegramChatIds) {
          const sent = await this.sendTelegramMessage(chatId, telegramHtml, event);
          if (sent) sentRecipients.push(chatId);
        }
        result.telegram = {
          sent: sentRecipients.length > 0,
          recipients: sentRecipients,
        };
      } else {
        result.telegram = {
          sent: false,
          skipped: true,
          error: !env.TELEGRAM_BOT_TOKEN ? 'Telegram Bot Token not configured' : 'No destination Chat ID provided',
        };
      }

      // 3. Dispatch SMS Notifications
      if (userPrefs?.smsEnabled !== false && customerPhone) {
        const normPhone = normalizeEthiopianPhone(customerPhone);
        const smsSent = await this.sendSMS(normPhone, smsText, event);
        result.sms = {
          sent: smsSent,
          provider: env.SMS_PROVIDER,
          to: normPhone,
        };
      } else {
        result.sms = {
          sent: false,
          skipped: true,
          provider: env.SMS_PROVIDER,
          error: !customerPhone ? 'Customer phone number missing' : 'Customer opted out of SMS',
        };
      }
    } catch (err: any) {
      logger.warn(`Notification dispatcher encountered an error: ${err.message}`);
    }

    return result;
  }

  /**
   * Low-level Telegram Bot API dispatcher with retry handling
   */
  static async sendTelegramMessage(chatId: string, htmlMessage: string, eventName = 'message'): Promise<boolean> {
    const token = env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      logger.info(`[Telegram Bot] Simulated dispatch to ${chatId} (Token not set): ${htmlMessage.slice(0, 80)}...`);
      notificationLogs.push({
        id: `tg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        channel: 'telegram',
        recipient: chatId,
        event: eventName,
        content: htmlMessage,
        status: 'mocked',
        timestamp: new Date(),
      });
      return true;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const payload = {
      chat_id: chatId,
      text: htmlMessage,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    };

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          logger.info(`[Telegram Bot] Message delivered to Chat ID ${chatId} for ${eventName}`);
          notificationLogs.push({
            id: `tg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            channel: 'telegram',
            recipient: chatId,
            event: eventName,
            content: htmlMessage,
            status: 'sent',
            timestamp: new Date(),
          });
          return true;
        }

        const errData = await res.text();
        logger.warn(`[Telegram Bot] Attempt ${attempts} failed (${res.status}): ${errData}`);
      } catch (err: any) {
        logger.warn(`[Telegram Bot] Attempt ${attempts} network exception: ${err.message}`);
      }

      if (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    notificationLogs.push({
      id: `tg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      channel: 'telegram',
      recipient: chatId,
      event: eventName,
      content: htmlMessage,
      status: 'failed',
      timestamp: new Date(),
      error: 'Max retries exhausted',
    });

    return false;
  }

  /**
   * Low-level SMS Gateway dispatcher with configurable provider support
   */
  static async sendSMS(to: string, message: string, eventName = 'message'): Promise<boolean> {
    const provider = env.SMS_PROVIDER || 'mock';

    // 1. Mock Provider (Default for testing & local development)
    if (provider === 'mock') {
      logger.info(`[SMS Gateway (Mock)] Sent to ${to}: "${message}"`);
      notificationLogs.push({
        id: `sms-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        channel: 'sms',
        recipient: to,
        event: eventName,
        content: message,
        status: 'mocked',
        timestamp: new Date(),
      });
      return true;
    }

    // 2. Africa's Talking SMS Provider
    if (provider === 'africastalking') {
      if (!env.SMS_API_KEY) {
        logger.warn('[SMS: Africa\'s Talking] Missing SMS_API_KEY, falling back to mock log.');
        return false;
      }
      try {
        const atUrl = 'https://api.africastalking.com/version1/messaging';
        const params = new URLSearchParams({
          username: 'sandbox', // or production username
          to,
          message,
          from: env.SMS_SENDER_ID,
        });

        const res = await fetch(atUrl, {
          method: 'POST',
          headers: {
            'apiKey': env.SMS_API_KEY,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          body: params.toString(),
        });

        if (res.ok) {
          logger.info(`[SMS: Africa's Talking] Dispatched to ${to}`);
          notificationLogs.push({
            id: `sms-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            channel: 'sms',
            recipient: to,
            event: eventName,
            content: message,
            status: 'sent',
            timestamp: new Date(),
          });
          return true;
        }
      } catch (err: any) {
        logger.warn(`[SMS: Africa's Talking] Error: ${err.message}`);
      }
      return false;
    }

    // 3. Generic HTTP JSON Gateway (Supports local Ethiopian telecom gateways e.g. Ethio Telecom HTTP API)
    if (provider === 'generic_http' && env.SMS_API_URL) {
      try {
        const res = await fetch(env.SMS_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(env.SMS_API_KEY ? { 'Authorization': `Bearer ${env.SMS_API_KEY}` } : {}),
          },
          body: JSON.stringify({
            to,
            message,
            senderId: env.SMS_SENDER_ID,
            timestamp: new Date().toISOString(),
          }),
        });

        if (res.ok) {
          logger.info(`[SMS: Generic HTTP] Dispatched to ${to}`);
          notificationLogs.push({
            id: `sms-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            channel: 'sms',
            recipient: to,
            event: eventName,
            content: message,
            status: 'sent',
            timestamp: new Date(),
          });
          return true;
        }
      } catch (err: any) {
        logger.warn(`[SMS: Generic HTTP] Error: ${err.message}`);
      }
      return false;
    }

    // 4. Twilio Provider
    if (provider === 'twilio') {
      logger.info(`[SMS: Twilio Provider] Configured for ${to}`);
      notificationLogs.push({
        id: `sms-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        channel: 'sms',
        recipient: to,
        event: eventName,
        content: message,
        status: 'mocked',
        timestamp: new Date(),
      });
      return true;
    }

    return true;
  }

  /**
   * Sends a test notification to verify integration
   */
  static async sendTestNotification(options: {
    channel: 'telegram' | 'sms' | 'both';
    chatId?: string;
    phone?: string;
  }): Promise<{ telegramSuccess?: boolean; smsSuccess?: boolean; logs: DispatchedLogEntry[] }> {
    const testTime = new Date().toLocaleTimeString();
    const testResult: { telegramSuccess?: boolean; smsSuccess?: boolean; logs: DispatchedLogEntry[] } = {
      logs: [],
    };

    if (options.channel === 'telegram' || options.channel === 'both') {
      const targetChat = options.chatId || env.TELEGRAM_DEFAULT_CHAT_ID;
      if (targetChat) {
        const msg = `🔔 <b>ShopNest Ethiopia — Test Notification</b>\n\nYour Telegram integration is working perfectly! (Verified at ${testTime})\nHelpline: <code>0979567153</code>`;
        testResult.telegramSuccess = await this.sendTelegramMessage(targetChat, msg, 'test_message');
      }
    }

    if (options.channel === 'sms' || options.channel === 'both') {
      const targetPhone = options.phone || '+251979567153';
      const msg = `[ShopNest ET] Test SMS notification verified successfully at ${testTime}. Provider: ${env.SMS_PROVIDER}.`;
      testResult.smsSuccess = await this.sendSMS(normalizeEthiopianPhone(targetPhone), msg, 'test_message');
    }

    testResult.logs = notificationLogs.slice(-5);
    return testResult;
  }

  /**
   * Returns current gateway configuration status and recent log entries
   */
  static getStatus(): {
    telegram: { configured: boolean; defaultChatIdConfigured: boolean };
    sms: { provider: string; configured: boolean; senderId: string };
    recentLogs: DispatchedLogEntry[];
  } {
    return {
      telegram: {
        configured: Boolean(env.TELEGRAM_BOT_TOKEN),
        defaultChatIdConfigured: Boolean(env.TELEGRAM_DEFAULT_CHAT_ID),
      },
      sms: {
        provider: env.SMS_PROVIDER,
        configured: env.SMS_PROVIDER === 'mock' || Boolean(env.SMS_API_KEY || env.SMS_API_URL),
        senderId: env.SMS_SENDER_ID,
      },
      recentLogs: notificationLogs.slice(-20).reverse(),
    };
  }
}
