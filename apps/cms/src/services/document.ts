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

export const documentApi = {
  /**
   * Get document count increases over time
   * @param params Parameters for the request (collectionId, duration, limit)
   * @returns Promise with the document increase data
   */
  getDocumentIncreases: async (
    params: GetDocumentIncreaseParams,
  ): Promise<DocumentIncreaseResponse> => {
    const { collectionId, duration = 'month', limit = 12 } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('duration', duration);
    if (limit) queryParams.append('limit', limit.toString());

    const response = await apiClient.get<DocumentIncreaseResponse>(
      `/documents/${collectionId}/increases?${queryParams.toString()}`,
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

    const params: Record<string, any> = {};
    if (limit !== undefined) params.limit = limit;
    if (offset !== undefined) params.offset = offset;
    if (orderBy) params.orderBy = orderBy;
    if (orderType) params.orderType = orderType;
    queries?.forEach((q) => {
      (params.queries ??= []).push(q);
    });

    const response = await apiClient.get(`/documents/${collectionId}`, { params });
    return response.data;
  },

  /**
   *
   * @param collectionId
   * @param documentId
   * @returns
   */
  async getDocument(collectionId: string, documentId: string) {
    const response = await apiClient.get(`/documents/${collectionId}/${documentId}`);
    return response.data;
  },

  /**
   * Create a document in a collection
   * @param collectionId ID of the collection to create the document in
   * @param data Document data to create
   * @returns Promise with the created document
   */
  async createDocument(collectionId: string, data: Record<string, any>) {
    const response = await apiClient.post(`/documents/${collectionId}`, data);
    return response.data;
  },

  /**
   * Update a document in a collection
   * @param collectionId ID of the collection
   * @param documentId ID of the document to update
   * @param data Updated document data
   * @returns Promise with the updated document
   */
  async updateDocument(collectionId: string, documentId: string, data: Record<string, any>) {
    const response = await apiClient.put(`/documents/${collectionId}/${documentId}`, data);
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
};
