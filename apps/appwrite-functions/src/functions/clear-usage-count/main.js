import { Client, Users } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  const KEY = req.headers['x-appwrite-key'];

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(KEY);

  const data = { users: null };
  const users = new Users(client);

  try {
    data['users'] = await users.list();
  } catch (error) {
    log('Error fetching users:', error);
    return res.json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    }, 500);
  }

  return res.json(data);
};
