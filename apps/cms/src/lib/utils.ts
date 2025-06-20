import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getAppwriteImageUrl = (fileId: string, type: 'view' | 'preview' | 'download' = 'view', options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
}): string => {
  const endpoint = process.env.VITE_APPWRITE_ENDPOINT?.endsWith('/')
    ? process.env.VITE_APPWRITE_ENDPOINT.slice(0, -1)
    : process.env.VITE_APPWRITE_ENDPOINT;
  const projectId = process.env.VITE_APPWRITE_PROJECT_ID;
  const bucketId = process.env.VITE_APPWRITE_BUCKET_ID || 'meme-content';
  
  if (!endpoint || !projectId || !bucketId) {
    console.error('Missing Appwrite configuration');
    throw new Error('Missing required Appwrite configuration for image URL generation');
  }

  // Construct base URL
  let url = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/${type}?project=${projectId}`;
  
  // Add optional parameters for preview
  if (type === 'preview' && options) {
    if (options.width) url += `&width=${options.width}`;
    if (options.height) url += `&height=${options.height}`;
    if (options.quality && options.quality >= 0 && options.quality <= 100) url += `&quality=${options.quality}`;
    if (options.format) url += `&output=${options.format}`;
  }
  
  return url;
};