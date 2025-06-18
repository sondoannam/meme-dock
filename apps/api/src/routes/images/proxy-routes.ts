import { Router } from 'express';
import { FileError } from '../../utils/errors';
import { ImageService, ImagePlatform } from '../../services/image/image.service';
import { optionalAuth } from '../../middleware/image-auth.middleware';

/**
 * Image Proxy Routes
 * 
 * These routes provide a proxy layer for accessing images stored in various platforms.
 * For the public-facing client app, these routes hide the actual storage implementation
 * while for the CMS admin, direct URLs can still be used.
 * 
 * Routes:
 * - GET /api/images/preview/:id - Get image preview with optional transformations
 * - GET /api/images/view/:id - View image
 * - GET /api/images/download/:id - Download image
 */

const proxyRouter: Router = Router();

/**
 * Get image preview via proxy with optional transformations
 * @route GET /api/images/preview/:id
 * @access Anyone with authenticated user info attached if available
 */
proxyRouter.get('/preview/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get query parameters for transformations
    const width = req.query.width ? parseInt(req.query.width as string) : undefined;
    const height = req.query.height ? parseInt(req.query.height as string) : undefined;
    const quality = req.query.quality ? parseInt(req.query.quality as string) : undefined;
    const format = req.query.format as string | undefined;
    
    // Get platform from query or default to appwrite
    const platformParam = req.query.platform as string || 'appwrite';
    const platform = platformParam === 'imagekit' ? ImagePlatform.IMAGEKIT : ImagePlatform.APPWRITE;
    
    // Create an instance of the ImageService with the specified platform
    const imageService = new ImageService(platform);
    
    if (!imageService) {
      throw new FileError(`Image storage platform '${platform}' is not supported or configured`);
    }
    
    // Generate the preview URL
    const previewUrl = imageService.getImagePreviewURL(id, { width, height, quality, format });
    
    // Option 1: Redirect to the actual URL (simplest)
    return res.redirect(previewUrl);
    
    // Option 2: Proxy the image through our API (more complex but hides origin)
    // const response = await fetch(previewUrl);
    // if (!response.ok) {
    //   throw new FileError(`Failed to fetch image: ${response.statusText}`);
    // }
    // const buffer = await response.arrayBuffer();
    // const contentType = response.headers.get('content-type') || 'application/octet-stream';
    // res.setHeader('Content-Type', contentType);
    // res.send(Buffer.from(buffer));
  } catch (error) {
    next(error);
  }
});

/**
 * View image via proxy
 * @route GET /api/images/view/:id
 * @access Anyone with authenticated user info attached if available
 */
proxyRouter.get('/view/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const platformParam = req.query.platform as string || 'appwrite';
    const platform = platformParam === 'imagekit' ? ImagePlatform.IMAGEKIT : ImagePlatform.APPWRITE;
    
    // Create an instance of the ImageService with the specified platform
    const imageService = new ImageService(platform);
    
    if (!imageService) {
      throw new FileError(`Image storage platform '${platform}' is not supported or configured`);
    }
    
    // Generate the view URL
    const viewUrl = imageService.getImageViewURL(id);
    
    // Redirect to the actual URL
    return res.redirect(viewUrl);
  } catch (error) {
    next(error);
  }
});

/**
 * Download image via proxy
 * @route GET /api/images/download/:id
 * @access Anyone with authenticated user info attached if available
 */
proxyRouter.get('/download/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const platformParam = req.query.platform as string || 'appwrite';
    const platform = platformParam === 'imagekit' ? ImagePlatform.IMAGEKIT : ImagePlatform.APPWRITE;
    
    // Create an instance of the ImageService with the specified platform
    const imageService = new ImageService(platform);
    
    if (!imageService) {
      throw new FileError(`Image storage platform '${platform}' is not supported or configured`);
    }
    
    // Generate the download URL
    const downloadUrl = imageService.getImageDownloadURL(id);
    
    // Redirect to the actual URL
    return res.redirect(downloadUrl);
  } catch (error) {
    next(error);
  }
});

export default proxyRouter;
