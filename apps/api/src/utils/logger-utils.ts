/**
 * Collection of utility functions for working with winston logger
 */

import { Request } from 'express';
import logger from './logger';

/**
 * Extract safe, loggable information from a request object
 * This removes sensitive information like tokens/passwords before logging
 *
 * @param req - Express request object
 * @returns Sanitized request data safe for logging
 */
export function extractRequestInfo(req: Request): Record<string, unknown> {
  return {
    method: req.method,
    url: req.originalUrl,
    params: req.params,
    // Sanitize query params (remove tokens, passwords, etc)
    query: sanitizeObject(req.query),
    // Sanitize body (remove tokens, passwords, etc)
    body: sanitizeObject(req.body),
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.userId || 'anonymous',
    // Add timestamp for request time measurement
    timestamp: Date.now(),
  };
}

/**
 * Sanitize an object by removing sensitive information
 *
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject(
  obj: Record<string, unknown> | unknown,
): Record<string, unknown> | unknown {
  if (!obj || typeof obj !== 'object') return obj;

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  // Create a copy to avoid modifying the original
  const sanitized: Record<string, unknown> = { ...(obj as Record<string, unknown>) };

  // List of sensitive fields to remove/mask
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'authorization',
    'api_key',
    'apiKey',
    'key',
    'jwt',
    'accessToken',
    'refreshToken',
    'auth',
    'credentials',
  ];

  // Recursively sanitize nested objects
  Object.keys(sanitized).forEach((key) => {
    const lowerKey = key.toLowerCase();

    // Check if this key contains sensitive information
    if (sensitiveFields.some((field) => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    }
    // Recursively sanitize nested objects
    else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  });

  return sanitized;
}

/**
 * Log API request information at the start of processing
 *
 * @param req - Express request object
 */
export function logApiRequest(req: Request): void {
  const requestInfo = extractRequestInfo(req);

  logger.http(`API Request: ${req.method} ${req.originalUrl}`, {
    request: requestInfo,
  });
}

/**
 * Log detailed error information with appropriate context
 *
 * @param error - Error object to log
 * @param req - Express request object for context
 * @param message - Optional custom message for the log
 */
export function logError(error: unknown, req?: Request, message?: string): void {
  const logData: Record<string, unknown> = {
    error: {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'UnknownError',
    },
  };

  // Add request context if available
  if (req) {
    logData.request = extractRequestInfo(req);
  }

  const logMessage = message || (error instanceof Error ? error.message : 'An error occurred');

  logger.error(logMessage, logData);
}

/**
 * Create a service logger with consistent naming and context
 *
 * @param serviceName - Name of the service for context
 * @returns Child logger instance for the service
 */
export function createServiceLogger(serviceName: string): typeof logger {
  return logger.child({ service: serviceName });
}

export default {
  logApiRequest,
  logError,
  createServiceLogger,
  sanitizeObject,
  extractRequestInfo,
};
