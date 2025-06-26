import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';

/**
 * Logger configuration based on environment
 *
 * - Development: Colorized console output with detailed formatting
 * - Production: JSON formatted logs to files with daily rotation
 * - Test: Minimal console output
 */

// Define log directory
const LOG_DIR = path.join(process.cwd(), 'logs');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Define custom log levels (npm levels)
const levels = {
  error: 0, // Critical errors that need immediate attention
  warn: 1, // Warning conditions
  info: 2, // Informational messages highlighting application progress
  http: 3, // HTTP request logs
  debug: 4, // Detailed debug information
  silly: 5, // Extremely detailed information
};

// Define colors for log levels
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
  silly: 'gray',
};

// Add colors to winston
winston.addColors(colors);

/**
 * Define logging format based on environment
 */
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    // Extract known properties to exclude from metadata
    const { timestamp, level, message, splat, stack, ...meta } = info;
    
    // Check if there's any metadata to print
    const metadataStr = Object.keys(meta).length 
      ? ` | ${JSON.stringify(meta)}`
      : '';
    
    // Include stack trace if available
    const stackStr = stack ? `\n${stack}` : '';
    
    return `${timestamp} [${level}]: ${message}${stackStr}${metadataStr}`;
  }),
);

const productionFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

const testFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.simple(),
);

/**
 * Get the log level based on environment
 */
const getLogLevel = (): string => {
  const env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return 'info';
    case 'test':
      return 'error';
    default:
      return 'debug';
  }
};

/**
 * Create transports based on environment
 */
const getTransports = () => {
  const env = process.env.NODE_ENV || 'development';

  const transports: winston.transport[] = [];

  // Console transport - used in all environments
  transports.push(
    new winston.transports.Console({
      level: getLogLevel(),
      format:
        env === 'production'
          ? winston.format.combine(winston.format.colorize(), winston.format.simple())
          : env === 'test'
          ? testFormat
          : developmentFormat,
    }),
  );

  // File transports - used in production
  if (env === 'production') {
    // Combined log file
    transports.push(
      new winston.transports.File({
        filename: path.join(LOG_DIR, 'combined.log'),
        level: getLogLevel(),
        format: productionFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
    );

    // Error log file
    transports.push(
      new winston.transports.File({
        filename: path.join(LOG_DIR, 'error.log'),
        level: 'error',
        format: productionFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
    );

    // HTTP log file
    transports.push(
      new winston.transports.File({
        filename: path.join(LOG_DIR, 'http.log'),
        level: 'http',
        format: productionFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
    );
  }

  return transports;
};

/**
 * Create the Winston logger instance
 */
const logger = winston.createLogger({
  level: getLogLevel(),
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  defaultMeta: { service: 'meme-dock-api' },
  transports: getTransports(),
  // Handle uncaught exceptions and unhandled rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'exceptions.log'),
      format: productionFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === 'production'
          ? winston.format.combine(winston.format.colorize(), winston.format.simple())
          : developmentFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'rejections.log'),
      format: productionFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === 'production'
          ? winston.format.combine(winston.format.colorize(), winston.format.simple())
          : developmentFormat,
    }),
  ],
  exitOnError: false, // Don't exit on handled exceptions
});

/**
 * Create a child logger with additional metadata
 *
 * @param meta - Additional metadata to attach to logs
 * @returns A child logger instance
 */
export const createChildLogger = (meta: Record<string, unknown>) => {
  return logger.child(meta);
};

/**
 * HTTP request logger middleware for Express
 */
export const requestLogger = (req: Request, res: Response, next: () => void) => {
  const start = Date.now();
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    const meta = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: res.get('Content-Length') || 0,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
    };

    // Log requests based on status code
    if (res.statusCode >= 500) {
      logger.error(`${req.method} ${req.url} ${res.statusCode}`, meta);
    } else if (res.statusCode >= 400) {
      logger.warn(`${req.method} ${req.url} ${res.statusCode}`, meta);
    } else {
      logger.http(`${req.method} ${req.url} ${res.statusCode}`, meta);
    }
  });

  next();
};

// Export the logger as default and other named exports
export default logger;
