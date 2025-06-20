# Meme Creation Event Handler

This Appwrite Function is designed to automatically update usage counts for objects, tags, and moods whenever a new meme is created in the Meme Dock system.

## Function Purpose

The function serves as an event handler that triggers when a new meme document is created in the Appwrite database. It extracts the related objectIds, tagIds, and moodIds from the meme document and calls the `increase-usage-count` function to:

1. Increment the `usageCount` for each related entity (objects, tags, and moods)
2. Update the `lastUsedAt` timestamp for each entity
3. Create usage records to track when and how these entities are used

## Trigger Configuration

This function should be configured with the following trigger settings in the Appwrite Console:

- **Type**: Database Event
- **Event**: `databases.*.collections.memes.documents.*.create` (triggers when any new meme document is created)
- **Settings**: No additional settings required

## Environment Variables

This function requires the following environment variables:

- `APPWRITE_FUNCTION_ID`: The ID of the `increase-usage-count` function that will be called to update the usage counts

## Function Flow

1. Receives a database event when a new meme document is created
2. Extracts the meme ID and related objectIds, tagIds, and moodIds from the event data
3. For each type of entity (objects, tags, and moods):
   - If there are any IDs of that type, calls the `increase-usage-count` function with appropriate parameters
4. Returns a summary of the actions taken

## Example Event Data

The function expects to receive event data in this format:

```json
{
  "$id": "meme-document-id",
  "objectIds": ["object-id-1", "object-id-2"],
  "tagIds": ["tag-id-1"],
  "moodIds": ["mood-id-1", "mood-id-2"]
}
```

## Integration with Other Functions

This function works in conjunction with:

- `increase-usage-count`: Called by this function to update usage counts and create usage records
- `calculate-trending-scores`: A scheduled function that processes usage data to calculate trending scores

Together, these functions ensure that the Meme Dock system automatically tracks and analyzes the popularity of different objects, tags, and moods used in memes.

## Converting to TypeScript

For a TypeScript implementation of this function, consider creating a file named `main.ts.reference` with strong typing for event data and function parameters.
