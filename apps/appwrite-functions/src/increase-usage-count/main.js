import { Client, Databases } from 'node-appwrite';

const {
  APPWRITE_DATABASE_ID,
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  OBJECT_COLLECTION_ID,
  TAG_COLLECTION_ID,
  MOOD_COLLECTION_ID,
  OBJECT_USAGES_COLLECTION_ID,
  TAG_USAGES_COLLECTION_ID,
  MOOD_USAGES_COLLECTION_ID,
} = process.env;

/**
 * Function to increase usage count for objects, tags, or moods
 *
 * Expected request body:
 * {
 *   collectionType: 'object' | 'tag' | 'mood',
 *   ids: string[],
 *   memeId?: string,
 *   eventType?: 'upload' | 'copy' | 'download',
 *   userId?: string
 * }
 */
export default async function ({ req, res, log }) {
  log('Increase usage count function started');

  const KEY = req.headers['x-appwrite-key'];

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(KEY);

  const databases = new Databases(client);

  try {
    log('log info:', req['body']);
    const bodyData = req['body'] || {};

    if (
      !bodyData['collectionType'] ||
      !bodyData['ids'] ||
      !Array.isArray(bodyData['ids']) ||
      bodyData['ids'].length === 0
    ) {
      return res.json(
        {
          success: false,
          message: 'Invalid request. Required parameters: collectionType (string) and ids (array).',
        },
        400,
      );
    }

    const collectionType = bodyData['collectionType'];
    const ids = bodyData['ids'] || [];
    const memeId = bodyData['memeId'];
    const eventType = bodyData['eventType'] || 'upload';
    const userId = bodyData['userId'];

    // Get collection IDs from environment variables
    const collectionMap = {
      object: {
        collection: OBJECT_COLLECTION_ID,
        usagesCollection: OBJECT_USAGES_COLLECTION_ID,
        idField: 'objectId',
      },
      tag: {
        collection: TAG_COLLECTION_ID,
        usagesCollection: TAG_USAGES_COLLECTION_ID,
        idField: 'tagId',
      },
      mood: {
        collection: MOOD_COLLECTION_ID,
        usagesCollection: MOOD_USAGES_COLLECTION_ID,
        idField: 'moodId',
      },
    };

    log('Collection', collectionMap[collectionType]);

    // Validate collection type
    if (!collectionMap[collectionType]) {
      return res.json(
        {
          success: false,
          message: `Invalid collection type: ${collectionType}. Supported types: object, tag, mood.`,
        },
        400,
      );
    }

    // Get collection details
    const { collection, usagesCollection, idField } = collectionMap[collectionType];

    // Check if collection ID is available
    if (!APPWRITE_DATABASE_ID || !collection || !usagesCollection) {
      return res.json(
        {
          success: false,
          message: `Missing environment variables for ${collectionType} collections.`,
        },
        500,
      );
    }

    // Create a date string for lastUsedAt
    const currentDate = new Date().toISOString();

    // Process each ID in parallel
    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          // 1. Get the current document
          const document = await databases.getDocument(APPWRITE_DATABASE_ID, collection, id);
          // 2. Increment usage count and update lastUsedAt
          const currentCount = document.usageCount || 0;
          await databases.updateDocument(APPWRITE_DATABASE_ID, collection, id, {
            usageCount: currentCount + 1,
            lastUsedAt: currentDate,
          });

          // 3. Add usage record if memeId is provided
          if (memeId && usagesCollection) {
            const usageRecord = {
              [idField]: id,
              memeId,
              eventType,
              timestamp: currentDate,
            };

            // Add userId if provided
            if (userId) {
              usageRecord.userId = userId;
            }

            await databases.createDocument(
              APPWRITE_DATABASE_ID,
              usagesCollection,
              'unique()', // Let Appwrite generate a unique ID
              usageRecord,
            );
          }

          return {
            id,
            success: true,
            newCount: currentCount + 1,
          };
        } catch (err) {
          log(`Error updating ${collectionType} with ID ${id}:`, err);
          return {
            id,
            success: false,
            error: err.message,
          };
        }
      }),
    );

    // Count successful and failed operations
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return res.json({
      success: true,
      message: `Usage count increased successfully for ${successful} ${collectionType}(s). Failed: ${failed}.`,
      data: {
        results,
        successful,
        failed,
        total: ids.length,
      },
    });
  } catch (err) {
    log('Error in increase usage count function:', err);
    return res.json(
      {
        success: false,
        message: 'Error increasing usage count',
        error: err.message,
      },
      500,
    );
  }
}
