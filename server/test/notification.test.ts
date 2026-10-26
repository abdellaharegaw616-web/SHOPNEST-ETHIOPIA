import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import {
  NotificationService,
  normalizeEthiopianPhone,
  notificationLogs,
} from '../src/services/notification.service';
import { IOrder } from '../src/models/Order';

describe('Notification Service & Ethiopian Phone Normalization', () => {
  const app = createApp();

  describe('normalizeEthiopianPhone', () => {
    it('normalizes 09... numbers to +2519...', () => {
      expect(normalizeEthiopianPhone('0979567153')).toBe('+251979567153');
      expect(normalizeEthiopianPhone('0911223344')).toBe('+251911223344');
    });

    it('normalizes 07... numbers (Safaricom Ethiopia) to +2517...', () => {
      expect(normalizeEthiopianPhone('0712345678')).toBe('+251712345678');
    });

    it('handles formatted numbers with spaces, hyphens, and parentheses', () => {
      expect(normalizeEthiopianPhone('0979-567-153')).toBe('+251979567153');
      expect(normalizeEthiopianPhone('+251 979 567 153')).toBe('+251979567153');
      expect(normalizeEthiopianPhone('(0979) 567153')).toBe('+251979567153');
    });

    it('preserves existing +251 numbers', () => {
      expect(normalizeEthiopianPhone('+251979567153')).toBe('+251979567153');
    });
  });

  describe('NotificationService mock dispatch & graceful fallback', () => {
    it('dispatches SMS via mock provider and appends to in-memory audit log', async () => {
      const initialLogsCount = notificationLogs.length;
      const sent = await NotificationService.sendSMS('+251979567153', 'Test ShopNest SMS message', 'test_event');

      expect(sent).toBe(true);
      expect(notificationLogs.length).toBeGreaterThan(initialLogsCount);
      const lastEntry = notificationLogs[notificationLogs.length - 1];
      expect(lastEntry.channel).toBe('sms');
      expect(lastEntry.recipient).toBe('+251979567153');
      expect(lastEntry.content).toContain('Test ShopNest SMS message');
      expect(lastEntry.status).toBe('mocked');
    });

    it('dispatches order notification gracefully with bilingual content', async () => {
      const dummyOrder = {
        orderNumber: 'SNE-20261026-TEST',
        customerName: 'Abdellah Admin',
        customerPhone: '0979567153',
        totalAmount: 1850,
        paymentMethod: 'telebirr',
        shippingAddress: {
          fullName: 'Abdellah Admin',
          phone: '0979567153',
          subCity: 'Bole',
          city: 'Addis Ababa',
        },
        items: [
          { title: 'Habesha Traditional Kemis', quantity: 1, price: 1850 },
        ],
      } as unknown as IOrder;

      const result = await NotificationService.sendOrderNotification('order_placed', dummyOrder);

      expect(result).toHaveProperty('telegram');
      expect(result).toHaveProperty('sms');
      expect(result.sms.sent).toBe(true);
    });

    it('provides gateway configuration status', () => {
      const status = NotificationService.getStatus();
      expect(status).toHaveProperty('telegram');
      expect(status).toHaveProperty('sms');
      expect(status.sms).toHaveProperty('provider');
      expect(Array.isArray(status.recentLogs)).toBe(true);
    });

    it('handles test notification dispatch without crashing', async () => {
      const res = await NotificationService.sendTestNotification({
        channel: 'sms',
        phone: '0979567153',
      });

      expect(res.smsSuccess).toBe(true);
      expect(Array.isArray(res.logs)).toBe(true);
    });
  });

  describe('Notification Routes Authorization Protection', () => {
    it('GET /api/v1/notifications/preferences requires authentication', async () => {
      const res = await request(app).get('/api/v1/notifications/preferences');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('PUT /api/v1/notifications/preferences requires authentication', async () => {
      const res = await request(app).put('/api/v1/notifications/preferences').send({
        telegramEnabled: false,
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/notifications/status requires authentication and admin privileges', async () => {
      const res = await request(app).get('/api/v1/notifications/status');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
