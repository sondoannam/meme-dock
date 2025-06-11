import dotenv from 'dotenv';
import { Client, Databases, ID, Permission, Role, Teams } from 'node-appwrite';

// Load environment variables
dotenv.config();

const { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY, APPWRITE_DATABASE_ID } =
  process.env;

// Validate required configuration
if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
  throw new Error(
    'Missing required Appwrite environment variables: APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY',
  );
}

// Initialize Appwrite client for server-side API
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

// Initialize Appwrite services
const databases = new Databases(client);
const DATABASE_ID = APPWRITE_DATABASE_ID ?? 'default';

const clientBase = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

export { client, databases, DATABASE_ID, ID, Permission, Role, Teams, clientBase };
