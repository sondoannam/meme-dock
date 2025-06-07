import { databases, DATABASE_ID, ID, Permission, Role } from '../config/appwrite';
import { Query, RelationshipType } from 'node-appwrite';
import { CollectionSchemaType, CollectionFieldType } from '../models/collection-schema';
import { DocumentData, DocumentResponse, ListDocumentsResponse } from '../models/document';

// Helper to map our field schema to Appwrite attributes
const mapFieldToAttribute = async (field: CollectionFieldType, collectionId: string) => {
  const { name, type, required = false, isArray = false, defaultValue, relationCollection } = field;

  switch (type) {
    case 'string':
      return await databases.createStringAttribute(
        DATABASE_ID,
        collectionId,
        name,
        255, // Default size for string attributes
        required,
        defaultValue,
        isArray,
      );
    case 'number': {
      // Determine if number is integer or float based on the default value
      const isInteger = !defaultValue || !defaultValue.includes('.');
      if (isInteger) {
        return await databases.createIntegerAttribute(
          DATABASE_ID,
          collectionId,
          name,
          required,
          defaultValue ? parseInt(defaultValue) : undefined,
          undefined, // min
          undefined, // max
          isArray,
        );
      } else {
        return await databases.createFloatAttribute(
          DATABASE_ID,
          collectionId,
          name,
          required,
          defaultValue ? parseFloat(defaultValue) : undefined,
          undefined, // min
          undefined, // max
          isArray,
        );
      }
    }
    case 'boolean':
      return await databases.createBooleanAttribute(
        DATABASE_ID,
        collectionId,
        name,
        required,
        defaultValue === 'true',
        isArray,
      );
    case 'datetime':
      return await databases.createDatetimeAttribute(
        DATABASE_ID,
        collectionId,
        name,
        required,
        defaultValue || '',
        isArray,
      );
    case 'relation':
      if (!relationCollection) {
        throw new Error(`Relation collection is required for field: ${name}`);
      } // Using node-appwrite v17.0.0
      // Let's simplify by removing optional parameters that are causing issues
      return await databases.createRelationshipAttribute(
        DATABASE_ID,
        collectionId,
        name,
        relationCollection as RelationshipType,
      );
    default:
      throw new Error(`Unsupported field type: ${type}`);
  }
};

// Service for managing Appwrite database collections
// Document Service for managing Appwrite documents
export class DocumentService {
  // Get documents from a collection with optional filtering and pagination
  static async getDocuments(
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
      // Extract only queries from options
      const { queries = [] } = options;

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
      } // Create options object for the Appwrite SDK method
      const response = await databases.listDocuments(DATABASE_ID, collectionId, parsedQueries);

      return response;
    } catch (error) {
      console.error(`Error fetching documents from collection ${collectionId}:`, error);
      throw error;
    }
  }

  // Get a document by ID
  static async getDocument(collectionId: string, documentId: string): Promise<DocumentResponse> {
    try {
      return await databases.getDocument(DATABASE_ID, collectionId, documentId);
    } catch (error) {
      console.error(
        `Error fetching document ${documentId} from collection ${collectionId}:`,
        error,
      );
      throw error;
    }
  }

  // Create a new document
  static async createDocument(collectionId: string, data: DocumentData): Promise<DocumentResponse> {
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

  // Update a document
  static async updateDocument(
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

  // Delete a document
  static async deleteDocument(collectionId: string, documentId: string): Promise<void> {
    try {
      await databases.deleteDocument(DATABASE_ID, collectionId, documentId);
    } catch (error) {
      console.error(
        `Error deleting document ${documentId} from collection ${collectionId}:`,
        error,
      );
      throw error;
    }
  }
}

export class CollectionService {
  // Get all collections
  static async getCollections(): Promise<CollectionSchemaType[]> {
    try {
      // Fetch collections from Appwrite
      const response = await databases.listCollections(DATABASE_ID);

      // Map Appwrite collections to our schema format
      const collections: CollectionSchemaType[] = await Promise.all(
        response.collections.map(async (collection) => {
          // Get attributes for this collection
          const attributesResponse = await databases.listAttributes(DATABASE_ID, collection.$id);
          // Map attributes to our field format
          const fields = attributesResponse.attributes.map((attribute) => {
            const field: CollectionFieldType = {
              name: attribute.key,
              type: this.mapAppwriteTypeToFieldType(attribute.type),
              required: attribute.required,
              isArray: attribute.array || false,
              description: '',
            };

            // Add default value if it exists (not all attribute types have default values)
            if ('default' in attribute && attribute.default !== undefined) {
              field.defaultValue = String(attribute.default);
            }

            // Add relation collection if it's a relationship attribute
            if (attribute.type === 'relationship' && 'relatedCollection' in attribute) {
              field.relationCollection = attribute.relatedCollection;
            }

            return field;
          });

          return {
            name: collection.name,
            slug: collection.$id,
            description: collection.name, // Appwrite doesn't have a built-in description field
            fields: fields,
          };
        }),
      );

      return collections;
    } catch (error) {
      console.error('Error fetching collections:', error);
      throw error;
    }
  }

  // Map Appwrite attribute types to our field types
  private static mapAppwriteTypeToFieldType(appwriteType: string): string {
    const typeMap: Record<string, string> = {
      string: 'string',
      integer: 'number',
      double: 'number',
      boolean: 'boolean',
      datetime: 'datetime',
      relationship: 'relation',
      // Add more mappings as needed
    };

    return typeMap[appwriteType] || 'string';
  }

  // Create a new collection
  static async createCollection(collection: CollectionSchemaType): Promise<CollectionSchemaType> {
    try {
      // Create the collection in Appwrite
      const collectionId = ID.unique();
      const createdCollection = await databases.createCollection(
        DATABASE_ID,
        collectionId,
        collection.name,
        [
          Permission.read(Role.any()), // Public read access
          Permission.write(Role.team('admin')), // Admin team write access
        ],
        false, // documentSecurity (false = collection-level permissions)
      );

      // Create attributes for each field
      for (const field of collection.fields) {
        await mapFieldToAttribute(field, createdCollection.$id);
      }

      // Return the created collection with our schema format
      return {
        ...collection,
        slug: createdCollection.$id,
      };
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  }

  // Create multiple collections (for batch setup)
  static async createCollections(
    collections: CollectionSchemaType[],
  ): Promise<CollectionSchemaType[]> {
    try {
      const createdCollections = [];
      for (const collection of collections) {
        const created = await this.createCollection(collection);
        createdCollections.push(created);
      }
      return createdCollections;
    } catch (error) {
      console.error('Error creating multiple collections:', error);
      throw error;
    }
  }

  // Delete a collection
  static async deleteCollection(collectionId: string): Promise<void> {
    try {
      await databases.deleteCollection(DATABASE_ID, collectionId);
    } catch (error) {
      console.error('Error deleting collection:', error);
      throw error;
    }
  }
}
