import { z } from 'zod';

const normalizeApiBaseUrl = (url?: string): string => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return '/api';
  }
  return url.trim().replace(/\/+$/, '');
};

const clientEnvSchema = z.object({
  VITE_API_BASE_URL: z.string().transform(normalizeApiBaseUrl).default('/api'),
  VITE_APP_NAME: z.string().default('ShopNest Ethiopia'),
  VITE_DEFAULT_LANGUAGE: z.enum(['en', 'am']).default('en'),
});

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;

const parsed = clientEnvSchema.safeParse({
  VITE_API_BASE_URL: rawBaseUrl,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  VITE_DEFAULT_LANGUAGE: import.meta.env.VITE_DEFAULT_LANGUAGE,
});

if (!parsed.success) {
  console.warn('Frontend environment variables validation warning:', parsed.error.format());
}

export const clientEnv = parsed.success
  ? parsed.data
  : {
      VITE_API_BASE_URL: normalizeApiBaseUrl(rawBaseUrl),
      VITE_APP_NAME: 'ShopNest Ethiopia',
      VITE_DEFAULT_LANGUAGE: 'en' as const,
    };
