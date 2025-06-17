// filepath: d:\work\sondoannam\hobbies\meme-dock\apps\api\src\docs\file-storage.md
# File Storage API Documentation

## Overview

The File Storage API provides endpoints for managing files in the Meme Dock application. It handles uploading, downloading, and managing meme media files (images, GIFs, videos) stored in Appwrite's storage service.

## Authentication

All file endpoints require authentication using the `adminAuth` middleware. Include a valid authentication token in the `Authorization` header.

## Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "message": "Description of the error",
  "code": "ErrorType"
}
```

Common error codes:
- `FileError`: Issues related to file operations
- `ConfigError`: Server configuration issues
- `InternalServerError`: Generic server errors

## Endpoints

### Upload Single File

**POST** `/api/files/upload`

Upload a single file to the storage bucket.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with key `file` containing the file to upload

**Response:**
```json
{
  "success": true,
  "file": {
    "$id": "unique-file-id",
    "bucketId": "meme-bucket-id",
    "name": "filename.jpg",
    "mimeType": "image/jpeg",
    "sizeOriginal": 123456,
    "chunksTotal": 1,
    "chunksUploaded": 1
  }
}
```

### Upload Multiple Files

**POST** `/api/files/upload/multiple`

Upload multiple files in a single request.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with key `files` containing multiple files to upload (max 10)

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "$id": "unique-file-id-1",
      "bucketId": "meme-bucket-id",
      "name": "filename1.jpg",
      "mimeType": "image/jpeg",
      "sizeOriginal": 123456,
      "chunksTotal": 1,
      "chunksUploaded": 1
    },
    {
      "$id": "unique-file-id-2",
      "bucketId": "meme-bucket-id",
      "name": "filename2.gif",
      "mimeType": "image/gif",
      "sizeOriginal": 234567,
      "chunksTotal": 1,
      "chunksUploaded": 1
    }
  ]
}
```

### Get File Metadata

**GET** `/api/files/:fileId/metadata`

Get metadata information about a specific file.

**Response:**
```json
{
  "success": true,
  "file": {
    "$id": "unique-file-id",
    "bucketId": "meme-bucket-id",
    "name": "filename.jpg",
    "mimeType": "image/jpeg",
    "sizeOriginal": 123456,
    "chunksTotal": 1,
    "chunksUploaded": 1
  }
}
```

### Get File Download URL

**GET** `/api/files/:fileId/download`

Get a URL to download the full-sized file.

**Response:**
```json
{
  "success": true,
  "url": "https://appwrite-storage.example.com/download/files/meme-bucket-id/unique-file-id"
}
```

### Get File Preview URL

**GET** `/api/files/:fileId/preview`

Get a URL for a resized preview of the file.

**Query Parameters:**
- `width` (optional): Width of the preview in pixels
- `height` (optional): Height of the preview in pixels
- `quality` (optional): Quality of the image (1-100)

**Response:**
```json
{
  "success": true,
  "url": "https://appwrite-storage.example.com/preview/files/meme-bucket-id/unique-file-id?width=300&height=200"
}
```

### Get File View URL

**GET** `/api/files/:fileId/view`

Get a URL to view the file in the browser.

**Response:**
```json
{
  "success": true,
  "url": "https://appwrite-storage.example.com/view/files/meme-bucket-id/unique-file-id"
}
```

### List Files

**GET** `/api/files`

List all files in the storage bucket.

**Query Parameters:**
- `limit` (optional): Number of files to return
- `offset` (optional): Number of files to skip

**Response:**
```json
{
  "success": true,
  "files": {
    "total": 42,
    "files": [
      {
        "$id": "unique-file-id-1",
        "bucketId": "meme-bucket-id",
        "name": "filename1.jpg",
        "mimeType": "image/jpeg",
        "sizeOriginal": 123456,
        "chunksTotal": 1,
        "chunksUploaded": 1
      },
      {
        "$id": "unique-file-id-2",
        "bucketId": "meme-bucket-id",
        "name": "filename2.gif",
        "mimeType": "image/gif",
        "sizeOriginal": 234567,
        "chunksTotal": 1,
        "chunksUploaded": 1
      }
    ]
  }
}
```

### Delete File

**DELETE** `/api/files/:fileId`

Delete a file from the storage bucket.

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

## File Validation

The API validates files against the following criteria:
- Maximum file size: 10MB
- Supported MIME types:
  - Images: jpeg, png, gif, webp, svg, tiff
  - Videos: mp4, webm, ogg, quicktime
  - Other: application/octet-stream

## Testing

A test page for file upload and download is available at `/upload-test`. You can use this page to:
1. Test single file uploads
2. Test multiple file uploads
3. Get file metadata
4. Generate download, preview, and view URLs

## Error Handling Examples

### File Too Large
```json
{
  "success": false,
  "message": "File too large. Maximum size is 10.0MB",
  "code": "FileError"
}
```

### Invalid File Type
```json
{
  "success": false,
  "message": "Unsupported file type: application/pdf",
  "code": "FileError"
}
```

### File Not Found
```json
{
  "success": false,
  "message": "Error fetching file metadata: File not found",
  "code": "FileError"
}
```
