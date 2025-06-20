import apiClient from '../api/api-client';

export interface ImageUploadOptions {
  platform?: 'appwrite' | 'imagekit';
  fileName?: string;
  folder?: string;
  tags?: string[];
  useUniqueFileName?: boolean;
  customMetadata?: Record<string, any>;
  maxFileSize?: number;
  allowedTypes?: string[];
}

export interface ImageMetadata {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  url: string;
  thumbnailUrl?: string;
  createdAt?: string;
  tags?: string[];
}

function appendUploadOptions(formData: FormData, options: ImageUploadOptions) {
  if (options.platform) {
    formData.append('platform', options.platform);
  }

  if (options.fileName) {
    formData.append('fileName', options.fileName);
  }

  if (options.folder) {
    formData.append('folder', options.folder);
  }

  if (options.tags && options.tags.length > 0) {
    options.tags.forEach((tag) => {
      formData.append('tags[]', tag);
    });
  }

  if (options.useUniqueFileName !== undefined) {
    formData.append('useUniqueFileName', String(options.useUniqueFileName));
  }

  if (options.customMetadata) {
    formData.append('customMetadata', JSON.stringify(options.customMetadata));
  }
}

export interface ImageUploadResponse {
  success: boolean;
  data: ImageMetadata;
}

// Image API service
export const imageApi = {
  // Upload an image to specified platform
  async uploadImage(file: File, options: ImageUploadOptions = {}) {
    const formData = new FormData();
    formData.append('file', file);

    appendUploadOptions(formData, options);

    const response = await apiClient.post<ImageUploadResponse>('/images/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Upload multiple images
  async uploadMultipleImages(files: File[], options: ImageUploadOptions = {}) {
    const formData = new FormData();

    // Add files to formData
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    appendUploadOptions(formData, options);

    const response = await apiClient.post<ImageMetadata[]>('/images/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Get image metadata
  async getImageMetadata(imageId: string, platform?: string) {
    const params = platform ? { platform } : {};
    const response = await apiClient.get<ImageMetadata>(`/images/${imageId}`, { params });
    return response.data;
  },

  // Delete image
  async deleteImage(imageId: string, platform?: string) {
    const params = platform ? { platform } : {};
    await apiClient.delete(`/images/${imageId}`, { params });
  },
};

export default imageApi;
