import { Client, Functions } from 'node-appwrite';

const { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_FUNCTION_ID } = process.env;

/**
 * Handle the creation of a new meme document by updating usage counts
 * for related objects, tags, and moods.
 *
 * This function is designed to be triggered by a database event
 * when a new meme document is created.
 *
 * Environment variables:
 * - APPWRITE_FUNCTION_ID: ID of the increase-usage-count function
 */
export default async function ({ req, res, log }) {
  log('Meme creation handler started');

  const KEY = req.headers['x-appwrite-key'];

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(KEY);

  try {
    log('log info:', String(req));
    // Extract the event data from request body
    const documentData = JSON.parse(String(req)).body;

    // Check if this is a meme document creation event
    if (!documentData || !documentData.$id) {
      return res.json(
        {
          success: false,
          message: 'Invalid event data or not a meme document creation event',
        },
        400,
      );
    }

    // Extract meme ID and relation IDs
    const memeId = documentData.$id;
    const objectIds = documentData.objectIds || [];
    const tagIds = documentData.tagIds || [];
    const moodIds = documentData.moodIds || [];

    // Check if we have any IDs to process
    if (objectIds.length === 0 && tagIds.length === 0 && moodIds.length === 0) {
      log('No relation IDs found in the meme document');
      return res.json({
        success: false,
        message: 'No relation IDs found in the meme document',
      });
    }

    const functions = new Functions(client);
    const results = [];

    // Process objectIds if there are any
    if (objectIds.length > 0) {
      log(`Processing ${objectIds.length} objectIds`);
      const objectResult = await functions.createExecution(
        APPWRITE_FUNCTION_ID,
        JSON.stringify({
          collectionType: 'object',
          ids: objectIds,
          memeId,
          eventType: 'upload',
        }),
        false,
      );
      results.push({
        type: 'object',
        execution: objectResult.$id,
        count: objectIds.length,
      });
    }

    // Process tagIds if there are any
    if (tagIds.length > 0) {
      log(`Processing ${tagIds.length} tagIds`);
      const tagResult = await functions.createExecution(
        increaseUsageCountFunctionId,
        JSON.stringify({
          collectionType: 'tag',
          ids: tagIds,
          memeId,
          eventType: 'upload',
        }),
        false,
      );
      results.push({
        type: 'tag',
        execution: tagResult.$id,
        count: tagIds.length,
      });
    }

    // Process moodIds if there are any
    if (moodIds.length > 0) {
      log(`Processing ${moodIds.length} moodIds`);
      const moodResult = await functions.createExecution(
        increaseUsageCountFunctionId,
        JSON.stringify({
          collectionType: 'mood',
          ids: moodIds,
          memeId,
          eventType: 'upload',
        }),
        false,
      );
      results.push({
        type: 'mood',
        execution: moodResult.$id,
        count: moodIds.length,
      });
    }

    return res.json({
      success: true,
      message: 'Usage counts update initiated successfully',
      data: {
        memeId,
        results,
      },
    });
  } catch (err) {
    log('Error in meme creation handler:', err);
    return res.json(
      {
        success: false,
        message: 'Error processing meme creation event',
        error: err.message,
      },
      500,
    );
  }
}
