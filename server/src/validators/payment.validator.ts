import { z } from 'zod';

export const simulatePaymentSchema = z.object({
  body: z.object({
    paymentId: z.string().optional(),
    orderId: z.string().optional(),
    action: z.enum(['success', 'failure'], {
      errorMap: () => ({ message: 'Action must be either "success" or "failure"' }),
    }),
    failureReason: z.string().optional(),
  }),
});
