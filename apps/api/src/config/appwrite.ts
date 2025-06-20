import dotenv from 'dotenv';
import { Client, Databases, ID, Permission, Role, Teams, Storage } from 'node-appwrite';
import { createServiceLogger } from '../utils/logger-utils';

const logger = createServiceLogger('AppwriteConfig');

// Load environment variables
dotenv.config();

const { 
  APPWRITE_ENDPOINT, 
  APPWRITE_PROJECT_ID, 
  APPWRITE_API_KEY, 
  APPWRITE_DATABASE_ID, 
  APPWRITE_MEME_BUCKET_ID 
} = process.env;

// Validate required configuration
if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_API_KEY || !APPWRITE_DATABASE_ID || !APPWRITE_MEME_BUCKET_ID) {
  throw new Error(
    'Missing required Appwrite environment variables: APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY, APPWRITE_DATABASE_ID, APPWRITE_MEME_BUCKET_ID',
  );
}

// Initialize Appwrite client for server-side API
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

// Initialize Appwrite services
const databases = new Databases(client);
const storage = new Storage(client);
const DATABASE_ID = APPWRITE_DATABASE_ID ?? 'default';
const MEME_BUCKET_ID = APPWRITE_MEME_BUCKET_ID ?? '';

if (!MEME_BUCKET_ID) {
  logger.warn('APPWRITE_MEME_BUCKET_ID is not set. File upload/download will not work properly.');
}

// Only export a factory so every consumer gets an isolated client
const createBaseClient = () =>
  new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);

export { client, databases, storage, DATABASE_ID, MEME_BUCKET_ID, ID, Permission, Role, Teams, createBaseClient, APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID };
