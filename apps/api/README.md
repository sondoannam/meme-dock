# Meme-Dock API

A Node.js Express API for interfacing with Appwrite server-side functionality.

## Setup

1. Copy `.env.example` to `.env` and update with your Appwrite credentials:

```bash
cp .env.example .env
```

2. Update the following variables in the `.env` file:

```
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
APPWRITE_DATABASE_ID=your-database-id
```

3. Install dependencies:

```bash
pnpm install
```

4. Run the development server:

```bash
pnpm nx run api:serve
```

## API Endpoints

### Collections

- `GET /api/collections` - Get all collections
- `POST /api/collections` - Create a new collection
- `POST /api/collections/batch` - Create multiple collections
- `DELETE /api/collections/:id` - Delete a collection

### Documents

- `GET /api/documents/:collectionId` - Get all documents in a collection
- `GET /api/documents/:collectionId/:documentId` - Get a document by ID
- `POST /api/documents/:collectionId` - Create a new document
- `PUT /api/documents/:collectionId/:documentId` - Update a document
- `DELETE /api/documents/:collectionId/:documentId` - Delete a document

## Implementation Details

This API uses the `node-appwrite` SDK to interface with Appwrite services from the server-side, providing a more secure approach than using the client-side SDK directly.
