import { Express } from 'express';
import collectionRoutes from './collections';
import documentRoutes from './documents';
import fileRoutes from './files';
import imageRoutes from './images';
import authRoutes from './auth';
import translateRoutes from './simple-translate';
import { adminAuth } from '../middleware/auth.middleware';
import { errorHandler } from '../middleware/error.middleware';

export function initRoutes(app: Express): void {
  // Auth routes (some public, some protected)
  app.use('/api/auth', authRoutes);
  // Protected routes requiring admin access
  app.use('/api/collections', adminAuth, collectionRoutes);
  app.use('/api/documents', adminAuth, documentRoutes);
  app.use('/api/files', adminAuth, fileRoutes);  // Image routes with their own middleware for granular access control
  app.use('/api/images', imageRoutes);
  app.use('/api/simple-translate', translateRoutes);

  // Error handling middleware (should be last)
  app.use(errorHandler);
}
