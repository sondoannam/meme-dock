import { CollectionSchemaType } from '@/validators';
import apiClient from '../api/api-client';

// Collection API service
export const collectionApi = {
  // Get all collections
  async getCollections() {
    const response = await apiClient.get<CollectionSchemaType[]>('/collections');
    return response.data;
  },

  // Get a collection by ID
  async getCollection(id: string) {
    const response = await apiClient.get<CollectionSchemaType>(`/collections/${id}`);
    return response.data;
  },

  // Create a collection
  async createCollection(collection: CollectionSchemaType) {
    const response = await apiClient.post<CollectionSchemaType>('/collections', collection);
    return response.data;
  },

  // Update a collection
  async updateCollection(id: string, collection: CollectionSchemaType) {
    const response = await apiClient.put<CollectionSchemaType>(`/collections/${id}`, collection);
    return response.data;
  },

  // Create multiple collections (batch)
  async createCollections(collections: CollectionSchemaType[]) {
    const response = await apiClient.post<CollectionSchemaType[]>(
      '/collections/batch',
      collections,
    );
    return response.data;
  },

  // Delete a collection
  async deleteCollection(id: string): Promise<void> {
    await apiClient.delete(`/collections/${id}`);
  },
};
