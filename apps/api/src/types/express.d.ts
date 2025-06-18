import 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string; // User ID from authentication
      isAdmin?: boolean; // Whether the user is an admin
    }
  }
}
