import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import apiRouter from './routes';

export const createApp = (): Application => {
  const app = express();

  // Security headers with Swagger UI support
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Swagger UI inline assets
    })
  );

  // CORS configuration
  const allowedOrigins = [
    env.CLIENT_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:3000',
  ];

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Guest-Session-Id',
      'x-guest-session-id',
      'Idempotency-Key',
      'idempotency-key',
      'Accept',
      'Origin',
    ],
    exposedHeaders: [
      'Idempotency-Key',
      'idempotency-key',
      'X-Guest-Session-Id',
      'x-guest-session-id',
    ],
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));


  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Cookie parser with secret
  app.use(cookieParser(env.COOKIE_SECRET));

  // NoSQL Injection sanitization
  app.use(mongoSanitize());

  // Logging middleware
  app.use(requestLogger);

  // Mount API router
  app.use('/api', apiRouter);

  // 404 handler
  app.use(notFoundHandler);

  // Central error handler
  app.use(errorHandler);

  return app;
};
