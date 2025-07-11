import { DocumentList } from '@/types';
import apiClient from '../api/api-client';

export interface DocumentCountPeriod {
  period: string;
  count: number;
  periodStartDate: string;
  periodEndDate: string;
}

export interface DocumentIncreaseResponse {
  collectionId: string;
  duration: 'day' | 'week' | 'month';
  periods: DocumentCountPeriod[];
}

export interface GetDocumentIncreaseParams {
  collectionId: string;
  duration?: 'day' | 'week' | 'month';
  limit?: number;
}

export interface GetDocumentCountResponse {
  collectionId: string;
  total: number;
}

export interface GetDocumentsParams {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderType?: 'asc' | 'desc';
  queries?: string[];
}

export const documentApi = {
  /**
   * Get document count increases over time
   * @param params Parameters for the request (collectionId, duration, limit)
   * @returns Promise with the document increase data
   */ getDocumentIncreases: async (
    params: GetDocumentIncreaseParams,
  ): Promise<DocumentIncreaseResponse> => {
    const { collectionId, duration = 'month', limit = 12 } = params;

    // Use the custom param serializer through axios params
    const queryParams = {
      duration,
      limit,
    };

    const response = await apiClient.get<DocumentIncreaseResponse>(
      `/documents/${collectionId}/increases`,
      { params: queryParams },
    );

    return response.data;
  },

  /**
   * Get total document count for a collection
   * @param collectionId ID of the collection to count documents for
   * @returns Promise with the total document count
   */
  getDocumentCount: async (collectionId: string): Promise<GetDocumentCountResponse> => {
    const response = await apiClient.get<GetDocumentCountResponse>(
      `/documents/${collectionId}/count`,
    );
    return response.data;
  },

  /**
   * Get documents from a collection
   * @param collectionId ID of the collection to retrieve documents from
   * @param options Optional parameters for pagination, sorting, and filtering
   * @returns Promise with the list of documents
   */
  async getDocuments<T = unknown>(
    collectionId: string,
    options: GetDocumentsParams = {},
  ) {
    const { limit, offset, orderBy, orderType, queries } = options;

    // Create params object for axios
    // Use URLSearchParams for parameter serialization
    const params = new URLSearchParams();
    if (limit !== undefined) params.append('limit', limit.toString());
    if (offset !== undefined) params.append('offset', offset.toString());
    if (orderBy) params.append('orderBy', orderBy);
    if (orderType) params.append('orderType', orderType);
    if (queries && queries.length > 0) {
      queries.forEach(query => params.append('queries', query));
    }

    const response = await apiClient.get<DocumentList<T>>(`/documents/${collectionId}?${params.toString()}`);
    return response.data;
  },
  /**
   * Get a single document from a collection by ID
   * @param collectionId ID of the collection
   * @param documentId ID of the document to retrieve
   * @returns Promise with the document data
   */
  async getDocument<T = unknown>(collectionId: string, documentId: string) {
    const response = await apiClient.get<T>(`/documents/${collectionId}/${documentId}`);
    return response.data;
  },
  /**
   * Create a document in a collection
   * @param collectionId ID of the collection to create the document in
   * @param data Document data to create
   * @returns Promise with the created document
   */
  async createDocument<T = unknown, D = unknown>(collectionId: string, data: D) {
    const response = await apiClient.post<T>(`/documents/${collectionId}`, data);
    return response.data;
  },

  /**
   * Update a document in a collection
   * @param collectionId ID of the collection
   * @param documentId ID of the document to update
   * @param data Updated document data
   * @returns Promise with the updated document
   */
  async updateDocument<T = unknown, D = unknown>(
    collectionId: string,
    documentId: string,
    data: D,
  ) {
    const response = await apiClient.put<T>(`/documents/${collectionId}/${documentId}`, data);
    return response.data;
  },

  /**
   * Delete a document from a collection
   * @param collectionId ID of the collection
   * @param documentId ID of the document to delete
   * @returns Promise that resolves when the document is deleted
   */  
  async deleteDocument(collectionId: string, documentId: string) {
    await apiClient.delete(`/documents/${collectionId}/${documentId}`);
  },

  /**
   * Create multiple documents in a collection (batch creation)
   * @param collectionId ID of the collection to create documents in
   * @param documents Array of document data to create
   * @param skipDuplicateSlugs Whether to skip documents with duplicate slugs (default: true)
   * @returns Promise with the batch creation results
   */  async createDocuments(
    collectionId: string, 
    documents: Record<string, unknown>[], 
    skipDuplicateSlugs = true
  ) {
    const response = await apiClient.post(`/documents/${collectionId}/batch`, {
      documents,
      skipDuplicateSlugs
    });
    return response.data;
  },
};
