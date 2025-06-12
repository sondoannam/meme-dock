# Document Analytics API

This document describes the Document Analytics API that provides insights into document growth over time for collections in the Meme-dock platform.

## Document Increase Over Time

Get the count of documents added to a collection over specified time periods.

### Endpoint

```
GET /api/documents/:collectionId/increases
```

### Path Parameters

| Parameter    | Description                     |
| ------------ | ------------------------------- |
| collectionId | ID of the collection to analyze |

### Query Parameters

| Parameter | Description                                       | Default |
| --------- | ------------------------------------------------- | ------- |
| duration  | Time unit for grouping: 'day', 'week', or 'month' | 'month' |
| limit     | Number of time periods to return                  | 12      |

### Response

```json
{
  "collectionId": "string",
  "duration": "string",
  "periods": [
    {
      "period": "string",
      "count": 0,
      "periodStartDate": "string",
      "periodEndDate": "string"
    }
  ]
}
```

### Example

#### Request

```
GET /api/documents/memes/increases?duration=month&limit=6
```

#### Response

```json
{
  "collectionId": "memes",
  "duration": "month",
  "periods": [
    {
      "period": "January 2025",
      "count": 42,
      "periodStartDate": "2025-01-01T00:00:00.000Z",
      "periodEndDate": "2025-01-31T23:59:59.999Z"
    },
    {
      "period": "February 2025",
      "count": 37,
      "periodStartDate": "2025-02-01T00:00:00.000Z",
      "periodEndDate": "2025-02-28T23:59:59.999Z"
    },
    ...
  ]
}
```

## Implementation Details

The endpoint performs the following steps:

1. Validates the collection ID and duration parameters
2. Generates time periods based on the requested duration
3. Queries Appwrite for documents created in each time period
4. Returns a response with counts for each period

This data can be used to generate graphs showing collection growth over time.
