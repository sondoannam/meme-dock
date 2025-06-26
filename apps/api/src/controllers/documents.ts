import { Request, Response } from 'express';
import { DocumentService } from '../services';
import { DocumentIncreaseTimePeriod } from '../models/document-analytics';
import { createServiceLogger } from '../utils/logger-utils';

const logger = createServiceLogger('DocumentsController');

/**
 * Get document count increases over time
 *
 * This endpoint returns the number of documents added to a collection over specified time periods.
 * It supports grouping by day, week, or month, and allows specifying the number of periods to return.
 */
export const getDocumentIncreaseOverTime = async (req: Request, res: Response): Promise<void> => {
  try {
    const { collectionId } = req.params;
    const { duration = 'month', limit } = req.query;

    if (!collectionId) {
      res.status(400).json({ message: 'Collection ID is required' });
      return;
    }

    // Validate duration parameter
    if (!['day', 'week', 'month'].includes(duration as string)) {
      res.status(400).json({
        message: 'Duration must be one of: day, week, month',
        allowedValues: ['day', 'week', 'month'],
      });
      return;
    }

    // Parse limit with validation
    const parsedLimit = limit ? parseInt(limit as string, 10) : undefined;
    if (parsedLimit !== undefined && (isNaN(parsedLimit) || parsedLimit <= 0)) {
      res.status(400).json({ message: 'Limit must be a positive number' });
      return;
    }

    const increases = await DocumentService.getDocumentIncreaseOverTime(
      collectionId,
      duration as DocumentIncreaseTimePeriod,
      parsedLimit,
    );

    res.status(200).json({
      collectionId,
      duration,
      periods: increases,
    });
  } catch (error) {
    logger.error('Error fetching document increases', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      collectionId: req.params.collectionId,
      duration: req.query.duration,
      limit: req.query.limit,
    });
    res.status(500).json({
      message: 'Failed to fetch document increases',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get documents from a collection
 */
export const getDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { collectionId } = req.params;
    const { limit, offset, orderBy, orderType, queries } = req.query;

    if (!collectionId) {
      res.status(400).json({ message: 'Collection ID is required' });
      return;
    }

    const documents = await DocumentService.getDocuments(collectionId, {
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      orderBy: orderBy as string,
      orderType: orderType as string,
      queries: (queries as string[]) || [],
    });

    res.status(200).json(documents);
  } catch (error) {
    logger.error('Error fetching documents', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      collectionId: req.params.collectionId,
      query: req.query,
    });
    res.status(500).json({
      message: 'Failed to fetch documents',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get a document by ID
 */
export const getDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { collectionId, documentId } = req.params;

    if (!collectionId || !documentId) {
      res.status(400).json({ message: 'Collection ID and Document ID are required' });
      return;
    }

    const document = await DocumentService.getDocument(collectionId, documentId);
    res.status(200).json(document);
  } catch (error) {
    logger.error('Error fetching document', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      collectionId: req.params.collectionId,
      documentId: req.params.documentId,
    });
    res.status(500).json({
      message: 'Failed to fetch document',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Create a new document
 */
export const createDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { collectionId } = req.params;
    const documentData = req.body;

    if (!collectionId || !documentData) {
      res.status(400).json({ message: 'Collection ID and document data are required' });
      return;
    }

    const document = await DocumentService.createDocument(collectionId, documentData);
    res.status(201).json(document);
  } catch (error) {
    logger.error('Error creating document', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      collectionId: req.params.collectionId,
    });
    res.status(500).json({
      message: 'Failed to create document',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Create multiple documents in batch
 */
export const createDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { collectionId } = req.params;
    const { documents, skipDuplicateSlugs = true } = req.body;

    if (!collectionId || !Array.isArray(documents) || documents.length === 0) {
      res.status(400).json({
        message: 'Collection ID and documents array are required',
        format: {
          documents: 'Array of document objects',
          skipDuplicateSlugs: 'Boolean (optional, default: true)',
        },
      });
      return;
    }

    const result = await DocumentService.createDocuments(
      collectionId,
      documents,
      skipDuplicateSlugs,
    );

    res.status(207).json({
      message: `Created ${result.totalSuccessful} documents, failed to create ${result.totalFailed} documents`,
      ...result,
    });
  } catch (error) {
    logger.error('Error creating documents in batch', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      collectionId: req.params.collectionId,
    });
    res.status(500).json({
      message: 'Failed to create documents in batch',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update a document
 */
export const updateDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { collectionId, documentId } = req.params;
    const documentData = req.body;

    if (!collectionId || !documentId || !documentData) {
      res
        .status(400)
        .json({ message: 'Collection ID, Document ID and document data are required' });
      return;
    }

    const document = await DocumentService.updateDocument(collectionId, documentId, documentData);
    res.status(200).json(document);
  } catch (error) {
    logger.error('Error updating document', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      collectionId: req.params.collectionId,
      documentId: req.params.documentId,
    });
    res.status(500).json({
      message: 'Failed to update document',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { collectionId, documentId } = req.params;

    if (!collectionId || !documentId) {
      res.status(400).json({ message: 'Collection ID and Document ID are required' });
      return;
    }

    await DocumentService.deleteDocument(collectionId, documentId);
    res.status(204).end();
  } catch (error) {
    logger.error('Error deleting document', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      collectionId: req.params.collectionId,
      documentId: req.params.documentId,
    });
    res.status(500).json({
      message: 'Failed to delete document',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get total document count for a collection
 *
 * This endpoint returns the total count of documents in a collection.
 */
export const getDocumentCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { collectionId } = req.params;

    if (!collectionId) {
      res.status(400).json({ message: 'Collection ID is required' });
      return;
    }

    // Using the DocumentService to get all documents with a minimal limit just to get the total
    const documents = await DocumentService.getDocuments(collectionId, { limit: 1 });

    res.status(200).json({
      collectionId,
      total: documents.total,
    });
  } catch (error) {
    logger.error('Error fetching document count', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      collectionId: req.params.collectionId,
    });
    res.status(500).json({
      message: 'Failed to fetch document count',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
