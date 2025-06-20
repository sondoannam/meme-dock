import {
  storage,
  MEME_BUCKET_ID,
  ID,
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
} from '../../config/appwrite';
import { InputFile } from 'node-appwrite/file';
import { ConfigError, FileError } from '../../utils/errors';
import {
  validateImageFile,
  generateSecureFileId,
} from '../../utils/file-validation';
import {
  ImageMetadata,
  ImageUploadOptions,
  ImageListOptions,
  ImageListResponse,
  ImagePlatformService,
  ImagePreviewOptions,
} from './image-platform.interface';
import { createValidationOptions } from './image.service';
import { createServiceLogger } from '../../utils/logger-utils';

/**
 * Appwrite implementation of the ImagePlatformService
 */
export class AppwriteImageService implements ImagePlatformService {
  private logger = createServiceLogger('AppwriteImageService');
  /**
   * Upload a single image file to Appwrite Storage
   */
  async uploadImage(
    file: Express.Multer.File,
    options: ImageUploadOptions = {},
  ): Promise<ImageMetadata> {
    try {
      // Create validation options by merging defaults with provided options
      const validationOptions = createValidationOptions(options);

      // Validate the file using our image-specific utility
      validateImageFile(file, validationOptions);

      // Create a unique ID or use provided one
      const useUniqueFileName = options.useUniqueFileName !== false;
      const fileName = options.fileName || file.originalname;
      const fileId = useUniqueFileName ? generateSecureFileId() || ID.unique() : fileName;

      // Create Appwrite InputFile from the Express file
      const fileInput = InputFile.fromBuffer(file.buffer, fileName);

      // Prepare permissions if needed
      const permissions = options.isPrivate
        ? [] // Empty array means only the owner can access
        : undefined; // Undefined means use bucket default permissions

      // Upload the file to Appwrite Storage
      const result = await storage.createFile(MEME_BUCKET_ID, fileId, fileInput, permissions);

      // Map Appwrite result to our standardized ImageMetadata
      return this.mapAppwriteResultToImageMetadata(result);
    } catch (error) {
      this.logger.error('Error uploading image to Appwrite', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        fileInfo: { 
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        }
      });

      // Rethrow AppErrors as is, wrap other errors
      if (error instanceof ConfigError || error instanceof FileError) {
        throw error;
      } else {
        throw new FileError(error instanceof Error ? error.message : 'Unknown image upload error');
      }
    }
  }

  /**
   * Upload multiple image files to Appwrite Storage
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    options: ImageUploadOptions = {},
  ): Promise<ImageMetadata[]> {
    try {
      if (!Array.isArray(files) || files.length === 0) {
        throw new FileError('No files provided for upload');
      }

      // Optional: Validate max number of files
      const MAX_FILES = 20;
      if (files.length > MAX_FILES) {
        throw new FileError(`Too many files. Maximum allowed is ${MAX_FILES}`);
      }

      const validationOptions = createValidationOptions(options);

      // Validate each file before attempting to upload any
      files.forEach((file) => validateImageFile(file, validationOptions));

      // If all validations pass, proceed with upload
      const uploadPromises = files.map((file) => this.uploadImage(file, options));
      return Promise.all(uploadPromises);
    } catch (error) {
      this.logger.error('Error uploading multiple files to Appwrite', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        filesCount: files.length
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
   * Get metadata for an image by ID from Appwrite Storage
   */
  async getImageMetadata(imageId: string): Promise<ImageMetadata> {
    try {
      if (!imageId || typeof imageId !== 'string') {
        throw new FileError('Invalid image ID provided');
      }

      if (!MEME_BUCKET_ID) {
        throw new ConfigError('APPWRITE_MEME_BUCKET_ID not configured');
      }

      const file = await storage.getFile(MEME_BUCKET_ID, imageId);
      return this.mapAppwriteResultToImageMetadata(file);
    } catch (error) {      this.logger.error('Error getting file metadata from Appwrite', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        imageId
      });

      // Rethrow AppErrors as is, wrap other errors
      if (error instanceof ConfigError || error instanceof FileError) {
        throw error;
      } else {
        throw new FileError(
          error instanceof Error
            ? `Error fetching image metadata: ${error.message}`
            : 'Unknown error fetching image metadata',
        );
      }
    }
  }

  /**
   * List images from Appwrite Storage
   */
  async listImages(options: ImageListOptions = {}): Promise<ImageListResponse> {
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

      // Note: Appwrite storage.listFiles doesn't directly support all our filtering options
      // For a more complete implementation, we'd need to use Queries
      const files = await storage.listFiles(MEME_BUCKET_ID);

      // Handle pagination manually
      let filteredFiles = files.files || [];

      // Apply folder filtering if provided
      if (options.folder) {
        filteredFiles = filteredFiles.filter((file) =>
          (file.$permissions || []).some((perm) => perm.includes(`folder:${options.folder}`)),
        );
      }

      const start = options.offset || 0;
      const end = options.limit ? start + options.limit : undefined;
      const paginatedFiles = filteredFiles.slice(start, end);

      return {
        images: paginatedFiles.map((file) => this.mapAppwriteResultToImageMetadata(file)),
        total: files.total,
        hasMore: end !== undefined && end < files.total,
      };
    } catch (error) {
      this.logger.error('Error listing files from Appwrite', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        options
      });

      // Rethrow AppErrors as is, wrap other errors
      if (error instanceof ConfigError || error instanceof FileError) {
        throw error;
      } else {
        throw new FileError(
          error instanceof Error
            ? `Error listing images: ${error.message}`
            : 'Unknown error listing images',
        );
      }
    }
  }

  /**
   * Delete an image from Appwrite Storage
   */
  async deleteImage(imageId: string): Promise<void> {
    try {
      if (!imageId || typeof imageId !== 'string') {
        throw new FileError('Invalid image ID provided');
      }

      if (!MEME_BUCKET_ID) {
        throw new ConfigError('APPWRITE_MEME_BUCKET_ID not configured');
      }

      await storage.deleteFile(MEME_BUCKET_ID, imageId);
    } catch (error) {
      this.logger.error('Error deleting image from Appwrite', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        imageId
      });

      // Rethrow AppErrors as is, wrap other errors
      if (error instanceof ConfigError || error instanceof FileError) {
        throw error;
      } else {
        throw new FileError(
          error instanceof Error
            ? `Error deleting image: ${error.message}`
            : 'Unknown error deleting image',
        );
      }
    }
  }
  /**
   * Get URL for downloading the original image from Appwrite
   * Returns a direct URL to download the file (with attachment header)
   */
  getImageDownloadURL(imageId: string): string {
    if (!imageId || typeof imageId !== 'string') {
      throw new FileError('Invalid image ID provided');
    }

    if (!MEME_BUCKET_ID || !APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
      throw new ConfigError('Missing required Appwrite configuration');
    }

    try {
      // Construct the URL directly using Appwrite's REST API pattern
      // Format: {endpoint}/storage/buckets/{bucketId}/files/{fileId}/download?project={projectId}
      const endpoint = APPWRITE_ENDPOINT.endsWith('/')
        ? APPWRITE_ENDPOINT.slice(0, -1)
        : APPWRITE_ENDPOINT;
      return `${endpoint}/storage/buckets/${MEME_BUCKET_ID}/files/${imageId}/download?project=${APPWRITE_PROJECT_ID}`;
    } catch (error) {
      this.logger.error('Error constructing download URL for Appwrite file', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        imageId
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
   * Get URL for preview/thumbnail with transformations from Appwrite
   * Returns a direct URL to a preview version of the file with optional transformations
   */
  getImagePreviewURL(imageId: string, options: ImagePreviewOptions = {}): string {
    if (!imageId || typeof imageId !== 'string') {
      throw new FileError('Invalid image ID provided');
    }

    if (!MEME_BUCKET_ID || !APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
      throw new ConfigError('Missing required Appwrite configuration');
    }

    try {
      // Validate dimension parameters if provided
      if (options.width !== undefined && (isNaN(options.width) || options.width < 1)) {
        throw new FileError('Invalid width parameter');
      }

      if (options.height !== undefined && (isNaN(options.height) || options.height < 1)) {
        throw new FileError('Invalid height parameter');
      }

      // Construct the base URL
      // Format: {endpoint}/storage/buckets/{bucketId}/files/{fileId}/preview?project={projectId}
      const endpoint = APPWRITE_ENDPOINT.endsWith('/')
        ? APPWRITE_ENDPOINT.slice(0, -1)
        : APPWRITE_ENDPOINT;
      let url = `${endpoint}/storage/buckets/${MEME_BUCKET_ID}/files/${imageId}/preview?project=${APPWRITE_PROJECT_ID}`;
      // Add optional parameters
      const { width, height, quality, format } = options;

      if (width) url += `&width=${width}`;
      if (height) url += `&height=${height}`;
      if (quality && quality >= 0 && quality <= 100) url += `&quality=${quality}`;
      if (format) url += `&output=${format}`;

      return url;
    } catch (error) {
      this.logger.error('Error constructing preview URL for Appwrite file', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        imageId,
        options
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
   * Get URL for viewing the image from Appwrite
   * Returns a direct URL to view the file in the browser without attachment headers
   */
  getImageViewURL(imageId: string): string {
    if (!imageId || typeof imageId !== 'string') {
      throw new FileError('Invalid image ID provided');
    }

    if (!MEME_BUCKET_ID || !APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
      throw new ConfigError('Missing required Appwrite configuration');
    }

    try {
      // Construct the URL directly using Appwrite's REST API pattern
      // Format: {endpoint}/storage/buckets/{bucketId}/files/{fileId}/view?project={projectId}
      const endpoint = APPWRITE_ENDPOINT.endsWith('/')
        ? APPWRITE_ENDPOINT.slice(0, -1)
        : APPWRITE_ENDPOINT;
      return `${endpoint}/storage/buckets/${MEME_BUCKET_ID}/files/${imageId}/view?project=${APPWRITE_PROJECT_ID}`;
    } catch (error) {
      this.logger.error('Error constructing view URL for Appwrite file', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        imageId
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

  /**
   * Check if Appwrite is properly configured
   */
  isConfigured(): boolean {
    return Boolean(MEME_BUCKET_ID);
  }
  /**
   * Map Appwrite file result to our standardized ImageMetadata interface
   * @param fileData Appwrite file metadata object (Models.File from Appwrite)
   */
  private mapAppwriteResultToImageMetadata(fileData: Record<string, unknown>): ImageMetadata {
    try {
      // Extract core properties with proper type checking
      const id = typeof fileData.$id === 'string' ? fileData.$id : '';
      const name = typeof fileData.name === 'string' ? fileData.name : '';
      const mimeType = typeof fileData.mimeType === 'string' ? fileData.mimeType : '';
      const size = typeof fileData.sizeOriginal === 'number' ? fileData.sizeOriginal : 0;
      const createdAt = typeof fileData.$createdAt === 'string' ? fileData.$createdAt : undefined;
      const updatedAt = typeof fileData.$updatedAt === 'string' ? fileData.$updatedAt : undefined;
      const bucketId = typeof fileData.bucketId === 'string' ? fileData.bucketId : '';
      const signature = typeof fileData.signature === 'string' ? fileData.signature : '';

      // Extract permissions array with type safety
      const permissions = Array.isArray(fileData.$permissions)
        ? (fileData.$permissions.filter((p) => typeof p === 'string') as string[])
        : [];

      // Extract chunksTotal and chunksUploaded for upload status
      const chunksTotal = typeof fileData.chunksTotal === 'number' ? fileData.chunksTotal : 0;
      const chunksUploaded =
        typeof fileData.chunksUploaded === 'number' ? fileData.chunksUploaded : 0;

      // Width and height may not be directly available from Appwrite's Models.File
      // They could be available as custom attributes or need to be extracted elsewhere
      const width = typeof fileData.width === 'number' ? fileData.width : undefined;
      const height = typeof fileData.height === 'number' ? fileData.height : undefined;

      // Extract any custom tags that might be in the permissions in format "tag:tagname"
      const tags = permissions.reduce((acc: string[], permission: string) => {
        if (permission.startsWith('tag:')) {
          acc.push(permission.substring(4)); // Remove "tag:" prefix
        }
        return acc;
      }, []);

      // Compute URLs for the different ways to access the file
      const url = `/images/view/${id}`;
      const downloadUrl = `/images/download/${id}`;
      const thumbnailUrl = `/images/preview/${id}`;

      // Create a full metadata object including all available information
      return {
        id,
        name,
        mimeType,
        size,
        width,
        height,
        url,
        downloadUrl, // Additional convenience property
        thumbnailUrl,
        createdAt,
        updatedAt, // Additional timestamp information
        bucketId, // Useful for debugging and tracking
        signature, // File's MD5 hash for integrity checking
        tags,
        // Check if the file is fully uploaded
        isUploaded: chunksUploaded >= chunksTotal,
        // Additional useful metadata for client applications
        uploadProgress: chunksTotal > 0 ? Math.round((chunksUploaded / chunksTotal) * 100) : 100,
      };
    } catch (error) {      this.logger.error('Error mapping Appwrite file to ImageMetadata', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        fileData: fileData ? { id: fileData.$id } : 'undefined'
      });

      // Fallback with minimal information if mapping fails
      const id = typeof fileData.$id === 'string' ? fileData.$id : '';
      const name = typeof fileData.name === 'string' ? fileData.name : 'unknown';

      return {
        id,
        name,
        mimeType: 'application/octet-stream',
        size: 0,
        url: id ? this.getImageViewURL(id) : '',
      };
    }
  }
}
