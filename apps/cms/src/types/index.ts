import { CUCollectionFieldValues } from "@/validators";

export type MemeTagType = {
  id: string;
  label: string;
  usageCount?: number;
  lastUsedAt?: string;
  trendingScore?: number;
};

export type MemeObjectType = {
  id: string;
  label_en: string;
  label_vi: string;
  slug: string;
  // System-managed fields (display only)
  usageCount?: number;
  lastUsedAt?: string;
  trendingScore?: number;
};

export type MemeMoodType = {
  id: string;
  label_en: string;
  label_vi: string;
  slug: string;
  intensity?: number;
  // System-managed fields (display only)
  usageCount?: number;
  lastUsedAt?: string;
  trendingScore?: number;
};

export type DocumentList<T> = {
  documents: T[];
  total: number;
}

export type Collection = CUCollectionFieldValues & {
  id: string;
  createdAt: string;
  updatedAt: string;
  enabled: boolean;
}

export interface MemeDocument {
  id: string;
  title_en: string;
  title_vi: string;
  desc_en?: string;
  desc_vi?: string;
  type: 'image' | 'gif' | 'video';
  objectIds: string[];
  tagIds: string[];
  moodIds: string[];
  fileId: string;
  filePreview: string | null; // Optional preview URL for the file
  saved_platform: 'appwrite' | 'imagekit';
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

/**
 * Translation related types
 */
export interface Language {
  code: string;
  name: string;
}

export interface TranslationParams {
  text: string;
  from?: string;
  to: string;
}

export interface TranslationResponse {
  originalText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
}