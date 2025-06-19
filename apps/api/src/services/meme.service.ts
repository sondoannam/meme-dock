import { databases, DATABASE_ID } from '../config/appwrite';
import { DocumentResponse } from '../models/document';
import { getDocuments, GetDocumentsParams } from './document.service';

/**
 * Meme document structure
 */
export interface MemeDocument {
  title_en?: string;
  title_vi?: string;
  desc_en: string;
  desc_vi: string;
  type: 'image' | 'gif' | 'video';
  objectIds: string[];
  tagIds: string[];
  moodIds: string[];
  fileId: string;
  filePreview?: string;
  saved_platform: 'appwrite' | 'imagekit';
  usageCount?: number;
}

/**
 * Format a raw document from Appwrite by removing system fields and renaming them
 * @param doc Raw document from Appwrite
 * @returns Clean document with renamed system fields
 */
function formatDocument(doc: any): DocumentResponse {
  // Extract values we want to keep
  const { $id, $createdAt, $updatedAt, $collectionId, ...restOfDoc } = doc;

  // remove other variables starting with $
  Object.keys(restOfDoc).forEach((key) => {
    if (key.startsWith('$')) {
      delete restOfDoc[key];
    }
  });

  // Return cleaned object with renamed fields
  return {
    ...restOfDoc,
    id: $id,
    collectionId: $collectionId,
    createdAt: $createdAt || '',
    updatedAt: $updatedAt || '',
  };
}

/**
 * Service for meme-specific document operations
 */
export class MemeService {
  static async getMemes(memeCollectionId: string, params: GetDocumentsParams = {}) {
    return getDocuments<MemeDocument>(memeCollectionId, params);
  }

  /**
   * Increment the usage count of a meme
   * @param memeId The ID of the meme to update
   * @returns The updated meme document
   */
  static async incrementUsageCount(
    memeCollectionId: string,
    memeId: string,
  ): Promise<DocumentResponse> {
    try {
      // Get current document to get its current usageCount
      const currentDoc = await databases.getDocument(DATABASE_ID, memeCollectionId, memeId);

      const currentCount = currentDoc.usageCount || 0;

      // Update with incremented count
      const document = await databases.updateDocument(DATABASE_ID, memeCollectionId, memeId, {
        usageCount: currentCount + 1,
      });

      return formatDocument(document);
    } catch (error) {
      console.error(`Error incrementing usage count for meme ${memeId}:`, error);
      throw error;
    }
  }
}
