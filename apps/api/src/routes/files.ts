import express, { Router } from 'express';
import multer from 'multer';
import * as FileController from '../controllers/files';
import { catchAsync } from '../middleware/error.middleware';
import { validateSingleFile, validateMultipleFiles } from '../middleware/file-validation.middleware';
import { uploadLimiter, multipleUploadLimiter } from '../middleware/rate-limit.middleware';

const router: Router = express.Router();

// Configure multer for memory storage (needed for Appwrite's InputFile)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB file size limit
  },
});

// GET /api/files - List all files
router.get('/', catchAsync(FileController.listFiles));

// POST /api/files/upload - Upload a single file
router.post(
  '/upload', 
  uploadLimiter,
  upload.single('file'), 
  validateSingleFile, 
  catchAsync(FileController.uploadFile)
);

// POST /api/files/upload/multiple - Upload multiple files
router.post(
  '/upload/multiple', 
  multipleUploadLimiter,
  upload.array('files', 10), 
  validateMultipleFiles(10), 
  catchAsync(FileController.uploadMultipleFiles)
);

// GET /api/files/:fileId/metadata - Get file metadata
router.get('/:fileId/metadata', catchAsync(FileController.getFileMetadata));

// GET /api/files/:fileId/download - Get file download URL
router.get('/:fileId/download', catchAsync(FileController.getFileDownload));

// GET /api/files/:fileId/preview - Get file preview URL
router.get('/:fileId/preview', catchAsync(FileController.getFilePreview));

// GET /api/files/:fileId/view - Get file view URL
router.get('/:fileId/view', catchAsync(FileController.getFileView));

// DELETE /api/files/:fileId - Delete a file
router.delete('/:fileId', catchAsync(FileController.deleteFile));

export default router;
