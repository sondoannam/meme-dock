import { client } from '../config/appwrite';
import { Functions } from 'node-appwrite';

/**
 * Handle the creation of a new meme document by updating usage counts
 * for related objects, tags, and moods.
 *
 * This function is designed to be triggered by a database event
 * when a new meme document is created.
 *
 * Event pattern: databases.*.collections.memes.documents.*.create
 *
 * Environment variables:
 * - APPWRITE_FUNCTION_ID: ID of the increase-usage-count function
 */
export default async function ({ req, res, log }) {
  log('Meme creation handler started');

  try {
    // Extract the event data from request body
    const payload = JSON.parse(req.payload);
    const documentData = payload['$data'];
    log('Event data:', documentData);

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

    // Get the increase-usage-count function ID
    const increaseUsageCountFunctionId = process.env.APPWRITE_FUNCTION_ID;
    if (!increaseUsageCountFunctionId) {
      return res.json(
        {
          success: false,
          message: 'Missing APPWRITE_FUNCTION_ID environment variable',
        },
        500,
      );
    }

    const functions = new Functions(client);
    const results = [];

    // Process objectIds if there are any
    if (objectIds.length > 0) {
      log(`Processing ${objectIds.length} objectIds`);
      const objectResult = await functions.createExecution(
        increaseUsageCountFunctionId,
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
