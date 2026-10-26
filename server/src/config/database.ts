import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';
import { DatabaseConnectionStatus } from '@shopnest/shared';

// Filter out root DNS servers that buggy local network resolvers leak into A-record responses
const BOGUS_DNS_IPS = new Set([
  '198.41.0.4',
  '199.9.14.201',
  '192.33.4.12',
  '199.7.91.13',
  '192.203.230.10',
  '192.5.5.241',
  '192.112.36.4',
  '198.97.190.53',
  '192.36.148.17',
  '192.58.128.30',
  '193.0.14.129',
  '199.7.83.42',
  '202.12.27.33',
]);

export const cleanLookup: any = (hostname: string, options: any, callback: any) => {
  const cb = typeof options === 'function' ? options : callback;
  const opts = typeof options === 'function' ? {} : options;

  dns.lookup(hostname, { ...opts, all: true }, (err, addresses: any) => {
    if (err) {
      return cb(err);
    }
    const filtered = (addresses as Array<{ address: string; family: number }>).filter(
      (a) => !BOGUS_DNS_IPS.has(a.address)
    );
    const valid = filtered.length > 0 ? filtered : addresses;

    if (opts.all) {
      cb(null, valid);
    } else {
      cb(null, valid[0].address, valid[0].family);
    }
  });
};

export const connectDatabase = async (): Promise<void> => {
  try {
    mongoose.connection.on('connected', () => {
      logger.info(`MongoDB connected successfully to ${mongoose.connection.host}`);
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error encountered:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection disconnected');
    });

    await mongoose.connect(env.MONGODB_URI, {
      lookup: cleanLookup as any,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(`Could not establish initial MongoDB connection (${message}). Server running in degraded mode.`);
  }
};

export const getDatabaseStatus = (): {
  status: DatabaseConnectionStatus;
  name?: string;
  host?: string;
} => {
  const readyState = mongoose.connection.readyState;
  let status: DatabaseConnectionStatus = 'disconnected';

  switch (readyState) {
    case 1:
      status = 'connected';
      break;
    case 2:
      status = 'connecting';
      break;
    case 3:
      status = 'disconnecting';
      break;
    default:
      status = 'disconnected';
  }

  return {
    status,
    name: mongoose.connection.name || undefined,
    host: mongoose.connection.host || undefined,
  };
};

export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected gracefully');
  }
};
