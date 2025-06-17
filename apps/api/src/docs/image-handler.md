# Image Handler Service

This module provides a unified interface for handling images with support for multiple storage platforms (currently Appwrite and ImageKit).

## Features

- Upload single or multiple images
- List images with filtering and pagination
- Get image metadata
- Delete images
- Generate URLs for viewing, downloading, and previewing images with transformations
- Platform switching capability (Appwrite or ImageKit)

## Architecture

The module follows a clean architecture with platform-specific implementations behind a common interface:

- `ImagePlatformService`: Common interface defining operations for all platforms
- `AppwriteImageService`: Implementation for Appwrite
- `ImageKitImageService`: Implementation for ImageKit
- `ImageService`: Factory service that selects the appropriate platform

## Configuration

### Environment Variables

Both platforms require specific environment variables:

#### Appwrite
```
APPWRITE_ENDPOINT=your_endpoint
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=your_database_id
APPWRITE_MEME_BUCKET_ID=your_bucket_id
```

#### ImageKit
```
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_url_endpoint
```

### Installation

Make sure to install the required packages:

```bash
# For Appwrite (already installed)
# For ImageKit
pnpm add imagekit uuid
```

## Usage

### Basic Usage

```typescript
import { ImageService, ImagePlatform } from './services/image';

// Create service (auto-detects available platforms)
const imageService = new ImageService();

// Upload an image (with auto-platform detection)
const result = await imageService.uploadImage(file, {
  folder: '/uploads',
  tags: ['meme', 'funny'],
  isPrivate: false
});

// Upload an image specifically to ImageKit
const result = await imageService.uploadImage(file, {
  folder: '/uploads',
  tags: ['meme', 'funny'],
  platform: ImagePlatform.IMAGEKIT
});

// Get a preview URL with transformations
const previewUrl = imageService.getImagePreviewURL(imageId, {
  width: 300,
  height: 200,
  quality: 80,
  format: 'webp'
});
```

### API Routes

The module provides the following API endpoints:

- `POST /api/images`: Upload a single image
- `POST /api/images/multiple`: Upload multiple images
- `GET /api/images`: List images with optional filtering
- `GET /api/images/:id`: Get a single image's metadata
- `DELETE /api/images/:id`: Delete an image

#### Platform Switching in API

You can specify the platform in API requests:

- As a query parameter: `/api/images?platform=imagekit`
- In the request body: `{ "platform": "appwrite" }`

## Fallback Strategy

The service uses the following strategy to determine which platform to use:

1. If a platform is explicitly specified in the method call, use that platform
2. If no platform is specified but ImageKit is configured, use ImageKit
3. If ImageKit is not configured but Appwrite is, use Appwrite
4. If neither is configured, throw an error

## Error Handling

All platform-specific errors are normalized into our application's error types:
- `ConfigError`: For configuration issues
- `FileError`: For file-related issues

## Future Improvements

Potential enhancements:
- Add support for more platforms (AWS S3, Google Cloud Storage, etc.)
- Implement cache layer for metadata
- Add batch operations for efficiency
- Support file processing/transformations on upload

# Image Handler Documentation

This document provides information on how to use the image handler service in the MemeVerse API.

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Validation Options](#validation-options)
- [API Endpoints](#api-endpoints)
- [Platform Support](#platform-support)

## Overview

The image handler service provides platform-agnostic capabilities for handling image uploads, retrieval, and management. It supports multiple storage platforms (currently Appwrite and ImageKit) and provides a consistent interface for image operations.

## Architecture

The image handler service follows a provider-based architecture:

1. `ImagePlatformService` interface defines the contract for platform-specific implementations
2. Platform-specific implementations (AppwriteImageService, ImageKitImageService) handle platform details
3. `ImageService` factory selects the appropriate platform implementation based on configuration
4. Image controllers provide REST API endpoints for image operations

## Configuration

Each platform requires specific configuration:

### Appwrite
```typescript
// In config/appwrite.ts
export const MEME_BUCKET_ID = process.env.APPWRITE_MEME_BUCKET_ID;
```

### ImageKit
```typescript
// In config/imagekit.ts
export const IMAGEKIT_CONFIG = {
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  isConfigured: Boolean(
    process.env.IMAGEKIT_PUBLIC_KEY &&
    process.env.IMAGEKIT_PRIVATE_KEY &&
    process.env.IMAGEKIT_URL_ENDPOINT
  )
};
```

## Usage Examples

### Basic File Upload

```typescript
import { ImageService } from '../services/image/image.service';

const imageService = new ImageService();

// Single file upload
const file = request.file;
const result = await imageService.uploadImage(file);

// Multiple file upload
const files = request.files;
const results = await imageService.uploadMultipleImages(files);
```

### Upload with Options

```typescript
const options = {
  folder: 'memes/cats',
  tags: ['funny', 'cat', 'reaction'],
  isPrivate: false,
  useUniqueFileName: true,
  validation: {
    maxFileSize: 5 * 1024 * 1024,  // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    maxWidth: 2000,
    maxHeight: 2000
  }
};

const result = await imageService.uploadImage(file, options);
```

## Validation Options

The image handler supports validation options to enforce constraints on uploaded images:

### Standard Options

```typescript
// In your API controller or service layer
const options = {
  validation: {
    maxFileSize: 2 * 1024 * 1024,  // 2MB max
    minFileSize: 1000,             // Minimum 1KB
    allowedTypes: ['image/jpeg', 'image/png'], // Only allow JPEGs and PNGs
    maxWidth: 1920,                // Maximum width in pixels
    maxHeight: 1080                // Maximum height in pixels
  }
};
```

### Default Constants

The system defines sensible defaults for image validation:

```typescript
// From utils/file-validation.ts
export const IMAGE_MAX_FILE_SIZE = 5 * 1024 * 1024;  // 5MB
export const IMAGE_MIN_FILE_SIZE = 100;              // 100 bytes
export const IMAGE_MAX_DIMENSIONS = { width: 4000, height: 4000 };
export const DEFAULT_IMAGE_VALIDATION_OPTIONS = {
  maxSize: IMAGE_MAX_FILE_SIZE,
  minSize: IMAGE_MIN_FILE_SIZE,
  allowedTypes: SUPPORTED_MIME_TYPES.image,
  maxWidth: IMAGE_MAX_DIMENSIONS.width,
  maxHeight: IMAGE_MAX_DIMENSIONS.height
};
```

## API Endpoints

- `POST /api/images` - Upload a single image
- `POST /api/images/multiple` - Upload multiple images
- `GET /api/images/:id` - Get image metadata 
- `GET /api/images` - List images
- `DELETE /api/images/:id` - Delete an image

## Platform Support

### Appwrite
- Storage via Appwrite Storage buckets
- Access control via Appwrite permissions
- Image transformations via Appwrite's preview APIs

### ImageKit
- Storage via ImageKit's serverless file storage
- Access control via ImageKit private folders
- Advanced image transformations via ImageKit's URL parameters
