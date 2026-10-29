import { z } from 'zod';
import { BRAND } from '@shopnest/shared';

export const shoppingAssistantSchema = z.object({
  body: z.object({
    message: z
      .string({
        required_error: 'Customer message is required',
        invalid_type_error: 'Customer message must be a string',
      })
      .trim()
      .min(1, 'Customer message cannot be empty')
      .max(500, 'Customer message cannot exceed 500 characters'),
    language: z
      .enum(BRAND.locale.supported, {
        errorMap: () => ({ message: 'Unsupported language. Supported languages are "en" and "am".' }),
      })
      .default('en'),
    conversationHistory: z
      .array(
        z.object({
          role: z.enum(['user', 'assistant'], {
            errorMap: () => ({ message: 'History role must be either "user" or "assistant"' }),
          }),
          content: z.string().trim().min(1).max(1000),
        })
      )
      .max(10, 'Conversation history cannot exceed 10 messages')
      .optional(),
  }),
});

export type ShoppingAssistantInput = z.infer<typeof shoppingAssistantSchema>['body'];

