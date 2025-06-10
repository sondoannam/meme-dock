import { Express } from 'express';
import collectionRoutes from './collections';
import documentRoutes from './documents';

export function initRoutes(app: Express): void {
  // Apply all routes
  app.use('/api/collections', collectionRoutes);
  app.use('/api/documents', documentRoutes);
}
