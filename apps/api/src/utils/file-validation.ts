import { FileError } from './errors';
import path from 'path';
import crypto from 'crypto';

// Maximum allowed file size (2MB by default)
export const MAX_FILE_SIZE = 2 * 1024 * 1024;

// Minimum allowed file size (10 bytes to avoid empty files)
export const MIN_FILE_SIZE = 10;

// Supported mime types for various content
export const SUPPORTED_MIME_TYPES = {
  // Images
  image: [
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp', 
    'image/svg+xml',
    'image/tiff'
  ],
  // Videos
  video: [
    'video/mp4', 
    'video/webm', 
    'video/ogg',
    'video/quicktime'
  ],
  // Other supported formats
  other: [
    'application/octet-stream'  // For binary files
  ]
};

// Dangerous file extensions to block
export const BLOCKED_EXTENSIONS = [
  // Executable files
  'exe', 'dll', 'bat', 'cmd', 'sh', 'ps1',
  // Scripts
  'js', 'php', 'py', 'pl', 'rb',
  // System files
  'sys', 'com',
  // Archives that might contain dangerous files
  'zip', 'rar', '7z', 'tar', 'gz'
];

// Get all supported mime types as a flat array
export const ALL_SUPPORTED_MIME_TYPES = [
  ...SUPPORTED_MIME_TYPES.image,
  ...SUPPORTED_MIME_TYPES.video,
  ...SUPPORTED_MIME_TYPES.other
];

/**
 * Validate file size, throws FileError if file exceeds max size
 * @param size File size in bytes
 * @param maxSize Maximum allowed size in bytes (defaults to MAX_FILE_SIZE)
 */
export function validateFileSize(size: number, maxSize = MAX_FILE_SIZE): void {
  if (size > maxSize) {
    throw new FileError(
      `File too large. Maximum size is ${(maxSize / (1024 * 1024)).toFixed(1)}MB`
    );
  }
}

/**
 * Validate file MIME type, throws FileError if unsupported
 * @param mimeType MIME type to validate
 * @param allowedTypes Array of allowed MIME types (defaults to ALL_SUPPORTED_MIME_TYPES)
 */
export function validateFileMimeType(
  mimeType: string, 
  allowedTypes = ALL_SUPPORTED_MIME_TYPES
): void {
  if (!mimeType || !allowedTypes.includes(mimeType)) {
    throw new FileError(`Unsupported file type: ${mimeType}`);
  }
}

/**
 * Validate file extension, throws FileError if extension is blocked
 * @param filename Original filename to validate
 */
export function validateFileExtension(filename: string): void {
  const ext = path.extname(filename).toLowerCase().replace('.', '');
  
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    throw new FileError(`File type not allowed: .${ext}`);
  }
}

/**
 * Generate a secure random ID for a file
 * @returns A unique file ID
 */
export function generateSecureFileId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Comprehensive file validation (size, type, extension)
 * @param file Express Multer file object
 * @param options Validation options
 */
export function validateFile(
  file: Express.Multer.File,
  options: {
    maxSize?: number;
    minSize?: number;
    allowedTypes?: string[];
  } = {}
): void {
  const { 
    maxSize = MAX_FILE_SIZE, 
    minSize = MIN_FILE_SIZE,
    allowedTypes = ALL_SUPPORTED_MIME_TYPES 
  } = options;
  
  // Validate file existence
  if (!file || !file.buffer) {
    throw new FileError('Invalid file provided');
  }
  
  // Validate file size (both min and max)
  if (file.size < minSize) {
    throw new FileError(`File too small. Minimum size is ${minSize} bytes`);
  }
  
  validateFileSize(file.size, maxSize);
  
  // Validate MIME type
  validateFileMimeType(file.mimetype, allowedTypes);
  
  // Validate file extension
  validateFileExtension(file.originalname);
}
