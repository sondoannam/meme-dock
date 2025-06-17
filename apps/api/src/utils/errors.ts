/**
 * Custom error classes for better error handling and reporting
 */

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Maintains proper stack trace for where our error was thrown (only in V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class FileError extends AppError {
  constructor(message: string, statusCode = 400) {
    super(message, statusCode);
    Object.setPrototypeOf(this, FileError.prototype);
  }
}

export class ConfigError extends AppError {
  constructor(message: string) {
    super(message, 500);
    Object.setPrototypeOf(this, ConfigError.prototype);
  }
}

// Error type checking helper
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
