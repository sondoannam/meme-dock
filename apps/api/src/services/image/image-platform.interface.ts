/**
 * Common interface for image metadata across different platforms
 */
export interface ImageMetadata {
  id: string; // Unique image ID
  name: string; // Original filename
  mimeType: string; // MIME type like "image/jpeg"
  size: number; // File size in bytes
  width?: number; // Optional width in pixels
  height?: number; // Optional height in pixels
  url: string; // Public URL to access the image
  downloadUrl?: string; // URL to download the original file (with attachment header)
  thumbnailUrl?: string; // URL for thumbnail version (if available)
  createdAt?: string; // ISO timestamp when image was created
  updatedAt?: string; // ISO timestamp when image was last updated
  bucketId?: string; // ID of the storage bucket (platform-specific)
  signature?: string; // File signature/checksum (e.g., MD5)
  tags?: string[]; // Optional tags
  isUploaded?: boolean; // Whether file upload is complete
  uploadProgress?: number; // Upload progress percentage (0-100)
}

/**
 * Options for uploading images
 */
/**
 * Options for image file validation
 */
export interface ImageValidationOptions {
  maxFileSize?: number; // Maximum file size in bytes
  minFileSize?: number; // Minimum file size in bytes
  allowedTypes?: string[]; // Array of allowed MIME types
  maxWidth?: number; // Maximum image width in pixels
  maxHeight?: number; // Maximum image height in pixels
}

/**
 * Options for uploading images
 */
export interface ImageUploadOptions {
  folder?: string; // Folder path to store the image
  tags?: string[]; // Tags to associate with the image
  fileName?: string; // Override filename if different from original
  transformations?: Record<string, unknown>; // Platform-specific transformations
  isPrivate?: boolean; // Whether the image should be private
  useUniqueFileName?: boolean; // Generate a unique filename or use original
  customMetadata?: {
    [key: string]: string | number | boolean | Array<string | number | boolean>;
  }; // Additional metadata

  // Validation options (for backward compatibility)
  maxFileSize?: number; // Maximum file size in bytes
  minFileSize?: number; // Minimum file size in bytes
  allowedTypes?: string[]; // Array of allowed MIME types

  // Consolidated validation options object
  validation?: ImageValidationOptions;
}

/**
 * Image file validation options provide a standardized way to specify
 * validation constraints for uploaded images. These options are passed
 * to the validateImageFile function when processing uploads.
 *
 * Usage example:
 *
 * ```typescript
 * const options = {
 *   folder: 'memes',
 *   validation: {
 *     maxFileSize: 2 * 1024 * 1024, // 2MB
 *     allowedTypes: ['image/jpeg', 'image/png'],
 *     maxWidth: 1920,
 *     maxHeight: 1080
 *   }
 * };
 *
 * imageService.uploadImage(file, options);
 * ```
 */

/**
 * Options for retrieving a preview/thumbnail URL
 */
export interface ImagePreviewOptions {
  width?: number; // Width of the preview
  height?: number; // Height of the preview
  quality?: number; // Quality of the preview image (1-100)
  format?: string; // Output format (jpg, png, webp, etc.)
  crop?: string; // Crop mode (if supported)
  focus?: string; // Focus point (if supported)
}

/**
 * Listing options for paginating through images
 */
export interface ImageListOptions {
  limit?: number; // Number of items per page
  offset?: number; // Number of items to skip
  folder?: string; // Filter by folder
  tags?: string[]; // Filter by tags
  searchQuery?: string; // Search by filename or other attributes
}

/**
 * Result of a list operation
 */
export interface ImageListResponse {
  images: ImageMetadata[];
  total: number; // Total number of images matching criteria
  hasMore: boolean; // Whether there are more images to fetch
  nextCursor?: string; // Cursor for pagination (if supported)
}

/**
 * Platform-specific service implementation interface
 */
export interface ImagePlatformService {
  /**
   * Upload a single image file
   */
  uploadImage(file: Express.Multer.File, options?: ImageUploadOptions): Promise<ImageMetadata>;

  /**
   * Upload multiple image files
   */
  uploadMultipleImages(
    files: Express.Multer.File[],
    options?: ImageUploadOptions,
  ): Promise<ImageMetadata[]>;

  /**
   * Get metadata for an image by ID
   */
  getImageMetadata(imageId: string): Promise<ImageMetadata>;

  /**
   * Get a list of images
   */
  listImages(options?: ImageListOptions): Promise<ImageListResponse>;

  /**
   * Delete an image by ID
   */
  deleteImage(imageId: string): Promise<void>;

  /**
   * Get URL for downloading the original image
   */
  getImageDownloadURL(imageId: string): string;

  /**
   * Get URL for preview/thumbnail with transformations
   */
  getImagePreviewURL(imageId: string, options?: ImagePreviewOptions): string;

  /**
   * Get URL for viewing the image
   */
  getImageViewURL(imageId: string): string;

  /**
   * Check if this service is properly configured
   */
  isConfigured(): boolean;
}
