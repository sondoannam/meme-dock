import { Express } from 'express';
import collectionRoutes from './collections';
import documentRoutes from './documents';
import authRoutes from './auth';
import { adminAuth } from '../middleware/auth.middleware';

export function initRoutes(app: Express): void {
  // Auth routes (some public, some protected)
  app.use('/api/auth', authRoutes);

  // Protected routes requiring admin access
  app.use('/api/collections', adminAuth, collectionRoutes);
  app.use('/api/documents', adminAuth, documentRoutes);
}
