import { Request, Response } from 'express';
import { CollectionService } from '../services';
import { CUCollectionReq } from '../models/collection-schema';
import { createServiceLogger } from '../utils/logger-utils';

const logger = createServiceLogger('CollectionsController');

/**
 * Get all collections
 */
export const getCollections = async (req: Request, res: Response): Promise<void> => {
  try {
    const collections = await CollectionService.getCollections();
    res.status(200).json(collections);
  } catch (error) {
    logger.error('Error fetching collections', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({
      message: 'Failed to fetch collections',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Create a new collection
 */
export const createCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const collectionData = req.body as CUCollectionReq;

    if (!collectionData || !collectionData.name || !collectionData.fields) {
      res.status(400).json({ message: 'Invalid collection data' });
      return;
    }

    const collection = await CollectionService.createCollection(collectionData);
    res.status(201).json(collection);
  } catch (error) {
    logger.error('Error creating collection', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      collectionData: req.body
    });
    res.status(500).json({
      message: 'Failed to create collection',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update an existing collection
 */
export const updateCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const collectionData = req.body as CUCollectionReq;

    if (!id) {
      res.status(400).json({ message: 'Collection ID is required' });
      return;
    }

    if (!collectionData || !collectionData.name || !collectionData.fields) {
      res.status(400).json({ message: 'Invalid collection data' });
      return;
    }

    try {
      // Update the collection
      const updatedCollection = await CollectionService.updateCollection(id, collectionData);
      res.status(200).json(updatedCollection);
    } catch (error) {
      logger.error('Error updating collection by ID', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        collectionId: id
      });
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ message: `Collection with ID ${id} not found` });
      } else {
        throw error; // Re-throw to be caught by the outer try/catch
      }
    }
  } catch (error) {
    logger.error('Error updating collection', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({
      message: 'Failed to update collection',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Create multiple collections (batch)
 */
export const createCollections = async (req: Request, res: Response): Promise<void> => {
  try {
    const collectionsData = req.body as CUCollectionReq[];

    if (!Array.isArray(collectionsData) || collectionsData.length === 0) {
      res
        .status(400)
        .json({ message: 'Invalid collections data. Expecting an array of collections.' });
      return;
    }

    const collections = await CollectionService.createCollections(collectionsData);
    res.status(201).json(collections);
  } catch (error) {
    logger.error('Error creating collections in batch', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      collectionsCount: req.body.length || 0
    });
    res.status(500).json({
      message: 'Failed to create collections',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Delete a collection
 */
export const deleteCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: 'Collection ID is required' });
      return;
    }

    await CollectionService.deleteCollection(id);
    res.status(204).end();
  } catch (error) {
    logger.error('Error deleting collection', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      collectionId: req.params.id
    });
    res.status(500).json({
      message: 'Failed to delete collection',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
