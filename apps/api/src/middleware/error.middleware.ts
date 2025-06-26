import { Request, Response, NextFunction } from 'express';
import { isAppError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * Global error handling middleware for consistent error responses
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  // Create structured log data
  const logData = {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userId: req.userId || 'anonymous',
    },
  };

  // Handle our custom AppErrors
  if (isAppError(err)) {
    // Use warn level for 4xx errors and error level for 5xx errors
    const logLevel = err.statusCode >= 500 ? 'error' : 'warn';

    logger[logLevel](`${err.constructor.name}: ${err.message}`, logData);

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.constructor.name,
    });
    return;
  }

  // Handle unexpected errors - always use error level for these
  logger.error(`Unexpected error: ${err.message}`, logData);

  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong',
    code: 'InternalServerError',
  });
}

/**
 * Middleware to catch async errors in routes
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
