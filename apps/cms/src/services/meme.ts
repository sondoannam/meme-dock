import { ImageUploadFormValues } from '@/validators';
import { documentApi, GetDocumentsParams } from './document';
import { MemeDocument } from '@/types';

export interface CreateMemeParams {
  title_en: string;
  title_vi: string;
  desc_en?: string;
  desc_vi?: string;
  type: 'image' | 'gif' | 'video';
  objectIds: string[];
  tagIds: string[];
  moodIds: string[];
  fileId: string;
  saved_platform: 'appwrite' | 'imagekit';
}

// Meme API service
export const memeApi = {
  // Create a meme document
  async createMeme(memeCollectionId: string, data: CreateMemeParams) {
    return documentApi.createDocument<MemeDocument, CreateMemeParams>(memeCollectionId, data);
  },
  
  // Get meme document by ID
  async getMeme(memeCollectionId: string, memeId: string) {
    return documentApi.getDocument<MemeDocument>(memeCollectionId, memeId);
  },
  
  // Get all meme documents with pagination
  async getMemes(memeCollectionId: string, params?: GetDocumentsParams) {
    return documentApi.getDocuments<MemeDocument>(memeCollectionId, params);
  },
  
  // Update a meme document
  async updateMeme(memeCollectionId: string, memeId: string, data: Partial<CreateMemeParams>) {
    return documentApi.updateDocument<MemeDocument, Partial<CreateMemeParams>>(memeCollectionId, memeId, data);
  },
  
  // Delete a meme document
  async deleteMeme(memeCollectionId: string, memeId: string) {
    return documentApi.deleteDocument(memeCollectionId, memeId);
  },

  // Helper function to transform form values to API params
  // This can be used when submitting the form
  transformFormToApiParams(
    formValues: ImageUploadFormValues, 
    fileId: string,
    platform: 'appwrite' | 'imagekit'
  ): CreateMemeParams {
    return {
      title_en: formValues.title_en,
      title_vi: formValues.title_vi,
      desc_en: formValues.description || undefined,
      desc_vi: formValues.description || undefined, // Using same description for both languages
      type: 'image',
      objectIds: formValues.objects || [],
      tagIds: formValues.tags || [],
      moodIds: formValues.moods || [],
      fileId,
      saved_platform: platform
    };
  }
};

export default memeApi;
