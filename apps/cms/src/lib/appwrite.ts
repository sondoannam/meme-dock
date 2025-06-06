import { Client, Account, Databases } from 'appwrite';

if (!process.env.VITE_APPWRITE_ENDPOINT || !process.env.VITE_APPWRITE_PROJECT_ID) {
  throw new Error(
    'Missing required Appwrite environment variables: VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID',
  );
}

const client = new Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };
