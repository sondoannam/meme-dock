import { Request, Response, NextFunction } from 'express';
import { validateFile } from '../utils/file-validation';
import { FileError } from '../utils/errors';

/**
 * Middleware to validate a single file upload
 */
export function validateSingleFile(
  req: Request, 
  res: Response, 
  next: NextFunction
): void {
  try {
    if (!req.file) {
      throw new FileError('No file uploaded');
    }
    
    validateFile(req.file);
    next();
  } catch (error) {
    next(error); // Pass to error handling middleware
  }
}

/**
 * Middleware to validate multiple file uploads
 * @param maxFiles Maximum number of files allowed
 */
export function validateMultipleFiles(maxFiles = 20) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new FileError('No files uploaded');
      }
      
      if (req.files.length > maxFiles) {
        throw new FileError(`Too many files. Maximum allowed is ${maxFiles}`);
      }
      
      // Validate each file
      req.files.forEach(file => validateFile(file));
      next();
    } catch (error) {
      next(error); // Pass to error handling middleware
    }
  };
}
