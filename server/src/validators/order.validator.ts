import { z } from 'zod';
import { ethiopianAddressSchema } from './auth.validator';

import { ETHIOPIA_CONSTANTS } from '@shopnest/shared';

export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: ethiopianAddressSchema,
    paymentMethod: z.enum(['telebirr', 'cbe_birr', 'chapa', 'cash_on_delivery']),
    couponCode: z.string().optional(),
    deliveryInstructions: z.string().optional(),
    notes: z.string().optional(),
    idempotencyKey: z.string().optional(),
    customerName: z.string().optional(),
    customerEmail: z.string().email().optional(),
    customerPhone: z
      .string()
      .regex(ETHIOPIA_CONSTANTS.phoneRegex, 'Invalid Ethiopian phone format')
      .optional(),
    saveAddressToProfile: z.boolean().optional(),
    items: z
      .array(
        z.object({
          productId: z.string().min(1, 'Product ID is required'),
          quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        })
      )
      .optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
    notes: z.string().optional(),
  }),
});
