import express, { Router } from 'express';
import * as DocumentController from '../controllers/documents';

const router: Router = express.Router();

// GET /api/documents/:collectionId/increases - Get document count increases over time
router.get('/:collectionId/increases', DocumentController.getDocumentIncreaseOverTime);

// GET /api/documents/:collectionId/count - Get total document count for a collection
router.get('/:collectionId/count', DocumentController.getDocumentCount);

// GET /api/documents/:collectionId - Get all documents for a collection
router.get('/:collectionId', DocumentController.getDocuments);

// GET /api/documents/:collectionId/:documentId - Get a document by ID
router.get('/:collectionId/:documentId', DocumentController.getDocument);

// POST /api/documents/:collectionId - Create a new document
router.post('/:collectionId', DocumentController.createDocument);

// POST /api/documents/:collectionId/batch - Create multiple documents
router.post('/:collectionId/batch', DocumentController.createDocuments);

// PUT /api/documents/:collectionId/:documentId - Update a document
router.put('/:collectionId/:documentId', DocumentController.updateDocument);

// DELETE /api/documents/:collectionId/:documentId - Delete a document
router.delete('/:collectionId/:documentId', DocumentController.deleteDocument);

export default router;
