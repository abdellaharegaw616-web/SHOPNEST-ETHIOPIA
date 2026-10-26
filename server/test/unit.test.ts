import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';
import { ETHIOPIA_CONSTANTS } from '@shopnest/shared';
import { formatEthiopianDateTime } from '../src/utils/date';
import { generateAccessToken, verifyAccessToken } from '../src/utils/token';
import { registerSchema, loginSchema } from '../src/validators/auth.validator';
import { createOrderSchema } from '../src/validators/order.validator';

describe('Ethiopian Localization & Business Rules Unit Tests', () => {
  it('validates correct Ethiopian mobile phone numbers (+2519... and 09...)', () => {
    const validEthioNumbers = [
      '+251911223344',
      '0911223344',
      '+251711223344',
      '0711223344',
    ];

    for (const phone of validEthioNumbers) {
      expect(ETHIOPIA_CONSTANTS.phoneRegex.test(phone)).toBe(true);
    }
  });

  it('rejects invalid mobile phone formats', () => {
    const invalidNumbers = [
      '+12025550143', // US
      '0811223344',   // Invalid prefix
      '+251811223344',
      '12345678',     // Too short
      'phone_number',
    ];

    for (const phone of invalidNumbers) {
      expect(ETHIOPIA_CONSTANTS.phoneRegex.test(phone)).toBe(false);
    }
  });

  it('formats dates consistently using Africa/Addis_Ababa timezone', () => {
    const testDate = new Date('2026-10-23T12:00:00Z');
    const formatted = formatEthiopianDateTime(testDate);
    // UTC 12:00 is 15:00 in Addis Ababa (UTC+3)
    expect(formatted).toContain('2026');
    expect(formatted).toContain('03:00'); // 3:00 PM
  });

  it('correctly hashes and verifies passwords using bcrypt', async () => {
    const rawPassword = 'SecureEthiopiaPassword2026!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    expect(hash).not.toBe(rawPassword);
    const isMatch = await bcrypt.compare(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await bcrypt.compare('WrongPassword', hash);
    expect(isWrongMatch).toBe(false);
  });

  it('generates and verifies JWT access tokens with strict claims', () => {
    const mockUser: any = {
      _id: '507f1f77bcf86cd799439011',
      email: 'abebe@shopnest.et',
      role: 'customer',
    };

    const token = generateAccessToken(mockUser);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe('507f1f77bcf86cd799439011');
    expect(decoded.email).toBe('abebe@shopnest.et');
    expect(decoded.role).toBe('customer');
  });

  it('validates registration schema with Ethiopian address and phone', () => {
    const validData = {
      body: {
        name: 'Abebe Bikila',
        email: 'abebe.bikila@gmail.com',
        password: 'securePassword123',
        phone: '+251911445566',
        address: {
          fullName: 'Abebe Bikila',
          phone: '+251911445566',
          city: 'Addis Ababa',
          subCity: 'Bole',
          woreda: '03',
          houseNumber: '142',
        },
      },
    };

    const parsed = registerSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it('rejects registration when phone number is non-Ethiopian', () => {
    const invalidData = {
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '+14155552671', // US phone number
      },
    };

    const parsed = registerSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });

  it('validates order checkout schema with Ethiopian payment methods', () => {
    const validOrder = {
      body: {
        shippingAddress: {
          fullName: 'Tigist Assefa',
          phone: '0912345678',
          city: 'Addis Ababa',
          subCity: 'Kirkos',
        },
        paymentMethod: 'telebirr',
      },
    };

    const parsed = createOrderSchema.safeParse(validOrder);
    expect(parsed.success).toBe(true);
  });
});
