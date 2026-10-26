import { z } from 'zod';

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().trim().min(1, 'Coupon code is required'),
    subtotal: z.number().min(0, 'Subtotal must be a positive number'),
  }),
});

export const createCouponSchema = z.object({
  body: z.object({
    code: z
      .string()
      .trim()
      .min(3, 'Code must be at least 3 characters')
      .max(30, 'Code cannot exceed 30 characters')
      .regex(
        /^[A-Za-z0-9_-]+$/,
        'Coupon code can only contain letters, numbers, hyphens, and underscores'
      ),
    discountType: z.enum(['percentage', 'fixed_amount']),
    discountValue: z.number().positive('Discount value must be greater than 0'),
    minOrderValue: z.number().min(0, 'Minimum order value cannot be negative').default(0),
    maxDiscount: z.number().positive('Maximum discount must be positive').optional(),
    expiryDate: z
      .string()
      .or(z.date())
      .refine(
        (val) => new Date(val).getTime() > Date.now(),
        'Expiry date must be in the future'
      ),
    usageLimit: z.number().int().positive('Usage limit must be at least 1').default(100),
    isActive: z.boolean().default(true),
  }),
});
