import express, { Router } from 'express';
import * as CollectionController from '../controllers/collections';

const router: Router = express.Router();

// GET /api/collections - Get all collections
router.get('/', CollectionController.getCollections);

// POST /api/collections - Create a new collection
router.post('/', CollectionController.createCollection);

// PUT /api/collections/:id - Update a collection
router.put('/:id', CollectionController.updateCollection);

// POST /api/collections/batch - Create multiple collections
router.post('/batch', CollectionController.createCollections);

// DELETE /api/collections/:id - Delete a collection
router.delete('/:id', CollectionController.deleteCollection);

export default router;
