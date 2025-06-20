import { databases, APPWRITE_DATABASE_ID as DATABASE_ID } from '../config/appwrite';

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
 * 
 * Environment variables:
 * - DATABASE_ID: Appwrite database ID
 * - OBJECT_COLLECTION_ID: Collection ID for objects
 * - TAG_COLLECTION_ID: Collection ID for tags
 * - MOOD_COLLECTION_ID: Collection ID for moods
 * - OBJECT_USAGES_COLLECTION_ID: Collection ID for object usage records
 * - TAG_USAGES_COLLECTION_ID: Collection ID for tag usage records
 * - MOOD_USAGES_COLLECTION_ID: Collection ID for mood usage records
 */
export default async function ({ req, res, log }) {
  log('Increase usage count function started');

  try {
    // Validate request body
    const { collectionType, ids, memeId, eventType = 'upload', userId } = req.body || {};

    if (!collectionType || !ids || !Array.isArray(ids) || ids.length === 0) {
      return res.json({
        success: false,
        message: 'Invalid request. Required parameters: collectionType (string) and ids (array).',
      }, 400);
    }

    // Get collection IDs from environment variables
    const collectionMap = {
      object: {
        collection: process.env.OBJECT_COLLECTION_ID,
        usagesCollection: process.env.OBJECT_USAGES_COLLECTION_ID,
        idField: 'objectId'
      },
      tag: {
        collection: process.env.TAG_COLLECTION_ID,
        usagesCollection: process.env.TAG_USAGES_COLLECTION_ID,
        idField: 'tagId'
      },
      mood: {
        collection: process.env.MOOD_COLLECTION_ID,
        usagesCollection: process.env.MOOD_USAGES_COLLECTION_ID,
        idField: 'moodId'
      }
    };

    // Validate collection type
    if (!collectionMap[collectionType]) {
      return res.json({
        success: false,
        message: `Invalid collection type: ${collectionType}. Supported types: object, tag, mood.`,
      }, 400);
    }

    // Get collection details
    const { collection, usagesCollection, idField } = collectionMap[collectionType];
    
    // Check if collection ID is available
    if (!DATABASE_ID || !collection || !usagesCollection) {
      return res.json({
        success: false,
        message: `Missing environment variables for ${collectionType} collections.`,
      }, 500);
    }

    // Create a date string for lastUsedAt
    const currentDate = new Date().toISOString();
    
    // Process each ID in parallel
    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          // 1. Get the current document
          const document = await databases.getDocument(DATABASE_ID, collection, id);
            // 2. Increment usage count and update lastUsedAt
          const currentCount = document.usageCount || 0;
          await databases.updateDocument(
            DATABASE_ID,
            collection,
            id,
            {
              usageCount: currentCount + 1,
              lastUsedAt: currentDate
            }
          );
          
          // 3. Add usage record if memeId is provided
          if (memeId && usagesCollection) {
            const usageRecord = {
              [idField]: id,
              memeId,
              eventType,
              timestamp: currentDate
            };
            
            // Add userId if provided
            if (userId) {
              usageRecord.userId = userId;
            }
            
            await databases.createDocument(
              DATABASE_ID,
              usagesCollection,
              'unique()',  // Let Appwrite generate a unique ID
              usageRecord
            );
          }
          
          return {
            id,
            success: true,
            newCount: currentCount + 1
          };
        } catch (err) {
          log(`Error updating ${collectionType} with ID ${id}:`, err);
          return {
            id,
            success: false,
            error: err.message
          };
        }
      })
    );
    
    // Count successful and failed operations
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    return res.json({
      success: true,
      message: `Usage count increased successfully for ${successful} ${collectionType}(s). Failed: ${failed}.`,
      data: {
        results,
        successful,
        failed,
        total: ids.length
      },
    });
    
  } catch (err) {
    log('Error in increase usage count function:', err);
    return res.json({
      success: false,
      message: 'Error increasing usage count',
      error: err.message
    }, 500);
  }
}
