import { storage, MEME_BUCKET_ID, ID } from '../../config/appwrite';
import { InputFile } from 'node-appwrite/file';
import { ConfigError, FileError } from '../../utils/errors';
import { 
  validateImageFile, 
  DEFAULT_IMAGE_VALIDATION_OPTIONS,
  generateSecureFileId 
} from '../../utils/file-validation';
import { 
  ImageMetadata, 
  ImageUploadOptions, 
  ImageListOptions, 
  ImageListResponse, 
  ImagePlatformService,
  ImagePreviewOptions
} from './image-platform.interface';

/**
 * Appwrite implementation of the ImagePlatformService
 */
export class AppwriteImageService implements ImagePlatformService {
  /**
   * Upload a single image file to Appwrite Storage
   */
  async uploadImage(
    file: Express.Multer.File,
    options: ImageUploadOptions = {}
  ): Promise<ImageMetadata> {    try {
      // Create validation options by merging defaults with provided options
      const validationOptions = {
        ...DEFAULT_IMAGE_VALIDATION_OPTIONS,
        // Use consolidated validation options if provided, otherwise fall back to individual properties
        ...(options.validation || {}),
        // Legacy individual options for backward compatibility
        maxSize: options.maxFileSize,
        allowedTypes: options.allowedTypes,
        minSize: options.minFileSize
      };
      
      // Validate the file using our image-specific utility
      validateImageFile(file, validationOptions);
      
      // Create a unique ID or use provided one
      const useUniqueFileName = options.useUniqueFileName !== false;
      const fileName = options.fileName || file.originalname;
      const fileId = useUniqueFileName ? generateSecureFileId() || ID.unique() : fileName;

      // Create Appwrite InputFile from the Express file
      const fileInput = InputFile.fromBuffer(
        file.buffer,
        fileName
      );

      // Prepare permissions if needed
      const permissions = options.isPrivate 
        ? [] // Empty array means only the owner can access
        : undefined; // Undefined means use bucket default permissions

      // Upload the file to Appwrite Storage
      const result = await storage.createFile(
        MEME_BUCKET_ID,
        fileId,
        fileInput,
        permissions
      );

      // Map Appwrite result to our standardized ImageMetadata
      return this.mapAppwriteResultToImageMetadata(result);
    } catch (error) {
      console.error('Error uploading image to Appwrite:', error);
      
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
    options: ImageUploadOptions = {}
  ): Promise<ImageMetadata[]> {
    try {
      if (!Array.isArray(files) || files.length === 0) {
        throw new FileError('No files provided for upload');
      }
      
      // Optional: Validate max number of files
      const MAX_FILES = 20;
      if (files.length > MAX_FILES) {
        throw new FileError(`Too many files. Maximum allowed is ${MAX_FILES}`);
      }      // Create validation options by merging defaults with provided options
      const validationOptions = {
        ...DEFAULT_IMAGE_VALIDATION_OPTIONS,
        // Use consolidated validation options if provided, otherwise fall back to individual properties
        ...(options.validation || {}),
        // Legacy individual options for backward compatibility
        maxSize: options.maxFileSize,
        allowedTypes: options.allowedTypes,
        minSize: options.minFileSize
      };
      
      // Validate each file before attempting to upload any
      files.forEach(file => validateImageFile(file, validationOptions));
      
      // If all validations pass, proceed with upload
      const uploadPromises = files.map((file) => this.uploadImage(file, options));
      return Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading multiple files to Appwrite:', error);
      
      // Rethrow AppErrors as is, wrap other errors
      if (error instanceof ConfigError || error instanceof FileError) {
        throw error;
      } else {
        throw new FileError(error instanceof Error ? error.message : 'Unknown error uploading multiple files');
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
    } catch (error) {
      console.error('Error getting file metadata from Appwrite:', error);
      
      // Rethrow AppErrors as is, wrap other errors
      if (error instanceof ConfigError || error instanceof FileError) {
        throw error;
      } else {
        throw new FileError(error instanceof Error ? `Error fetching image metadata: ${error.message}` : 'Unknown error fetching image metadata');
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
        filteredFiles = filteredFiles.filter(file => 
          (file.$permissions || []).some(perm => 
            perm.includes(`folder:${options.folder}`)));
      }
      
      const start = options.offset || 0;
      const end = options.limit ? start + options.limit : undefined;
      const paginatedFiles = filteredFiles.slice(start, end);

      return {
        images: paginatedFiles.map(file => this.mapAppwriteResultToImageMetadata(file)),
        total: files.total,
        hasMore: end !== undefined && end < files.total
      };
    } catch (error) {
      console.error('Error listing files from Appwrite:', error);
      
      // Rethrow AppErrors as is, wrap other errors
      if (error instanceof ConfigError || error instanceof FileError) {
        throw error;
      } else {
        throw new FileError(error instanceof Error ? `Error listing images: ${error.message}` : 'Unknown error listing images');
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
      console.error('Error deleting image from Appwrite:', error);
      
      // Rethrow AppErrors as is, wrap other errors
      if (error instanceof ConfigError || error instanceof FileError) {
        throw error;
      } else {
        throw new FileError(error instanceof Error ? `Error deleting image: ${error.message}` : 'Unknown error deleting image');
      }
    }
  }

  /**
   * Get URL for downloading the original image from Appwrite
   */
  getImageDownloadURL(imageId: string): string {
    if (!imageId || typeof imageId !== 'string') {
      throw new FileError('Invalid image ID provided');
    }
    
    if (!MEME_BUCKET_ID) {
      throw new ConfigError('APPWRITE_MEME_BUCKET_ID not configured');
    }

    try {
      return storage.getFileDownload(MEME_BUCKET_ID, imageId).toString();
    } catch (error) {
      console.error('Error getting image download URL from Appwrite:', error);
      
      // Rethrow AppErrors as is, wrap other errors
      if (error instanceof ConfigError || error instanceof FileError) {
        throw error;
      } else {
        throw new FileError(error instanceof Error ? `Error getting download URL: ${error.message}` : 'Unknown error getting download URL');
      }
    }
  }

  /**
   * Get URL for preview/thumbnail with transformations from Appwrite
   */
  getImagePreviewURL(imageId: string, options: ImagePreviewOptions = {}): string {
    if (!imageId || typeof imageId !== 'string') {
      throw new FileError('Invalid image ID provided');
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
      return storage.getFilePreview(
        MEME_BUCKET_ID,
        imageId,
        width,
        height
      ).toString();
    } catch (error) {
      console.error('Error getting image preview URL from Appwrite:', error);
      
      // Rethrow AppErrors as is, wrap other errors
      if (error instanceof ConfigError || error instanceof FileError) {
        throw error;
      } else {
        throw new FileError(error instanceof Error ? `Error getting preview URL: ${error.message}` : 'Unknown error getting preview URL');
      }
    }
  }

  /**
   * Get URL for viewing the image from Appwrite
   */
  getImageViewURL(imageId: string): string {
    if (!imageId || typeof imageId !== 'string') {
      throw new FileError('Invalid image ID provided');
    }
    
    if (!MEME_BUCKET_ID) {
      throw new ConfigError('APPWRITE_MEME_BUCKET_ID not configured');
    }

    try {
      return storage.getFileView(MEME_BUCKET_ID, imageId).toString();
    } catch (error) {
      console.error('Error getting image view URL from Appwrite:', error);
      
      // Rethrow AppErrors as is, wrap other errors
      if (error instanceof ConfigError || error instanceof FileError) {
        throw error;
      } else {
        throw new FileError(error instanceof Error ? `Error getting view URL: ${error.message}` : 'Unknown error getting view URL');
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
   * @param fileData Appwrite file metadata object
   */
  private mapAppwriteResultToImageMetadata(fileData: Record<string, unknown>): ImageMetadata {
    // Safe type casting
    const id = typeof fileData.$id === 'string' ? fileData.$id : '';
    const name = typeof fileData.name === 'string' ? fileData.name : '';
    const mimeType = typeof fileData.mimeType === 'string' ? fileData.mimeType : '';
    const size = typeof fileData.sizeOriginal === 'number' ? fileData.sizeOriginal : 0;
    const width = typeof fileData.width === 'number' ? fileData.width : undefined;
    const height = typeof fileData.height === 'number' ? fileData.height : undefined;
    const createdAt = typeof fileData.$createdAt === 'string' ? fileData.$createdAt : undefined;
    
    return {
      id,
      name,
      mimeType,
      size,
      width,
      height,
      url: this.getImageViewURL(id),
      thumbnailUrl: this.getImagePreviewURL(id, { width: 200 }),
      createdAt,
      tags: [] // Appwrite doesn't support tags for files by default
    };
  }
}
