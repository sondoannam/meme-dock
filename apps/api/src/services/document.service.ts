import { databases, DATABASE_ID, Permission, Role, ID } from '../config/appwrite';
import { Query } from 'node-appwrite';
import { DocumentIncreaseTimePeriod, DocumentCountPeriod } from '../models/document-analytics';
import { DocumentData, DocumentResponse, ListDocumentsResponse } from '../models/document';

/**
 * Get documents from a collection with optional filtering and pagination
 * @param collectionId Collection ID to query
 * @param options Query options like limit, offset, ordering, and filters
 * @returns List of matching documents
 */
export async function getDocuments(
  collectionId: string,
  options: {
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderType?: string;
    queries?: string[];
  } = {},
): Promise<ListDocumentsResponse> {
  try {
    // Extract options
    const { limit, offset, orderBy, orderType, queries = [] } = options;

    // Convert string queries to Query objects if provided
    const parsedQueries: string[] = [];

    for (const queryString of queries) {
      // Simple parsing for query strings format: "field,operator,value"
      const [field, operator, value] = queryString.split(',');

      if (!field || !operator) continue;

      // Map string operators to Appwrite Query methods
      switch (operator) {
        case 'equal':
          parsedQueries.push(Query.equal(field, value));
          break;
        case 'notEqual':
          parsedQueries.push(Query.notEqual(field, value));
          break;
        case 'greater':
          parsedQueries.push(Query.greaterThan(field, value));
          break;
        case 'greaterEqual':
          parsedQueries.push(Query.greaterThanEqual(field, value));
          break;
        case 'lesser':
          parsedQueries.push(Query.lessThan(field, value));
          break;
        case 'lesserEqual':
          parsedQueries.push(Query.lessThanEqual(field, value));
          break;
        case 'search':
          parsedQueries.push(Query.search(field, value));
          break;
        case 'contains':
          parsedQueries.push(Query.contains(field, value));
          break;
      }
    }
    
    // Add sorting if orderBy is provided
    if (orderBy) {
      // Determine sort direction (default to ascending if not specified)
      const isDesc = orderType?.toLowerCase() === 'desc';
      parsedQueries.push(isDesc ? Query.orderDesc(orderBy) : Query.orderAsc(orderBy));
    }
      // Create options object for the Appwrite SDK method
    // According to the Appwrite SDK, we need to pass queries as the third parameter
    // Pagination parameters are handled via specific Query methods
    
    // Add pagination queries if provided
    if (limit !== undefined) {
      parsedQueries.push(Query.limit(limit));
    }
    
    if (offset !== undefined) {
      parsedQueries.push(Query.offset(offset));
    }
    
    const response = await databases.listDocuments(
      DATABASE_ID, 
      collectionId, 
      parsedQueries
    );

    return response;
  } catch (error) {
    console.error(`Error fetching documents from collection ${collectionId}:`, error);
    throw error;
  }
}

/**
 * Get document count increases over time for a collection
 * @param collectionId The ID of the collection to analyze
 * @param duration The time unit to group by: 'day', 'week', or 'month'
 * @param limit Number of time periods to return (default: 12)
 * @returns Array of document counts by time period
 */
export async function getDocumentIncreaseOverTime(
  collectionId: string,
  duration: DocumentIncreaseTimePeriod,
  limit = 12,
): Promise<DocumentCountPeriod[]> {
  try {
    // Validate inputs
    if (!collectionId) {
      throw new Error('Collection ID is required');
    }

    if (limit <= 0 || limit > 100) {
      limit = 12; // Default to 12 periods if invalid limit is provided
    }

    const now = new Date();
    const result: DocumentCountPeriod[] = [];

    // Calculate timestamps for the periods we need to query
    const periods: Array<{ start: Date; end: Date; label: string }> = [];

    // Reset time to start of the day to ensure consistent periods
    now.setHours(0, 0, 0, 0);

    for (let i = 0; i < limit; i++) {
      // Create new date objects for each iteration to avoid reference issues
      const end = new Date(now);
      const start = new Date(now);

      // Adjust dates based on the duration
      switch (duration) {
        case 'day':
          end.setDate(now.getDate() - i);
          start.setDate(now.getDate() - i - 1);
          break;
        case 'week':
          end.setDate(now.getDate() - i * 7);
          start.setDate(now.getDate() - (i + 1) * 7);
          break;
        case 'month':
          // Handle month transitions correctly
          end.setMonth(now.getMonth() - i);
          start.setMonth(now.getMonth() - (i + 1));
          // Keep the same day, or set to last day if the month is shorter
          start.setDate(
            Math.min(
              end.getDate(),
              new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate(),
            ),
          );
          break;
      }

      // Ensure end date is inclusive of the full day (23:59:59.999)
      end.setHours(23, 59, 59, 999);

      // Format date label
      let dateLabel = '';
      switch (duration) {
        case 'day':
          dateLabel = end.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'week': {
          // Calculate week number more accurately
          const firstDayOfYear = new Date(end.getFullYear(), 0, 1);
          const weekNumber = Math.ceil(
            ((end.getTime() - firstDayOfYear.getTime()) / 86400000 + firstDayOfYear.getDay() + 1) /
              7,
          );
          dateLabel = `Week ${weekNumber}, ${end.toLocaleString('default', {
            month: 'short',
            year: 'numeric',
          })}`;
          break;
        }
        case 'month':
          dateLabel = end.toLocaleString('default', { month: 'long', year: 'numeric' });
          break;
      }

      // Store period info
      periods.push({
        start,
        end,
        label: dateLabel,
      });
    }

    // Query each period to get document counts
    for (const period of periods) {
      try {
        const queries = [
          Query.greaterThanEqual('$createdAt', period.start.toISOString()),
          Query.lessThan('$createdAt', period.end.toISOString()),
        ];

        const response = await databases.listDocuments(DATABASE_ID, collectionId, queries);

        result.push({
          period: period.label,
          count: response.total,
          periodStartDate: period.start.toISOString(),
          periodEndDate: period.end.toISOString(),
        });
      } catch (error) {
        // If querying a specific period fails, add it with 0 count
        console.error(`Error querying period ${period.label}:`, error);
        result.push({
          period: period.label,
          count: 0,
          periodStartDate: period.start.toISOString(),
          periodEndDate: period.end.toISOString(),
        });
      }
    }

    // Reverse the results to get chronological order (oldest to newest)
    return result.reverse();
  } catch (error) {
    console.error(`Error fetching document increases for collection ${collectionId}:`, error);
    throw error;
  }
}

/**
 * Get a document by ID
 * @param collectionId Collection ID containing the document
 * @param documentId Document ID to retrieve
 * @returns Document data with metadata
 */
export async function getDocument(
  collectionId: string,
  documentId: string,
): Promise<DocumentResponse> {
  try {
    return await databases.getDocument(DATABASE_ID, collectionId, documentId);
  } catch (error) {
    console.error(`Error fetching document ${documentId} from collection ${collectionId}:`, error);
    throw error;
  }
}

/**
 * Create a new document
 * @param collectionId Collection ID to create the document in
 * @param data Document data to save
 * @returns Created document with metadata
 */
export async function createDocument(
  collectionId: string,
  data: DocumentData,
): Promise<DocumentResponse> {
  try {
    return await databases.createDocument(DATABASE_ID, collectionId, ID.unique(), data, [
      Permission.read(Role.any()), // Public read access
      Permission.write(Role.team('admin')), // Admin team write access
    ]);
  } catch (error) {
    console.error(`Error creating document in collection ${collectionId}:`, error);
    throw error;
  }
}

/**
 * Update an existing document
 * @param collectionId Collection ID containing the document
 * @param documentId Document ID to update
 * @param data Updated document data
 * @returns Updated document with metadata
 */
export async function updateDocument(
  collectionId: string,
  documentId: string,
  data: DocumentData,
): Promise<DocumentResponse> {
  try {
    return await databases.updateDocument(DATABASE_ID, collectionId, documentId, data);
  } catch (error) {
    console.error(`Error updating document ${documentId} in collection ${collectionId}:`, error);
    throw error;
  }
}

/**
 * Delete a document
 * @param collectionId Collection ID containing the document
 * @param documentId Document ID to delete
 */
export async function deleteDocument(collectionId: string, documentId: string): Promise<void> {
  try {
    await databases.deleteDocument(DATABASE_ID, collectionId, documentId);
  } catch (error) {
    console.error(`Error deleting document ${documentId} from collection ${collectionId}:`, error);
    throw error;
  }
}
