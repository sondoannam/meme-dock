import { databases, DATABASE_ID, ID, Permission, Role } from '../config/appwrite';
import { RelationshipType } from 'node-appwrite';
import { CollectionSchemaType, CollectionFieldType } from '../models/collection-schema';

/**
 * Helper to map our field schema to Appwrite attributes
 */
const mapFieldToAttribute = async (field: CollectionFieldType, collectionId: string) => {
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
    case 'number': {
      // Determine if number is integer or float based on the default value
      const isInteger =
        defaultValue && !isNaN(Number(defaultValue)) && Number.isInteger(Number(defaultValue));
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
        defaultValue ?? undefined,
        isArray,
      );
    case 'enum':
      if (!enumValues || enumValues.length === 0) {
        throw new Error(`Enum values are required for field: ${name}`);
      }
      return await databases.createEnumAttribute(
        DATABASE_ID,
        collectionId,
        name,
        enumValues,
        required,
        defaultValue ?? undefined,
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

/**
 * Service for managing Appwrite database collections
 */
export class CollectionService {
  /**
   * Get all collections in the database
   * @returns Array of collection schemas
   */
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

            // Add enum values if it's an enum attribute
            if ('format' in attribute && attribute.format === 'enum' && 'elements' in attribute) {
              field.enumValues = attribute.elements;
              field.type = 'enum';
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

  /**
   * Map Appwrite attribute types to our field types
   * @param appwriteType Appwrite attribute type
   * @returns Mapped field type
   */
  private static mapAppwriteTypeToFieldType(appwriteType: string): string {
    const typeMap: Record<string, string> = {
      string: 'string',
      integer: 'number',
      double: 'number',
      boolean: 'boolean',
      datetime: 'datetime',
      relationship: 'relation',
      enum: 'enum',
      // Add more mappings as needed
    };

    return typeMap[appwriteType] || 'string';
  }

  /**
   * Create a new collection
   * @param collection Collection schema to create
   * @returns Created collection schema
   */
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

  /**
   * Update an existing collection
   * @param collectionId ID of the collection to update
   * @param collection Updated collection schema
   * @returns Updated collection schema
   */
  static async updateCollection(
    collectionId: string,
    collection: CollectionSchemaType,
  ): Promise<CollectionSchemaType> {
    try {
      // First, get the existing collection to check if it exists
      try {
        await databases.getCollection(DATABASE_ID, collectionId);
      } catch (e) {
        console.error(`Failed to get collection:`, e);
        throw new Error(
          `Collection with ID ${collectionId} not found: ${
            e instanceof Error ? e.message : String(e)
          }`,
        );
      }

      // Update collection metadata
      await databases.updateCollection(DATABASE_ID, collectionId, collection.name);

      // Get existing attributes
      const attributesResponse = await databases.listAttributes(DATABASE_ID, collectionId);
      const existingAttributes = attributesResponse.attributes;

      // Create a map of existing attributes by key
      const existingAttributesMap = new Map();
      existingAttributes.forEach((attr) => {
        existingAttributesMap.set(attr.key, attr);
      });

      // Process each field in the updated collection
      for (const field of collection.fields) {
        if (existingAttributesMap.has(field.name)) {
          // Field already exists, but we can't modify the field type in most cases
          // We would need to delete and recreate it, which can cause data loss
          console.log(`Field ${field.name} already exists, skipping modification`);
        } else {
          // New field, create it
          await mapFieldToAttribute(field, collectionId);
        }
      }

      // Return the updated collection
      return {
        ...collection,
        slug: collectionId,
      };
    } catch (error) {
      console.error('Error updating collection:', error);
      throw error;
    }
  }

  /**
   * Create multiple collections (for batch setup)
   * @param collections Array of collection schemas
   * @returns Array of created collection schemas
   */
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

  /**
   * Delete a collection
   * @param collectionId ID of the collection to delete
   */
  static async deleteCollection(collectionId: string): Promise<void> {
    try {
      await databases.deleteCollection(DATABASE_ID, collectionId);
    } catch (error) {
      console.error('Error deleting collection:', error);
      throw error;
    }
  }
}
