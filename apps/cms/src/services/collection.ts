import { CUCollectionFieldValues } from '@/validators';
import { Collection } from '@/types';
import apiClient from '../api/api-client';

// Collection API service
export const collectionApi = {
  // Get all collections
  async getCollections() {
    const response = await apiClient.get<Collection[]>('/collections');
    return response.data;
  },

  // Get a collection by ID
  async getCollection(id: string) {
    const response = await apiClient.get<Collection>(`/collections/${id}`);
    return response.data;
  },

  // Create a collection
  async createCollection(collection: CUCollectionFieldValues) {
    const response = await apiClient.post<Collection>('/collections', collection);
    return response.data;
  },

  // Update a collection
  async updateCollection(id: string, collection: CUCollectionFieldValues) {
    const response = await apiClient.put<Collection>(`/collections/${id}`, collection);
    return response.data;
  },

  // Create multiple collections (batch)
  async createCollections(collections: CUCollectionFieldValues[]) {
    const response = await apiClient.post<Collection[]>(
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
