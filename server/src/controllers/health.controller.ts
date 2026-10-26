import { Request, Response } from 'express';
import { getDatabaseStatus } from '../config/database';
import { env } from '../config/env';
import { ApiResponse, HealthCheckData } from '@shopnest/shared';

const SERVER_START_TIME = Date.now();

export const getHealth = (_req: Request, res: Response<ApiResponse<HealthCheckData>>): void => {
  const dbStatus = getDatabaseStatus();
  const uptimeSeconds = Math.floor((Date.now() - SERVER_START_TIME) / 1000);
  const memoryUsageMB = Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;

  // If database is connected, status is healthy; if disconnected or connecting, degraded
  const overallStatus = dbStatus.status === 'connected' ? 'healthy' : 'degraded';

  const healthData: HealthCheckData = {
    status: overallStatus,
    uptime: uptimeSeconds,
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '1.0.0',
    database: dbStatus,
    system: {
      memoryUsageMB,
      nodeVersion: process.version,
      platform: process.platform,
    },
  };

  res.status(200).json({
    success: true,
    message: overallStatus === 'healthy' 
      ? 'ShopNest Ethiopia API is operational and database connected' 
      : 'ShopNest Ethiopia API is operational (database in degraded state)',
    data: healthData,
    timestamp: new Date().toISOString(),
  });
};
