// Define document model types

export interface DocumentData {
  [key: string]: any;
}

export interface DocumentResponse {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  [key: string]: any;
}

export interface ListDocumentsResponse {
  total: number;
  documents: DocumentResponse[];
}
