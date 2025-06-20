import { databases, DATABASE_ID, ID } from '../config/appwrite';
import { RelationshipType } from 'node-appwrite';
import { CollectionFieldType, CollectionRes, CUCollectionReq } from '../models/collection-schema';
import { createServiceLogger } from '../utils/logger-utils';

const logger = createServiceLogger('CollectionService');

/**
 * Helper to map our field schema to Appwrite attributes
 */
export const mapFieldToAttribute = async (field: CollectionFieldType, collectionId: string) => {
  const {
    name,
    type,
    required = false,
    isArray = false,
    defaultValue,
    relationCollection,
    enumValues,
  } = field;

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
    case 'number':
      return await databases.createIntegerAttribute(
        DATABASE_ID,
        collectionId,
        name,
        required,
        undefined, // min
        undefined, // max
        defaultValue ? parseInt(defaultValue) : undefined,
        isArray,
      );

    case 'float':
      return await databases.createFloatAttribute(
        DATABASE_ID,
        collectionId,
        name,
        required,
        undefined, // min
        undefined, // max
        defaultValue ? parseFloat(defaultValue) : undefined,
        isArray,
      );
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
        defaultValue,
        isArray,
      );
    case 'enum':
      if (!enumValues?.length) {
        throw new Error('Enum values are required for enum fields');
      }
      return await databases.createEnumAttribute(
        DATABASE_ID,
        collectionId,
        name,
        enumValues,
        required,
        defaultValue,
        isArray,
      );
    case 'relation':
      if (!relationCollection) {
        throw new Error('Relation collection is required for relation fields');
      }
      return await databases.createRelationshipAttribute(
        DATABASE_ID,
        collectionId,
        relationCollection,
        RelationshipType.ManyToOne, // Default to many-to-one
        false,
      );
    default:
      throw new Error(`Unsupported field type: ${type}`);
  }
};

/**
 * Map Appwrite attribute types to our field types
 * @param appwriteType Appwrite attribute type
 * @returns Mapped field type
 */
export function mapAppwriteTypeToFieldType(appwriteType: string): string {
  const typeMap: Record<string, string> = {
    string: 'string',
    email: 'string',
    ip: 'string',
    integer: 'number',
    float: 'number',
    boolean: 'boolean',
    datetime: 'datetime',
    relationship: 'relation',
    enum: 'enum',
    // Add more mappings as needed
  };

  return typeMap[appwriteType] || 'string';
}

/**
 * Get all collections in the database
 * @returns Array of collection schemas
 */
export async function getCollections(): Promise<CollectionRes[]> {
  try {
    // Fetch collections from Appwrite
    const response = await databases.listCollections(DATABASE_ID);

    // Map API response to our schema format
    const collections = await Promise.all(
      response.collections.map(async (collection) => {
        // Fetch attributes (fields) for this collection
        const attributesResponse = await databases.listAttributes(DATABASE_ID, collection.$id);

        // Map attributes to our field format
        const fields = attributesResponse.attributes.map((attr) => {
          const field: CollectionFieldType = {
            name: attr.key,
            type: mapAppwriteTypeToFieldType(attr.type),
            required: attr.required,
            isArray: attr.array || false,
          }; // Handle special attributes
          if (attr.type === 'enum') {
            const enumAttr = attr as any; // Type cast to access enum-specific properties
            if (enumAttr.elements) {
              field.enumValues = enumAttr.elements;
            }
          }

          if (attr.type === 'relationship') {
            const relationAttr = attr as any; // Type cast to access relationship-specific properties
            if (relationAttr.relatedCollection) {
              field.relationCollection = relationAttr.relatedCollection;
            }
          }

          return field;
        });

        return {
          name: collection.name,
          fields: fields,
          id: collection.$id, // Use $id as the unique identifier
          createdAt: collection.$createdAt,
          updatedAt: collection.$updatedAt,
          enabled: collection.enabled,
        };
      }),
    );

    return collections;
  } catch (error) {
    logger.error('Error fetching collections', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

/**
 * Create a new collection
 * @param collection Collection schema to create
 * @returns Created collection schema
 */
export async function createCollection(
  collection: CUCollectionReq,
): Promise<CollectionRes> {
  try {
    // Create collection in Appwrite
    const createdCollection = await databases.createCollection(
      DATABASE_ID,
      ID.unique(),
      collection.name,
    );

    // Add fields as attributes
    if (collection.fields && collection.fields.length > 0) {
      for (const field of collection.fields) {
        await mapFieldToAttribute(field, createdCollection.$id);
      }
    }

    // Return the created collection with the assigned ID
    return {
      ...collection,
      id: createdCollection.$id,
      createdAt: createdCollection.$createdAt,
      updatedAt: createdCollection.$updatedAt,
      enabled: createdCollection.enabled,
    };
  } catch (error) {
    logger.error(`Error creating collection`, { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      collectionName: collection.name
    });
    throw error;
  }
}

/**
 * Update an existing collection
 * @param collectionId ID of the collection to update
 * @param collection Updated collection schema
 * @returns Updated collection schema
 */
export async function updateCollection(
  collectionId: string,
  collection: CUCollectionReq,
): Promise<CollectionRes> {
  try {
    // Verify collection exists
    let existingCollection;

    try {
      existingCollection = await databases.getCollection(DATABASE_ID, collectionId);
    } catch (e) {
      throw new Error(`Collection with ID ${collectionId} not found: ${(e as Error).message}`);
    }

    // Update collection name
    if (collection.name) {
      await databases.updateCollection(DATABASE_ID, collectionId, collection.name);
    }

    // Get existing attributes
    const attributesResponse = await databases.listAttributes(DATABASE_ID, collectionId);
    const existingAttributes = attributesResponse.attributes;
    const existingAttributesMap = new Map();

    existingAttributes.forEach((attr) => {
      existingAttributesMap.set(attr.key, attr);
    });

    // Process fields
    if (collection.fields && collection.fields.length > 0) {
      for (const field of collection.fields) {
        // If field already exists, skip it
        if (existingAttributesMap.has(field.name)) {
          logger.info(`Field already exists, skipping modification`, {
            fieldName: field.name,
            collectionId
          });
        } else {
          // Add new field
          await mapFieldToAttribute(field, collectionId);
        }
      }
    }

    // Return updated collection
    return {
      ...collection,
      id: collectionId,
      createdAt: existingCollection.$createdAt,
      updatedAt: existingCollection.$updatedAt,
      enabled: existingCollection.enabled,
    };
  } catch (error) {
    logger.error(`Error updating collection`, { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      collectionId
    });
    throw error;
  }
}

/**
 * Create multiple collections in batch
 * @param collections Array of collection schemas to create
 * @returns Array of created collection schemas
 */
export async function createCollections(
  collections: CUCollectionReq[],
): Promise<CollectionRes[]> {
  try {
    const createdCollections = [];

    for (const collection of collections) {
      const created = await createCollection(collection);
      createdCollections.push(created);
    }

    return createdCollections;
  } catch (error) {
    logger.error('Error creating multiple collections', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      collectionsCount: collections.length
    });
    throw error;
  }
}

/**
 * Delete a collection
 * @param collectionId ID of the collection to delete
 */
export async function deleteCollection(collectionId: string): Promise<void> {
  try {
    await databases.deleteCollection(DATABASE_ID, collectionId);
  } catch (error) {
    logger.error(`Error deleting collection`, { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      collectionId
    });
    throw error;
  }
}
