import { Request, Response, NextFunction } from 'express';
import { isAppError } from '../utils/errors';

/**
 * Global error handling middleware for consistent error responses
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error caught by middleware:', err);

  // Handle our custom AppErrors
  if (isAppError(err)) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.constructor.name
    });
    return;
  }

  // Handle unexpected errors
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong',
    code: 'InternalServerError'
  });
}

/**
 * Middleware to catch async errors in routes
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const catchAsync = (fn: Function) => (req: Request, res: Response, next: NextFunction): void => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
