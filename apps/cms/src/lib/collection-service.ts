import { CollectionSchemaType } from '@/validators/collection-schema';

// Demo service for managing database collections
export class CollectionService {
  // Mock collections storage
  private static collections: CollectionSchemaType[] = [];

  // Get all collections
  static async getCollections(): Promise<CollectionSchemaType[]> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.collections]);
      }, 500);
    });
  }

  // Create a new collection
  static async createCollection(collection: CollectionSchemaType): Promise<CollectionSchemaType> {
    // Validate collection slug uniqueness (in a real app this would be done in the backend)
    const existingCollection = this.collections.find((c) => c.slug === collection.slug);
    if (existingCollection) {
      return Promise.reject(new Error(`Collection with slug "${collection.slug}" already exists`));
    }

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        this.collections.push(collection);
        resolve(collection);
      }, 800);
    });
  }

  // Create multiple collections (for batch setup)
  static async createCollections(
    collections: CollectionSchemaType[],
  ): Promise<CollectionSchemaType[]> {
    // In a real app, this would be handled as a transaction
    try {
      const createdCollections = [];
      for (const collection of collections) {
        const created = await this.createCollection(collection);
        createdCollections.push(created);
      }
      return createdCollections;
    } catch (error) {
      // In a real app, we would roll back the transaction
      return Promise.reject(error);
    }
  }

  // Delete a collection
  static async deleteCollection(slug: string): Promise<void> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        this.collections = this.collections.filter((c) => c.slug !== slug);
        resolve();
      }, 500);
    });
  }
}
