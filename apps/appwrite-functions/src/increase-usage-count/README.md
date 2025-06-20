# Increase Usage Count Function

This Appwrite Function increases the usage count for objects, tags, or moods in the Meme Dock application.

## Function Purpose

This function:
1. Updates the `usageCount` and `lastUsedAt` fields for specified documents
2. Optionally creates usage records in the respective `*_usages` collections
3. Handles batch processing for multiple IDs in a single request

## Request Format

```json
{
  "collectionType": "object", // or "tag" or "mood"
  "ids": ["id1", "id2", "id3"], // Array of document IDs to update
  "memeId": "meme-123", // Optional: related meme ID
  "eventType": "upload", // Optional: "upload", "copy", or "download" (default: "upload")
  "userId": "user-123" // Optional: user who performed the action
}
```

## Environment Variables

This function requires the following environment variables:

```
DATABASE_ID=your-database-id
OBJECT_COLLECTION_ID=objects
TAG_COLLECTION_ID=tags
MOOD_COLLECTION_ID=moods
OBJECT_USAGES_COLLECTION_ID=object_usages
TAG_USAGES_COLLECTION_ID=tag_usages
MOOD_USAGES_COLLECTION_ID=mood_usages
```

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Usage count increased successfully for 3 object(s). Failed: 0.",
  "data": {
    "results": [
      {
        "id": "id1",
        "success": true,
        "newCount": 5
      },
      {
        "id": "id2",
        "success": true,
        "newCount": 2
      },
      {
        "id": "id3",
        "success": true,
        "newCount": 1
      }
    ],
    "successful": 3,
    "failed": 0,
    "total": 3
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Integration Options

This function can be triggered in several ways:

1. **Directly** via HTTP endpoint
2. **Database Event**: Configure as a trigger on meme document creation
3. **Scheduled**: For batch processing or trending score calculations

## Usage Examples

### Example 1: Update object usage counts when a new meme is created

Configure this function to trigger on the `databases.*.collections.memes.documents.*.create` event.
The function will extract `objectIds`, `tagIds`, and `moodIds` from the new meme document and update their usage counts.

### Example 2: Update usage counts when a meme is downloaded

Call this function directly when a user downloads a meme, passing the appropriate IDs and setting `eventType` to "download".
