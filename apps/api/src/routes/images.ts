import express, { Router } from 'express';
import multer from 'multer';
import * as imagesController from '../controllers/images';
import { validateSingleFile, validateMultipleFiles } from '../middleware/file-validation.middleware';
import { uploadLimiter, multipleUploadLimiter } from '../middleware/rate-limit.middleware';

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
 * @access Public (but can be restricted with auth middleware)
 */
router.post(
  '/',
  uploadLimiter, // Rate limiting
  upload.single('file'), // Parse a single file from form data
  validateSingleFile, // Validate file type and size
  imagesController.uploadImage
);

/**
 * @route POST /api/images/multiple
 * @desc Upload multiple images
 * @access Public (but can be restricted with auth middleware)
 */
router.post(
  '/multiple',
  multipleUploadLimiter, // Rate limiting
  upload.array('files', 20), // Parse up to 20 files from form data
  validateMultipleFiles(20), // Validate files
  imagesController.uploadMultipleImages
);

/**
 * @route GET /api/images
 * @desc List images with optional filtering
 * @access Public (but can be restricted with auth middleware)
 */
router.get(
  '/',
  imagesController.listImages
);

/**
 * @route GET /api/images/:id
 * @desc Get a single image's metadata
 * @access Public (but can be restricted with auth middleware)
 */
router.get(
  '/:id',
  imagesController.getImage
);

/**
 * @route DELETE /api/images/:id
 * @desc Delete an image
 * @access Public (but can be restricted with auth middleware)
 */
router.delete(
  '/:id',
  imagesController.deleteImage
);

export default router;
