import { z } from 'zod';

const clientEnvSchema = z.object({
  VITE_API_BASE_URL: z.string().default('/api'),
  VITE_APP_NAME: z.string().default('ShopNest Ethiopia'),
  VITE_DEFAULT_LANGUAGE: z.enum(['en', 'am']).default('en'),
});

const parsed = clientEnvSchema.safeParse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  VITE_DEFAULT_LANGUAGE: import.meta.env.VITE_DEFAULT_LANGUAGE,
});

if (!parsed.success) {
  console.warn('Frontend environment variables validation warning:', parsed.error.format());
}

export const clientEnv = parsed.success
  ? parsed.data
  : {
      VITE_API_BASE_URL: '/api',
      VITE_APP_NAME: 'ShopNest Ethiopia',
      VITE_DEFAULT_LANGUAGE: 'en' as const,
    };
