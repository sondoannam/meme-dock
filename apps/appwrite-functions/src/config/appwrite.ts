import dotenv from 'dotenv';
import { Client, Databases, ID, Permission, Role, Teams, Storage } from 'node-appwrite';

// Load environment variables
dotenv.config();

const {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_API_KEY,
  APPWRITE_DATABASE_ID,
  APPWRITE_MEME_BUCKET_ID,
} = process.env;

// Validate required configuration
if (
  !APPWRITE_ENDPOINT ||
  !APPWRITE_PROJECT_ID ||
  !APPWRITE_API_KEY ||
  !APPWRITE_DATABASE_ID ||
  !APPWRITE_MEME_BUCKET_ID
) {
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

export {
  client,
  databases,
  storage,
  ID,
  Permission,
  Role,
  Teams,
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_API_KEY,
  APPWRITE_DATABASE_ID,
  APPWRITE_MEME_BUCKET_ID,
};
