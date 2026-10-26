import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { ApiErrorResponse } from '@shopnest/shared';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response<ApiErrorResponse>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const timestamp = new Date().toISOString();

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    logger.warn(`Validation Error on ${req.method} ${req.originalUrl}:`, err.issues);
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      })),
      statusCode: 400,
      timestamp,
    });
    return;
  }

  // Handle AppError (custom operational errors)
  if (err instanceof AppError) {
    logger.warn(`Operational Error (${err.statusCode}): ${err.message}`);
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode,
      timestamp,
    });
    return;
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId format)
  if ((err as any).name === 'CastError') {
    logger.warn(`Mongoose CastError on ${req.method} ${req.originalUrl}: ${(err as any).message}`);
    res.status(400).json({
      success: false,
      message: `Invalid identifier format: ${(err as any).value}`,
      statusCode: 400,
      timestamp,
    });
    return;
  }

  // Handle unhandled unexpected errors
  logger.error(`Unhandled Exception on ${req.method} ${req.originalUrl}:`, err.stack || err.message);

  const message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  res.status(500).json({
    success: false,
    message,
    error: env.NODE_ENV === 'development' ? err.stack : undefined,
    statusCode: 500,
    timestamp,
  });
};

export const notFoundHandler = (req: Request, res: Response<ApiErrorResponse>): void => {
  const timestamp = new Date().toISOString();
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`,
    statusCode: 404,
    timestamp,
  });
};
