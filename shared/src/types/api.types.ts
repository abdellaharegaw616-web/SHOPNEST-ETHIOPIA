/**
 * Standard API response interfaces
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export type DatabaseConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'disconnecting';

export interface HealthCheckData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number; // in seconds
  timestamp: string;
  environment: string;
  version: string;
  database: {
    status: DatabaseConnectionStatus;
    name?: string;
    host?: string;
  };
  system: {
    memoryUsageMB: number;
    nodeVersion: string;
    platform: string;
  };
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: ApiErrorDetail[];
  statusCode: number;
  timestamp: string;
}
