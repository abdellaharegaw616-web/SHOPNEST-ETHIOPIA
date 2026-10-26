import { env } from '../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

class Logger {
  private currentWeight: number;

  constructor() {
    this.currentWeight = LEVEL_WEIGHT[env.LOG_LEVEL] ?? LEVEL_WEIGHT.info;
  }

  private formatMessage(level: LogLevel, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` | Meta: ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [ShopNest-Server]: ${message}${metaString}`;
  }

  debug(message: string, meta?: unknown): void {
    if (this.currentWeight <= LEVEL_WEIGHT.debug) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }

  info(message: string, meta?: unknown): void {
    if (this.currentWeight <= LEVEL_WEIGHT.info) {
      console.log(this.formatMessage('info', message, meta));
    }
  }

  warn(message: string, meta?: unknown): void {
    if (this.currentWeight <= LEVEL_WEIGHT.warn) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  error(message: string, meta?: unknown): void {
    if (this.currentWeight <= LEVEL_WEIGHT.error) {
      console.error(this.formatMessage('error', message, meta));
    }
  }
}

export const logger = new Logger();
