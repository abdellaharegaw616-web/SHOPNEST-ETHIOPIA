import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from server directory or root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/shopnest_ethiopia'),
  TEST_MONGODB_URI: z.string().default('mongodb://localhost:27017/shopnest_ethiopia_test'),
  JWT_SECRET: z.string().min(16).default('dev_secret_key_shopnest_ethiopia_2026_secure'),
  JWT_ACCESS_SECRET: z.string().min(16).default('dev_jwt_access_secret_shopnest_ethiopia_32_chars_min'),
  JWT_REFRESH_SECRET: z.string().min(16).default('dev_jwt_refresh_secret_shopnest_ethiopia_32_chars_min'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().min(16).default('dev_cookie_signing_secret_shopnest_2026'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables configuration:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  throw new Error('Environment configuration validation failed');
}

export const env = parsed.data;
export type EnvConfig = z.infer<typeof envSchema>;
