import { storage, MEME_BUCKET_ID, ID } from '../config/appwrite';
import { InputFile } from 'node-appwrite/file';
import { FileError, ConfigError } from '../utils/errors';
import { validateFile, generateSecureFileId } from '../utils/file-validation';
import { createChildLogger } from '../utils/logger';

// Create a service-specific logger
const logger = createChildLogger({ service: 'FileService' });

interface FileUploadOptions {
  permissions?: string[];
  fileId?: string;
}

interface FileMetadata {
  $id: string;
  bucketId: string;
  name: string;
  mimeType: string;
  sizeOriginal: number;
  chunksTotal: number;
  chunksUploaded: number;
}

/**
 * Upload a file to Appwrite Storage
 * @param file Express file upload from multer or similar middleware
 * @param options Upload options like permissions
 * @returns File metadata
 */
export async function uploadFile(
  file: Express.Multer.File,
  options: FileUploadOptions = {},
): Promise<FileMetadata> {
  try {
    if (!MEME_BUCKET_ID) {
      throw new ConfigError('APPWRITE_MEME_BUCKET_ID not configured');
    }
    // Validate the file using our utility
    validateFile(file);

    // Create a unique ID or use provided one - use our secure ID generator for local IDs
    // We still allow Appwrite's ID.unique() as a fallback, but prefer our more secure method
    const fileId = options.fileId || generateSecureFileId() || ID.unique();

    // Create Appwrite InputFile from the Express file
    const fileInput = InputFile.fromBuffer(file.buffer, file.originalname);

    // Upload the file to Appwrite Storage
    const result = await storage.createFile(MEME_BUCKET_ID, fileId, fileInput, options.permissions); // Log successful upload
    logger.info('File uploaded successfully', {
      fileId: result.$id,
      fileName: result.name,
      mimeType: result.mimeType,
      size: result.sizeOriginal,
    });

    return result;
  } catch (error) {
    logger.error('Failed to upload file', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    });

    // Rethrow AppErrors as is, wrap other errors
    if (error instanceof ConfigError || error instanceof FileError) {
      throw error;
    } else {
      throw new FileError(error instanceof Error ? error.message : 'Unknown file upload error');
    }
  }
}

/**
 * Upload multiple files to Appwrite Storage
 * @param files Array of Express files from multer or similar middleware
 * @param options Upload options like permissions
 * @returns Array of file metadata
 */
export async function uploadMultipleFiles(
  files: Express.Multer.File[],
  options: FileUploadOptions = {},
): Promise<FileMetadata[]> {
  try {
    if (!Array.isArray(files) || files.length === 0) {
      throw new FileError('No files provided for upload');
    }

    // Optional: Validate max number of files
    const MAX_FILES = 20;
    if (files.length > MAX_FILES) {
      throw new FileError(`Too many files. Maximum allowed is ${MAX_FILES}`);
    }

    // Validate each file before attempting to upload any
    files.forEach((file) => validateFile(file));

    // If all validations pass, proceed with upload
    const uploadPromises = files.map((file) => uploadFile(file, options));
    return Promise.all(uploadPromises);
  } catch (error) {
    logger.error('Error uploading multiple files', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      fileCount: files.length,
    });

    // Rethrow AppErrors as is, wrap other errors
    if (error instanceof ConfigError || error instanceof FileError) {
      throw error;
    } else {
      throw new FileError(
        error instanceof Error ? error.message : 'Unknown error uploading multiple files',
      );
    }
  }
}

/**
 * Get file metadata from Appwrite Storage
 * @param fileId ID of the file to retrieve
 * @returns File metadata
 */
export async function getFileMetadata(fileId: string): Promise<FileMetadata> {
  try {
    if (!fileId || typeof fileId !== 'string') {
      throw new FileError('Invalid file ID provided');
    }

    if (!MEME_BUCKET_ID) {
      throw new ConfigError('APPWRITE_MEME_BUCKET_ID not configured');
    }

    const file = await storage.getFile(MEME_BUCKET_ID, fileId);
    return file;
  } catch (error) {
    logger.error('Error getting file metadata', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      fileId,
    });
    // Rethrow AppErrors as is, wrap other errors
    if (error instanceof ConfigError || error instanceof FileError) {
      throw error;
    } else {
      throw new FileError(
        error instanceof Error
          ? `Error fetching file metadata: ${error.message}`
          : 'Unknown error fetching file metadata',
      );
    }
  }
}

/**
 * List files in the meme bucket with optional filtering
 * @param options Listing options like limit and offset
 * @returns List of files metadata
 */
export async function listFiles(options: { limit?: number; offset?: number } = {}) {
  try {
    if (!MEME_BUCKET_ID) {
      throw new ConfigError('APPWRITE_MEME_BUCKET_ID not configured');
    }

    // Validate pagination parameters
    if (options.limit !== undefined && (isNaN(options.limit) || options.limit < 0)) {
      throw new FileError('Invalid limit parameter');
    }

    if (options.offset !== undefined && (isNaN(options.offset) || options.offset < 0)) {
      throw new FileError('Invalid offset parameter');
    }
    // Note: Appwrite storage.listFiles doesn't directly support limit/offset as parameters
    // Instead, it uses queries which we're not implementing in this basic version
    // In a more advanced implementation, we could use query parameters here
    const files = await storage.listFiles(MEME_BUCKET_ID);

    // Handle pagination manually since Appwrite doesn't support it directly in this API
    if (options.offset !== undefined || options.limit !== undefined) {
      const start = options.offset || 0;
      const end = options.limit ? start + options.limit : undefined;
      if (files.files) {
        // If files has a files property, apply pagination to it
        files.files = files.files.slice(start, end);
      }
    }

    return files;
  } catch (error) {
    logger.error('Error listing files', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...options,
    });
    // Rethrow AppErrors as is, wrap other errors
    if (error instanceof ConfigError || error instanceof FileError) {
      throw error;
    } else {
      throw new FileError(
        error instanceof Error
          ? `Error listing files: ${error.message}`
          : 'Unknown error listing files',
      );
    }
  }
}

/**
 * Delete a file from Appwrite Storage
 * @param fileId ID of the file to delete
 * @returns Success status
 */
export async function deleteFile(fileId: string): Promise<void> {
  try {
    if (!fileId || typeof fileId !== 'string') {
      throw new FileError('Invalid file ID provided');
    }

    if (!MEME_BUCKET_ID) {
      throw new ConfigError('APPWRITE_MEME_BUCKET_ID not configured');
    }

    await storage.deleteFile(MEME_BUCKET_ID, fileId);
  } catch (error) {
    logger.error('Error deleting file', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      fileId,
    });

    // Rethrow AppErrors as is, wrap other errors
    if (error instanceof ConfigError || error instanceof FileError) {
      throw error;
    } else {
      throw new FileError(
        error instanceof Error
          ? `Error deleting file: ${error.message}`
          : 'Unknown error deleting file',
      );
    }
  }
}

/**
 * Get file download URL
 * @param fileId ID of the file to download
 * @returns File download URL
 */
export function getFileDownloadURL(fileId: string): string {
  if (!fileId || typeof fileId !== 'string') {
    throw new FileError('Invalid file ID provided');
  }

  if (!MEME_BUCKET_ID) {
    throw new ConfigError('APPWRITE_MEME_BUCKET_ID not configured');
  }

  try {
    return storage.getFileDownload(MEME_BUCKET_ID, fileId).toString();
  } catch (error) {
    logger.error('Error getting file download URL', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      fileId,
    });

    // Rethrow AppErrors as is, wrap other errors
    if (error instanceof ConfigError || error instanceof FileError) {
      throw error;
    } else {
      throw new FileError(
        error instanceof Error
          ? `Error getting download URL: ${error.message}`
          : 'Unknown error getting download URL',
      );
    }
  }
}

/**
 * Get file preview URL with optional transformations
 * @param fileId ID of the file
 * @param options Preview options like width, height, etc.
 * @returns Preview URL
 */
export function getFilePreviewURL(
  fileId: string,
  options: { width?: number; height?: number; quality?: number } = {},
): string {
  if (!fileId || typeof fileId !== 'string') {
    throw new FileError('Invalid file ID provided');
  }

  if (!MEME_BUCKET_ID) {
    throw new ConfigError('APPWRITE_MEME_BUCKET_ID not configured');
  }

  try {
    // Validate dimension parameters if provided
    if (options.width !== undefined && (isNaN(options.width) || options.width < 1)) {
      throw new FileError('Invalid width parameter');
    }

    if (options.height !== undefined && (isNaN(options.height) || options.height < 1)) {
      throw new FileError('Invalid height parameter');
    }

    const { width, height } = options;

    // Appwrite SDK: getFilePreview(bucketId, fileId, width?, height?)
    return storage.getFilePreview(MEME_BUCKET_ID, fileId, width, height).toString();
  } catch (error) {
    logger.error('Error getting file preview URL', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      fileId,
      width: options.width,
      height: options.height,
    });

    // Rethrow AppErrors as is, wrap other errors
    if (error instanceof ConfigError || error instanceof FileError) {
      throw error;
    } else {
      throw new FileError(
        error instanceof Error
          ? `Error getting preview URL: ${error.message}`
          : 'Unknown error getting preview URL',
      );
    }
  }
}

/**
 * Get file view URL
 * @param fileId ID of the file
 * @returns View URL
 */
export function getFileViewURL(fileId: string): string {
  if (!fileId || typeof fileId !== 'string') {
    throw new FileError('Invalid file ID provided');
  }

  if (!MEME_BUCKET_ID) {
    throw new ConfigError('APPWRITE_MEME_BUCKET_ID not configured');
  }

  try {
    return storage.getFileView(MEME_BUCKET_ID, fileId).toString();
  } catch (error) {
    logger.error('Error getting file view URL', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      fileId,
    });

    // Rethrow AppErrors as is, wrap other errors
    if (error instanceof ConfigError || error instanceof FileError) {
      throw error;
    } else {
      throw new FileError(
        error instanceof Error
          ? `Error getting view URL: ${error.message}`
          : 'Unknown error getting view URL',
      );
    }
  }
}
