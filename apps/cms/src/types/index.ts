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