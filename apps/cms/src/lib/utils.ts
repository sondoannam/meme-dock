import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalize text by removing diacritics (accent marks) from characters
 * This is useful for searching Vietnamese text without requiring exact diacritic matches
 * @param text - The text to normalize
 * @returns The normalized text with diacritics removed
 */
export function normalizeText(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Enhanced search function that supports multiple search strategies:
 * - Handles diacritics (accent marks) in Vietnamese and other languages
 * - Supports partial word matching
 * - Case insensitive by default
 * - Can match words in any order
 *
 * @param text - The text to search within
 * @param query - The search query
 * @param options - Configuration options for search behavior
 * @returns boolean indicating if the text matches the search query
 */
export function enhancedSearch(
  text: string,
  query: string,
  options: {
    exactMatch?: boolean;
    caseSensitive?: boolean;
    normalizeAccents?: boolean;
    wholeWordOnly?: boolean;
  } = {}
): boolean {
  if (!query || !text) return !query; // Empty query matches everything, empty text matches nothing

  const {
    exactMatch = false,
    caseSensitive = false,
    normalizeAccents = true,
    wholeWordOnly = false,
  } = options;

  // Prepare text and query based on options
  let normalizedText = text;
  let normalizedQuery = query;

  // Handle case sensitivity
  if (!caseSensitive) {
    normalizedText = text.toLowerCase();
    normalizedQuery = query.toLowerCase();
  }

  // Handle accents/diacritics
  if (normalizeAccents) {
    normalizedText = normalizeText(normalizedText);
    normalizedQuery = normalizeText(normalizedQuery);
  }

  // For exact match (with our preprocessing applied)
  if (exactMatch) {
    return normalizedText === normalizedQuery;
  }

  // For whole word matches
  if (wholeWordOnly) {
    const words = normalizedQuery.split(/\s+/).filter(Boolean);
    const textWords = normalizedText.split(/\s+/).filter(Boolean);
    return words.every((word) => textWords.some((textWord) => textWord === word));
  }

  // For partial matching (default)
  // Split query into words to match them independently
  const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);
  return queryWords.every((word) => normalizedText.includes(word));
}

/**
 * Search function specifically optimized for multi-field object search
 *
 * @param item - The object with fields to search within
 * @param query - The search query
 * @param fields - The fields to search within the object
 * @param options - Configuration options for search behavior
 * @returns boolean indicating if any field in the object matches the search query
 */
export function multiFieldSearch<T>(
  item: T,
  query: string,
  fields: (keyof T)[],
  options: Parameters<typeof enhancedSearch>[2] = {}
): boolean {
  if (!query) return true; // Empty query matches everything

  return fields.some((field) => {
    const fieldValue = item[field];
    if (fieldValue === undefined || fieldValue === null) return false;
    return enhancedSearch(String(fieldValue), query, options);
  });
}

export const getAppwriteImageUrl = (fileId: string, type: "view" | "preview" | "download" = "view", options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
}): string => {
  const endpoint = process.env.VITE_APPWRITE_ENDPOINT?.endsWith("/")
    ? process.env.VITE_APPWRITE_ENDPOINT.slice(0, -1)
    : process.env.VITE_APPWRITE_ENDPOINT;
  const projectId = process.env.VITE_APPWRITE_PROJECT_ID;
  const bucketId = process.env.VITE_APPWRITE_BUCKET_ID || "meme-content";

  if (!endpoint || !projectId || !bucketId) {
    console.error("Missing Appwrite configuration");
    throw new Error("Missing required Appwrite configuration for image URL generation");
  }

  // Construct base URL
  let url = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/${type}?project=${projectId}`;

  // Add optional parameters for preview
  if (type === "preview" && options) {
    if (options.width) url += `&width=${options.width}`;
    if (options.height) url += `&height=${options.height}`;
    if (options.quality && options.quality >= 0 && options.quality <= 100) url += `&quality=${options.quality}`;
    if (options.format) url += `&output=${options.format}`;
  }

  return url;
};