import { CollectionSchemaType } from '@/validators/collection-schema';
import apiClient from './api-client';

// Collection API service
export const CollectionApi = {
  // Get all collections
  async getCollections(): Promise<CollectionSchemaType[]> {
    const response = await apiClient.get('/collections');
    return response.data;
  },

  // Get a collection by ID
  async getCollection(id: string): Promise<CollectionSchemaType> {
    const response = await apiClient.get(`/collections/${id}`);
    return response.data;
  },

  // Create a collection
  async createCollection(collection: CollectionSchemaType): Promise<CollectionSchemaType> {
    const response = await apiClient.post('/collections', collection);
    return response.data;
  },

  // Create multiple collections (batch)
  async createCollections(collections: CollectionSchemaType[]): Promise<CollectionSchemaType[]> {
    const response = await apiClient.post('/collections/batch', collections);
    return response.data;
  },

  // Delete a collection
  async deleteCollection(id: string): Promise<void> {
    await apiClient.delete(`/collections/${id}`);
  },
};

// Document API service
export const DocumentApi = {
  // Get documents from a collection
  async getDocuments(
    collectionId: string,
    options: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      orderType?: string;
      queries?: string[];
    } = {},
  ) {
    const { limit, offset, orderBy, orderType, queries } = options;

    // Build query parameters
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));
    if (offset) params.append('offset', String(offset));
    if (orderBy) params.append('orderBy', orderBy);
    if (orderType) params.append('orderType', orderType);
    if (queries && queries.length) {
      queries.forEach((q) => params.append('queries', q));
    }

    const response = await apiClient.get(`/documents/${collectionId}`, { params });
    return response.data;
  },

  // Get a document by ID
  async getDocument(collectionId: string, documentId: string) {
    const response = await apiClient.get(`/documents/${collectionId}/${documentId}`);
    return response.data;
  },

  // Create a document
  async createDocument(collectionId: string, data: Record<string, any>) {
    const response = await apiClient.post(`/documents/${collectionId}`, data);
    return response.data;
  },

  // Update a document
  async updateDocument(collectionId: string, documentId: string, data: Record<string, any>) {
    const response = await apiClient.put(`/documents/${collectionId}/${documentId}`, data);
    return response.data;
  },

  // Delete a document
  async deleteDocument(collectionId: string, documentId: string) {
    await apiClient.delete(`/documents/${collectionId}/${documentId}`);
  },
};
