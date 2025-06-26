import { Request, Response, NextFunction } from 'express';
import { ImageService, ImagePlatform } from '../services/image/image.service';
import { createServiceLogger } from '../utils/logger-utils';

// Create a singleton instance of the ImageService
const imageService = new ImageService();

// Create a logger for the images controller
const logger = createServiceLogger('ImagesController');

function parsePlatform(req: Request): ImagePlatform | undefined {
  const platform = req.body.platform || req.query.platform;
  if (platform === 'appwrite') {
    return ImagePlatform.APPWRITE;
  } else if (platform === 'imagekit') {
    return ImagePlatform.IMAGEKIT;
  }
  return undefined;
}

function parseUploadOptions(req: Request, imagePlatform?: ImagePlatform) {
  return {
    folder: req.body.folder || req.query.folder,
    tags: req.body.tags
      ? Array.isArray(req.body.tags)
        ? req.body.tags
        : req.body.tags.split(',')
      : undefined,
    isPrivate: req.body.isPrivate === 'true' || req.body.isPrivate === true,
    useUniqueFileName:
      req.body.useUniqueFileName !== 'false' && req.body.useUniqueFileName !== false,
    platform: imagePlatform,
    userId: req.userId,

    // For backward compatibility
    maxFileSize: req.body.maxFileSize ? parseInt(req.body.maxFileSize, 10) : undefined,
    minFileSize: req.body.minFileSize ? parseInt(req.body.minFileSize, 10) : undefined,
    allowedTypes: req.body.allowedTypes
      ? Array.isArray(req.body.allowedTypes)
        ? req.body.allowedTypes
        : req.body.allowedTypes.split(',').map((type: string) => type.trim())
      : undefined,

    // Add consolidated validation options
    validation: {
      maxFileSize: req.body.maxFileSize ? parseInt(req.body.maxFileSize, 10) : undefined,
      minFileSize: req.body.minFileSize ? parseInt(req.body.minFileSize, 10) : undefined,
      allowedTypes: req.body.allowedTypes
        ? Array.isArray(req.body.allowedTypes)
          ? req.body.allowedTypes
          : req.body.allowedTypes.split(',').map((type: string) => type.trim())
        : undefined,
      maxWidth: req.body.maxWidth ? parseInt(req.body.maxWidth, 10) : undefined,
      maxHeight: req.body.maxHeight ? parseInt(req.body.maxHeight, 10) : undefined,
    },
  };
}

/**
 * Upload a single image
 */
export async function uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    // Parse optional platform parameter
    const imagePlatform = parsePlatform(req);

    // Extract upload options from request
    const options = parseUploadOptions(req, imagePlatform);

    // Upload the image
    const result = await imageService.uploadImage(req.file, options); // Log the upload with user ID if available
    logger.info(`Image uploaded: ${result.id}`, {
      imageId: result.id,
      userId: req.userId || 'anonymous',
      fileSize: req.file.size,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ success: false, message: 'No files uploaded' });
      return;
    }

    // Parse optional platform parameter
    const imagePlatform = parsePlatform(req);

    // Extract options from request
    const options = parseUploadOptions(req, imagePlatform);

    // Upload the images
    const results = await imageService.uploadMultipleImages(req.files, options); // Log the multi-upload with user ID if available
    logger.info(`Multiple images uploaded: ${results.length} images`, {
      imageCount: results.length,
      userId: req.userId || 'anonymous',
      imageIds: results.map((img) => img.id),
      totalSize: req.files.reduce((sum, file) => sum + file.size, 0),
    });

    res.status(201).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get image metadata
 */
export async function getImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const imageId = req.params.id;

    // Parse optional platform parameter
    const platform = req.query.platform;
    let imagePlatform: ImagePlatform | undefined;

    if (platform === 'appwrite') {
      imagePlatform = ImagePlatform.APPWRITE;
    } else if (platform === 'imagekit') {
      imagePlatform = ImagePlatform.IMAGEKIT;
    }

    const result = await imageService.getImageMetadata(imageId, imagePlatform);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List images
 */
export async function listImages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Parse optional platform parameter
    const platform = req.query.platform;
    let imagePlatform: ImagePlatform | undefined;

    if (platform === 'appwrite') {
      imagePlatform = ImagePlatform.APPWRITE;
    } else if (platform === 'imagekit') {
      imagePlatform = ImagePlatform.IMAGEKIT;
    }

    // Extract options from request
    const options = {
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
      folder: req.query.folder as string | undefined,
      searchQuery: req.query.search as string | undefined,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      platform: imagePlatform,
    };

    const result = await imageService.listImages(options);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete an image
 */
export async function deleteImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const imageId = req.params.id;

    // Parse optional platform parameter
    const platform = req.query.platform;
    let imagePlatform: ImagePlatform | undefined;

    if (platform === 'appwrite') {
      imagePlatform = ImagePlatform.APPWRITE;
    } else if (platform === 'imagekit') {
      imagePlatform = ImagePlatform.IMAGEKIT;
    }
    await imageService.deleteImage(imageId, imagePlatform); // Log the deletion with user ID if available
    logger.info(`Image deleted: ${imageId}`, {
      imageId,
      userId: req.userId || 'anonymous',
      platform: imagePlatform,
    });

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
