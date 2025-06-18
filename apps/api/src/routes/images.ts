import express, { Router } from 'express';
import multer from 'multer';
import * as imagesController from '../controllers/images';
import { validateSingleFile, validateMultipleFiles } from '../middleware/file-validation.middleware';
import { uploadLimiter, multipleUploadLimiter } from '../middleware/rate-limit.middleware';
import { readAuth, writeAuth } from '../middleware/image-auth.middleware';
import proxyRoutes from './images/proxy-routes';

/**
 * Images Router
 * 
 * Authentication Strategy:
 * - POST/DELETE routes: Use writeAuth to ensure user is authenticated (userId required)
 * - GET routes: Use readAuth to allow public access but attach user info if authenticated
 * - Proxy routes: Use optionalAuth in the proxy routes for same reasoning as GET routes
 * 
 * This allows for future tightening of security if needed, while maintaining
 * compatibility with both the public client app and the authenticated CMS users.
 */
const router: Router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * @route POST /api/images
 * @desc Upload a single image
 * @access Authenticated users only
 */
router.post(
  '/',
  writeAuth, // Ensure user is authenticated
  uploadLimiter, // Rate limiting
  upload.single('file'), // Parse a single file from form data
  validateSingleFile, // Validate file type and size
  imagesController.uploadImage
);

/**
 * @route POST /api/images/multiple
 * @desc Upload multiple images
 * @access Authenticated users only
 */
router.post(
  '/multiple',
  writeAuth, // Ensure user is authenticated
  multipleUploadLimiter, // Rate limiting
  upload.array('files', 20), // Parse up to 20 files from form data
  validateMultipleFiles(20), // Validate files
  imagesController.uploadMultipleImages
);

/**
 * @route GET /api/images
 * @desc List images with optional filtering
 * @access Anyone with authenticated user info attached if available
 */
router.get(
  '/',
  readAuth, // Add user info if authenticated, but allow unauthenticated too
  imagesController.listImages
);

/**
 * @route GET /api/images/:id
 * @desc Get a single image's metadata
 * @access Anyone with authenticated user info attached if available
 */
router.get(
  '/:id',
  readAuth, // Add user info if authenticated, but allow unauthenticated too
  imagesController.getImage
);

/**
 * @route DELETE /api/images/:id
 * @desc Delete an image
 * @access Authenticated users only
 */
router.delete(
  '/:id',
  writeAuth, // Ensure user is authenticated
  imagesController.deleteImage
);

// Mount proxy routes for image assets (preview, view, download)
router.use('/', proxyRoutes);

export default router;
