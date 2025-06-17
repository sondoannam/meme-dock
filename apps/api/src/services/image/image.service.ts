import { ConfigError } from '../../utils/errors';
import { ImagePlatformService, ImageUploadOptions, ImageMetadata, ImageListOptions, ImageListResponse, ImagePreviewOptions } from './image-platform.interface';
import { AppwriteImageService } from './appwrite-image.service';
import { ImageKitImageService } from './imagekit-image.service';

/**
 * Platform options for image storage
 */
export enum ImagePlatform {
  APPWRITE = 'appwrite',
  IMAGEKIT = 'imagekit',
  AUTO = 'auto'
}

/**
 * Service to handle image operations with platform switching capabilities
 */
export class ImageService implements ImagePlatformService {
  private appwriteService: AppwriteImageService;
  private imageKitService: ImageKitImageService;
  private defaultPlatform: ImagePlatform;
  
  /**
   * Create a new ImageService instance
   * @param defaultPlatform Default platform to use (auto will try to detect)
   */
  constructor(defaultPlatform: ImagePlatform = ImagePlatform.AUTO) {
    this.appwriteService = new AppwriteImageService();
    this.imageKitService = new ImageKitImageService();
    this.defaultPlatform = defaultPlatform;
    
    // Validate that at least one platform is configured
    if (!this.appwriteService.isConfigured() && !this.imageKitService.isConfigured()) {
      console.warn('No image storage platform is properly configured. Please check your environment variables.');
    }
  }
  
  /**
   * Determine which service to use based on configuration and options
   * @param platform Optional platform override
   * @returns The service implementation to use
   */
  private getServiceForPlatform(platform?: ImagePlatform): ImagePlatformService {
    const platformToUse = platform || this.defaultPlatform;
    
    if (platformToUse === ImagePlatform.APPWRITE) {
      if (!this.appwriteService.isConfigured()) {
        throw new ConfigError('Appwrite image service is not properly configured');
      }
      return this.appwriteService;
    }
    
    if (platformToUse === ImagePlatform.IMAGEKIT) {
      if (!this.imageKitService.isConfigured()) {
        throw new ConfigError('ImageKit image service is not properly configured');
      }
      return this.imageKitService;
    }
    
    // Auto-detection mode
    if (this.imageKitService.isConfigured()) {
      return this.imageKitService; // Prefer ImageKit if configured
    } else if (this.appwriteService.isConfigured()) {
      return this.appwriteService;
    } else {
      throw new ConfigError('No image storage platform is properly configured');
    }
  }

  /**
   * Upload a single image file
   * @param file Express file upload from multer or similar middleware
   * @param options Upload options including optional platform override
   * @returns Image metadata
   */
  async uploadImage(
    file: Express.Multer.File, 
    options: ImageUploadOptions & { platform?: ImagePlatform } = {}
  ): Promise<ImageMetadata> {
    const { platform, ...uploadOptions } = options;
    const service = this.getServiceForPlatform(platform);
    return service.uploadImage(file, uploadOptions);
  }

  /**
   * Upload multiple image files
   * @param files Array of Express files from multer or similar middleware
   * @param options Upload options including optional platform override
   * @returns Array of image metadata
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    options: ImageUploadOptions & { platform?: ImagePlatform } = {}
  ): Promise<ImageMetadata[]> {
    const { platform, ...uploadOptions } = options;
    const service = this.getServiceForPlatform(platform);
    return service.uploadMultipleImages(files, uploadOptions);
  }

  /**
   * Get metadata for an image by ID
   * @param imageId Image ID to retrieve
   * @param platform Optional platform override
   * @returns Image metadata
   */
  async getImageMetadata(
    imageId: string,
    platform?: ImagePlatform
  ): Promise<ImageMetadata> {
    const service = this.getServiceForPlatform(platform);
    return service.getImageMetadata(imageId);
  }

  /**
   * Get a list of images
   * @param options Listing options including optional platform override
   * @returns List response with images and pagination info
   */
  async listImages(
    options: ImageListOptions & { platform?: ImagePlatform } = {}
  ): Promise<ImageListResponse> {
    const { platform, ...listOptions } = options;
    const service = this.getServiceForPlatform(platform);
    return service.listImages(listOptions);
  }

  /**
   * Delete an image by ID
   * @param imageId Image ID to delete
   * @param platform Optional platform override
   */
  async deleteImage(
    imageId: string,
    platform?: ImagePlatform
  ): Promise<void> {
    const service = this.getServiceForPlatform(platform);
    return service.deleteImage(imageId);
  }

  /**
   * Get URL for downloading the original image
   * @param imageId Image ID to download
   * @param platform Optional platform override
   * @returns Download URL
   */
  getImageDownloadURL(
    imageId: string,
    platform?: ImagePlatform
  ): string {
    const service = this.getServiceForPlatform(platform);
    return service.getImageDownloadURL(imageId);
  }

  /**
   * Get URL for preview/thumbnail with transformations
   * @param imageId Image ID for preview
   * @param options Preview options
   * @param platform Optional platform override
   * @returns Preview URL
   */
  getImagePreviewURL(
    imageId: string,
    options: ImagePreviewOptions & { platform?: ImagePlatform } = {}
  ): string {
    const { platform, ...previewOptions } = options;
    const service = this.getServiceForPlatform(platform);
    return service.getImagePreviewURL(imageId, previewOptions);
  }

  /**
   * Get URL for viewing the image
   * @param imageId Image ID to view
   * @param platform Optional platform override
   * @returns View URL
   */
  getImageViewURL(
    imageId: string,
    platform?: ImagePlatform
  ): string {
    const service = this.getServiceForPlatform(platform);
    return service.getImageViewURL(imageId);
  }

  /**
   * Check if the service is configured
   * @returns True if at least one platform is properly configured
   */
  isConfigured(): boolean {
    return this.appwriteService.isConfigured() || this.imageKitService.isConfigured();
  }
}
