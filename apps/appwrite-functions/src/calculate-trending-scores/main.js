import { Query, Client, Databases } from 'node-appwrite';

const {
  APPWRITE_DATABASE_ID,
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  OBJECT_COLLECTION_ID,
  OBJECT_USAGES_COLLECTION_ID,
  TAG_COLLECTION_ID,
  TAG_USAGES_COLLECTION_ID,
  MOOD_COLLECTION_ID,
  MOOD_USAGES_COLLECTION_ID
} = process.env;

/**
 * Calculate trending scores for objects, tags, and moods based on usage patterns
 *
 * This function calculates trending scores using the formula:
 * trendingScore = velocity * spikeFactor
 *
 * Where:
 * - velocity = recentUsages / 24 (uses per hour in the last 24 hours)
 * - spikeFactor = velocity / averageUsagePerHour (how much more active recently vs. overall average)
 * - averageUsagePerHour = totalUsages / hoursAlive (average usage per hour since creation)
 *
 */
export default async function ({ req, res, log }) {
  log('Calculate trending scores function started');

  const KEY = req.headers['x-appwrite-key'];

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(KEY);

  const databases = new Databases(client);

  try {
    // Time window for recent usage (hours)
    const RECENT_HOURS = 24;

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

    // Process collections in parallel
    const results = await Promise.all(
      Object.entries(collectionMap).map(async ([type, config]) => {
        try {
          const { collection, usagesCollection, idField } = config;

          // Validate configuration
          if (!APPWRITE_DATABASE_ID || !collection || !usagesCollection) {
            log(`Missing environment variables for ${type} collections. Skipping.`);
            return {
              type,
              success: false,
              error: 'Missing environment variables',
            };
          }

          // Get all documents in this collection
          const documents = await databases.listDocuments(APPWRITE_DATABASE_ID, collection);
          log(`Processing ${documents.total} ${type}(s) for trending calculation`);

          // Calculate cutoff time for recent usage
          const now = new Date();
          const recentCutoff = new Date(now.getTime() - RECENT_HOURS * 60 * 60 * 1000);
          const recentCutoffIso = recentCutoff.toISOString();

          // Update trending scores
          const updateResults = await Promise.all(
            documents.documents.map(async (document) => {
              try {
                // Get document creation time and calculate total hours alive
                const createdAt = new Date(document.$createdAt);
                const totalHours = Math.max(
                  1,
                  Math.floor((now.getTime() - createdAt.getTime()) / (60 * 60 * 1000)),
                );

                // Get total usage count
                const totalUsages = document.usageCount || 0;

                // Get recent usages
                const recentUsages = await databases.listDocuments(
                  APPWRITE_DATABASE_ID,
                  usagesCollection,
                  [
                    Query.equal(idField, document.$id),
                    Query.greaterThanEqual('$createdAt', recentCutoffIso),
                  ],
                );

                // Calculate trending metrics
                const recentCount = recentUsages.total;
                const velocity = recentCount / RECENT_HOURS; // Uses per hour in last 24h
                const averageUsagePerHour = totalUsages / totalHours;

                // Calculate spike factor (how much more active recently vs overall average)
                // Use a minimum value to avoid division by zero
                const spikeFactor =
                  averageUsagePerHour > 0 ? velocity / averageUsagePerHour : velocity > 0 ? 1 : 0;

                // Calculate final trending score
                const trendingScore = velocity * spikeFactor;

                // Update document with trending score
                await databases.updateDocument(APPWRITE_DATABASE_ID, collection, document.$id, {
                  trendingScore,
                });

                return {
                  id: document.$id,
                  success: true,
                  metrics: {
                    totalUsages,
                    recentCount,
                    totalHours,
                    velocity,
                    spikeFactor,
                    trendingScore,
                  },
                };
              } catch (err) {
                log(`Error calculating trending for ${type} ${document.$id}:`, err);
                return {
                  id: document.$id,
                  success: false,
                  error: err.message,
                };
              }
            }),
          );

          // Count successful and failed operations
          const successful = updateResults.filter((r) => r.success).length;
          const failed = updateResults.filter((r) => !r.success).length;

          return {
            type,
            success: true,
            processed: {
              successful,
              failed,
              total: documents.total,
            },
          };
        } catch (err) {
          log(`Error processing ${type} collection:`, err);
          return {
            type,
            success: false,
            error: err.message,
          };
        }
      }),
    );

    return res.json({
      success: true,
      message: 'Trending scores calculated successfully',
      data: {
        results,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    log('Error in calculate trending scores function:', err);
    return res.json(
      {
        success: false,
        message: 'Error calculating trending scores',
        error: err.message,
      },
      500,
    );
  }
}
