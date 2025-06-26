import { UploadOptions } from 'imagekit/dist/libs/interfaces';
import { getImageKit, IMAGEKIT_CONFIG } from '../../config/imagekit';
import { ConfigError, FileError } from '../../utils/errors';
import { validateImageFile } from '../../utils/file-validation';
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
 * Type definition for generic ImageKit file data (common properties across different responses)
 */
/**
 * Note on ImageKit response types:
 *
 * The ImageKit SDK returns different response objects (UploadResponse, FileObject, etc.)
 * depending on which API is called. These types don't include an index signature,
 * which causes TypeScript compatibility issues when using them with our mapper function.
 *
 * We use a type assertion (as unknown as Record<string, unknown>) to safely handle these
 * responses in a consistent way. The mapper function extracts and validates each property
 * individually to ensure type safety.
 */

/**
 * ImageKit implementation of the ImagePlatformService
 */
export class ImageKitImageService implements ImagePlatformService {
  private logger = createServiceLogger('ImageKitImageService');
  /**
   * Upload a single image file to ImageKit
   */
  async uploadImage(
    file: Express.Multer.File,
    options: ImageUploadOptions = {},
  ): Promise<ImageMetadata> {
    try {
      if (!this.isConfigured()) {
        throw new ConfigError('ImageKit configuration is missing');
      }

      // Create validation options by merging defaults with provided options
      const validationOptions = createValidationOptions(options);

      // Validate the file using our image-specific utility
      validateImageFile(file, validationOptions);

      // Determine file name and unique identifier strategy
      const useUniqueFileName = options.useUniqueFileName !== false;
      const fileName = options.fileName || file.originalname;

      const imagekit = getImageKit();

      // Prepare upload parameters
      const uploadParams: UploadOptions = {
        file: file.buffer, // Binary buffer data
        fileName: fileName,
        useUniqueFileName: useUniqueFileName,
      };

      // Add optional parameters if specified
      if (options.folder) {
        uploadParams.folder = options.folder;
      }

      if (options.tags && Array.isArray(options.tags) && options.tags.length > 0) {
        uploadParams.tags = options.tags;
      }

      if (options.isPrivate) {
        uploadParams.isPrivateFile = true;
      }

      if (options.customMetadata) {
        uploadParams.customMetadata = options.customMetadata;
      } // Perform the upload
      const result = await imagekit.upload(uploadParams);

      // Map ImageKit result to our standardized ImageMetadata using type assertion
      // This is necessary because ImageKit types don't include index signature
      return this.mapImageKitResultToImageMetadata(result as unknown as Record<string, unknown>);
    } catch (error) {
      this.logger.error('Error uploading image to ImageKit', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        fileInfo: {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        },
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
   * Upload multiple image files to ImageKit
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

      // Create validation options by merging defaults with provided options
      const validationOptions = createValidationOptions(options);

      // Validate each file before attempting to upload any
      files.forEach((file) => validateImageFile(file, validationOptions));

      // If all validations pass, proceed with upload
      const uploadPromises = files.map((file) => this.uploadImage(file, options));
      return Promise.all(uploadPromises);
    } catch (error) {
      this.logger.error('Error uploading multiple files to ImageKit', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        filesCount: files.length,
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
   * Get metadata for an image by ID from ImageKit
   */
  async getImageMetadata(imageId: string): Promise<ImageMetadata> {
    try {
      if (!imageId || typeof imageId !== 'string') {
        throw new FileError('Invalid image ID provided');
      }

      if (!this.isConfigured()) {
        throw new ConfigError('ImageKit configuration is missing');
      }
      const imagekit = getImageKit();
      const fileDetails = await imagekit.getFileDetails(imageId);

      return this.mapImageKitResultToImageMetadata(
        fileDetails as unknown as Record<string, unknown>,
      );
    } catch (error) {
      this.logger.error('Error getting image metadata from ImageKit', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        imageId,
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
   * List images from ImageKit
   */
  async listImages(options: ImageListOptions = {}): Promise<ImageListResponse> {
    try {
      if (!this.isConfigured()) {
        throw new ConfigError('ImageKit configuration is missing');
      }

      const imagekit = getImageKit();

      // Prepare listing parameters
      const listParams: Record<string, unknown> = {};

      // Add optional parameters if specified
      if (options.limit) {
        listParams.limit = options.limit;
      }

      if (options.offset) {
        listParams.skip = options.offset;
      }

      if (options.folder) {
        listParams.path = options.folder;
      }

      if (options.searchQuery) {
        listParams.name = options.searchQuery;
      }

      if (options.tags && options.tags.length > 0) {
        listParams.tags = options.tags;
      }

      // Execute the file listing
      const files = await imagekit.listFiles(listParams);
      return {
        images: files.map((file) =>
          this.mapImageKitResultToImageMetadata(file as unknown as Record<string, unknown>),
        ),
        total: files.length,
        hasMore: false, // ImageKit API doesn't provide this information directly
      };
    } catch (error) {
      this.logger.error('Error listing files from ImageKit', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        options,
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
   * Delete an image from ImageKit
   */
  async deleteImage(imageId: string): Promise<void> {
    try {
      if (!imageId || typeof imageId !== 'string') {
        throw new FileError('Invalid image ID provided');
      }

      if (!this.isConfigured()) {
        throw new ConfigError('ImageKit configuration is missing');
      }

      const imagekit = getImageKit();
      await imagekit.deleteFile(imageId);
    } catch (error) {
      this.logger.error('Error deleting image from ImageKit', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        imageId,
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
   * Get URL for downloading the original image from ImageKit
   */
  getImageDownloadURL(imageId: string): string {
    if (!imageId || typeof imageId !== 'string') {
      throw new FileError('Invalid image ID provided');
    }

    if (!this.isConfigured()) {
      throw new ConfigError('ImageKit configuration is missing');
    }

    try {
      // For ImageKit, we need to add a download parameter to the URL
      // We'll use the URL endpoint from config and the file ID
      return `${IMAGEKIT_CONFIG.urlEndpoint}/${imageId}?download=true`;
    } catch (error) {
      this.logger.error('Error getting image download URL from ImageKit', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        imageId,
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
   * Get URL for preview/thumbnail with transformations from ImageKit
   */
  getImagePreviewURL(imageId: string, options: ImagePreviewOptions = {}): string {
    if (!imageId || typeof imageId !== 'string') {
      throw new FileError('Invalid image ID provided');
    }

    if (!this.isConfigured()) {
      throw new ConfigError('ImageKit configuration is missing');
    }

    try {
      const imagekit = getImageKit();

      // Build transformation object from options
      const transformation: Array<Record<string, unknown>> = [];

      if (options.width || options.height) {
        const transformObj: Record<string, unknown> = {};

        if (options.width) {
          transformObj.width = options.width;
        }

        if (options.height) {
          transformObj.height = options.height;
        }

        if (options.crop) {
          transformObj.crop = options.crop;
        }

        if (options.focus) {
          transformObj.focus = options.focus;
        }

        if (options.quality) {
          transformObj.quality = options.quality;
        }

        if (options.format) {
          transformObj.format = options.format;
        }

        transformation.push(transformObj);
      }

      // Generate URL with transformations
      return imagekit.url({
        path: imageId,
        transformation: transformation.length > 0 ? transformation : undefined,
      });
    } catch (error) {
      this.logger.error('Error getting image preview URL from ImageKit', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        imageId,
        options,
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
   * Get URL for viewing the image from ImageKit
   */
  getImageViewURL(imageId: string): string {
    if (!imageId || typeof imageId !== 'string') {
      throw new FileError('Invalid image ID provided');
    }

    if (!this.isConfigured()) {
      throw new ConfigError('ImageKit configuration is missing');
    }

    try {
      const imagekit = getImageKit();

      // Simply get the URL with no transformations
      return imagekit.url({
        path: imageId,
      });
    } catch (error) {
      this.logger.error('Error getting image view URL from ImageKit', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        imageId,
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
   * Check if ImageKit is properly configured
   */
  isConfigured(): boolean {
    return IMAGEKIT_CONFIG.isConfigured;
  }
  /**
   * Map ImageKit file result to our standardized ImageMetadata interface
   * @param fileData ImageKit file metadata object (from upload, details, or list operations)
   */
  /**
   * Map ImageKit file result to our standardized ImageMetadata interface
   * Safely handles responses from different ImageKit API methods (upload, listFiles, getFileDetails)
   */
  private mapImageKitResultToImageMetadata(fileData: Record<string, unknown>): ImageMetadata {
    // Safe type casting
    const id = String(fileData.fileId || '');
    const name = String(fileData.name || '');
    const mimeType = String(fileData.mimeType || fileData.fileType || '');
    const size = Number(fileData.size || 0);
    const width = fileData.width !== undefined ? Number(fileData.width) : undefined;
    const height = fileData.height !== undefined ? Number(fileData.height) : undefined;
    const createdAt = fileData.createdAt ? String(fileData.createdAt) : undefined;

    // Extract tags if available - handling null or undefined gracefully
    const tags: string[] =
      fileData.tags === null || fileData.tags === undefined
        ? []
        : Array.isArray(fileData.tags)
        ? fileData.tags.map((tag) => String(tag))
        : [];

    return {
      id,
      name,
      mimeType,
      size,
      width,
      height,
      url: fileData.url ? String(fileData.url) : this.getImageViewURL(id),
      thumbnailUrl: fileData.thumbnailUrl
        ? String(fileData.thumbnailUrl)
        : this.getImagePreviewURL(id, { width: 200 }),
      createdAt,
      tags,
    };
  }
}
