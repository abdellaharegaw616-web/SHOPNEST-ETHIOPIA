import { z } from 'zod';

export const createReturnSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    reason: z.enum(
      ['damaged_item', 'wrong_item', 'quality_issue', 'size_not_fitting', 'defective', 'other'],
      { required_error: 'Valid return reason is required' }
    ),
    customerNote: z.string().max(1500, 'Customer note cannot exceed 1500 characters').optional(),
    images: z.array(z.string()).max(3, 'A maximum of 3 photos can be uploaded').optional().default([]),
    items: z
      .array(
        z.object({
          product: z.string().min(1, 'Product ID is required'),
          quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        })
      )
      .optional(),
  }),
});

export const moderateReturnSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'rejected'], {
      required_error: 'Status must be either "approved" or "rejected"',
    }),
    adminNotes: z.string().max(1500).optional(),
    rejectionReason: z.string().max(500).optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Return ID is required'),
  }),
});

export const processRefundSchema = z.object({
  body: z.object({
    refundAmount: z.number().positive('Refund amount must be greater than 0 ETB'),
    refundMethod: z.enum(['telebirr', 'cbe_birr', 'chapa', 'cash'], {
      required_error: 'Refund method is required (telebirr, cbe_birr, chapa, or cash)',
    }),
    refundReference: z
      .string()
      .min(3, 'Transaction reference/ID is required to confirm refund processing')
      .max(100),
    adminNotes: z.string().max(1500).optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Return ID is required'),
  }),
});
