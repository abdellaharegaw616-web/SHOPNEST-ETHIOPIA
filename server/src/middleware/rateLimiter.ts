import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again in 15 minutes',
    statusCode: 429,
    timestamp: new Date().toISOString(),
  },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
    statusCode: 429,
    timestamp: new Date().toISOString(),
  },
});

export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.AI_RATE_LIMIT_MAX || 30, // Limit each IP to configurable quota
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI Shopping Assistant request limit exceeded. Please wait a few moments before trying again.',
    statusCode: 429,
    timestamp: new Date().toISOString(),
  },
});

