import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './utils/logger';
import { BRAND } from '@shopnest/shared';

const bootstrap = async (): Promise<void> => {
  logger.info(`Starting ${BRAND.name} API server...`);
  logger.info(`Environment: ${env.NODE_ENV}`);

  // Connect to MongoDB
  await connectDatabase();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 ${BRAND.name} backend listening on http://localhost:${env.PORT}`);
    logger.info(`Health check available at http://localhost:${env.PORT}/api/health`);
  });

  const gracefulShutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      logger.info('HTTP server closed');
      await disconnectDatabase();
      process.exit(0);
    });

    // Force shutdown after timeout
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully terminating');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

bootstrap().catch((err) => {
  logger.error('Fatal bootstrap error:', err);
  process.exit(1);
});
