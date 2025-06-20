# Calculate Trending Scores Function

This Appwrite Function calculates trending scores for objects, tags, and moods in the Meme Dock application.

## Function Purpose

This function:
1. Calculates trending scores for all documents in object, tag, and mood collections
2. Uses a time-based algorithm that considers both recent activity and historical usage
3. Updates the `trendingScore` field for each document

## Trending Score Algorithm

The trending score is calculated using the formula:

```
trendingScore = velocity * spikeFactor
```

Where:
- `velocity` = recentUsages / 24 (uses per hour in the last 24 hours)
- `spikeFactor` = velocity / averageUsagePerHour (how much more active recently vs. overall average)
- `averageUsagePerHour` = totalUsages / hoursAlive (average usage per hour since creation)

This algorithm prioritizes items that:
1. Have high recent usage (high velocity)
2. Have significantly more recent usage compared to their historical average (high spike factor)

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
  "message": "Trending scores calculated successfully",
  "data": {
    "results": [
      {
        "type": "object",
        "success": true,
        "processed": {
          "successful": 50,
          "failed": 0,
          "total": 50
        }
      },
      {
        "type": "tag",
        "success": true,
        "processed": {
          "successful": 100,
          "failed": 2,
          "total": 102
        }
      },
      {
        "type": "mood",
        "success": true,
        "processed": {
          "successful": 20,
          "failed": 0,
          "total": 20
        }
      }
    ],
    "timestamp": "2025-06-20T12:34:56.789Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error calculating trending scores",
  "error": "Error message here"
}
```

## Deployment

### Schedule Configuration

This function should be scheduled to run periodically. A recommended schedule is:

```
0 * * * *  # Run every hour
```

You can configure this schedule in the Appwrite Console under the function's settings.
