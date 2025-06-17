import { Request, Response } from 'express';
import * as FileService from '../services/file.service';
import { MEME_BUCKET_ID } from '../config/appwrite';
import { isAppError } from '../utils/errors';

/**
 * Upload a file to the bucket
 * @route POST /api/files/upload
 */
export async function uploadFile(req: Request, res: Response): Promise<Response> {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    if (!MEME_BUCKET_ID) {
      return res.status(500).json({
        success: false,
        message: 'Storage bucket not configured',
      });
    }

    const result = await FileService.uploadFile(req.file);

    return res.status(201).json({
      success: true,
      file: result,
    });
  } catch (error) {
    console.error('Error in uploadFile controller:', error);

    // Handle our custom errors
    if (isAppError(error)) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: error.constructor.name,
      });
    }

    // Handle other types of errors
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'InternalServerError',
    });
  }
}

/**
 * Upload multiple files to the bucket
 * @route POST /api/files/upload/multiple
 */
export async function uploadMultipleFiles(req: Request, res: Response): Promise<Response> {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: 'No files provided' });
    }

    if (!MEME_BUCKET_ID) {
      return res.status(500).json({ message: 'Storage bucket not configured' });
    }

    const results = await FileService.uploadMultipleFiles(req.files);

    return res.status(201).json({
      success: true,
      files: results,
    });
  } catch (error) {
    console.error('Error in uploadMultipleFiles controller:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get file metadata by ID
 * @route GET /api/files/:fileId/metadata
 */
export async function getFileMetadata(req: Request, res: Response): Promise<Response> {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({ message: 'No file ID provided' });
    }

    if (!MEME_BUCKET_ID) {
      return res.status(500).json({ message: 'Storage bucket not configured' });
    }

    const file = await FileService.getFileMetadata(fileId);

    return res.status(200).json({
      success: true,
      file,
    });
  } catch (error) {
    console.error('Error in getFileMetadata controller:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get file download URL
 * @route GET /api/files/:fileId/download
 */
export async function getFileDownload(req: Request, res: Response): Promise<Response> {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({ message: 'No file ID provided' });
    }

    if (!MEME_BUCKET_ID) {
      return res.status(500).json({ message: 'Storage bucket not configured' });
    }

    // Get download URL
    const url = FileService.getFileDownloadURL(fileId);

    return res.status(200).json({
      success: true,
      url,
    });
  } catch (error) {
    console.error('Error in getFileDownload controller:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get file preview URL with optional transformations
 * @route GET /api/files/:fileId/preview
 */
export async function getFilePreview(req: Request, res: Response): Promise<Response> {
  try {
    const { fileId } = req.params;
    const { width, height, quality } = req.query;

    if (!fileId) {
      return res.status(400).json({ message: 'No file ID provided' });
    }

    if (!MEME_BUCKET_ID) {
      return res.status(500).json({ message: 'Storage bucket not configured' });
    }

    // Parse the options
    const options = {
      width: width ? parseInt(width as string, 10) : undefined,
      height: height ? parseInt(height as string, 10) : undefined,
      quality: quality ? parseInt(quality as string, 10) : undefined,
    };

    // Get preview URL
    const url = FileService.getFilePreviewURL(fileId, options);

    return res.status(200).json({
      success: true,
      url,
    });
  } catch (error) {
    console.error('Error in getFilePreview controller:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get file view URL
 * @route GET /api/files/:fileId/view
 */
export async function getFileView(req: Request, res: Response): Promise<Response> {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({ message: 'No file ID provided' });
    }

    if (!MEME_BUCKET_ID) {
      return res.status(500).json({ message: 'Storage bucket not configured' });
    }

    // Get view URL
    const url = FileService.getFileViewURL(fileId);

    return res.status(200).json({
      success: true,
      url,
    });
  } catch (error) {
    console.error('Error in getFileView controller:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * List files in the bucket
 * @route GET /api/files
 */
export async function listFiles(req: Request, res: Response): Promise<Response> {
  try {
    const { limit, offset } = req.query;

    if (!MEME_BUCKET_ID) {
      return res.status(500).json({ message: 'Storage bucket not configured' });
    }

    // Parse the options
    const options = {
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    };

    const files = await FileService.listFiles(options);

    return res.status(200).json({
      success: true,
      files,
    });
  } catch (error) {
    console.error('Error in listFiles controller:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Delete a file from the bucket
 * @route DELETE /api/files/:fileId
 */
export async function deleteFile(req: Request, res: Response): Promise<Response> {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({ message: 'No file ID provided' });
    }

    if (!MEME_BUCKET_ID) {
      return res.status(500).json({ message: 'Storage bucket not configured' });
    }

    await FileService.deleteFile(fileId);

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteFile controller:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
