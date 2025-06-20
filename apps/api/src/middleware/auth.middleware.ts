// filepath: d:\work\sondoannam\hobbies\meme-dock\apps\api\src\middleware\auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { client, createBaseClient, Teams } from '../config/appwrite';
import { Account } from 'node-appwrite';
import { createServiceLogger } from '../utils/logger-utils';

// Create a logger for the auth middleware
const logger = createServiceLogger('AuthMiddleware');

// Environment variables
const ADMIN_TEAM_ID = process.env.APPWRITE_ADMIN_TEAM_ID;
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;

// Validation
if (!ADMIN_TEAM_ID) {
  logger.warn('APPWRITE_ADMIN_TEAM_ID is not set. Admin authentication will not work properly.');
}

if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
  logger.warn('Missing Appwrite configuration. Authentication will not work properly.');
}

/**
 * Authentication middleware to verify user is logged in and belongs to Admin team
 * Uses Appwrite Account API to verify the JWT token instead of just decoding it
 */
export async function adminAuth(req: Request, res: Response, next: NextFunction) {
  if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
    return res.status(500).json({
      message: 'Server configuration error: Appwrite endpoint or project ID not set',
    });
  }

  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    // Verify the token by creating a client-side instance and making an API call
    // This properly verifies the token's signature rather than just decoding it
    let userId: string;

    try {
      // Create a client-side instance of Appwrite
      const clientJWT = createBaseClient().setJWT(token);

      const account = new Account(clientJWT);

      // This call will automatically verify the JWT and throw if invalid
      const user = await account.get();
      userId = user.$id;

      if (!userId) {
        return res.status(401).json({ message: 'Invalid token' });
      }    } catch (verifyError) {
      logger.error('Token verification failed', {
        error: verifyError instanceof Error ? verifyError.message : String(verifyError),
        stack: verifyError instanceof Error ? verifyError.stack : undefined,
        ipAddress: req.ip
      });
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Check if the user is in the admin team
    if (ADMIN_TEAM_ID) {
      const teams = new Teams(client);

      const membershipsList = await teams.listMemberships(ADMIN_TEAM_ID);

      // Check if user ID exists in admin team memberships
      const isAdmin = membershipsList.memberships.some(
        (membership) => membership.userId === userId,
      );

      if (!isAdmin) {
        return res.status(403).json({
          message: 'Access denied. Admin permission required.',
        });
      }

      // User is authenticated and is an admin
      req.userId = userId; // Attach userId to request for future use

      return next();
    } else {
      return res.status(500).json({
        message: 'Server configuration error: Admin team not configured',
      });
    }  } catch (error) {
    logger.error('Authentication error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ipAddress: req.ip
    });
    return res.status(500).json({
      message: 'Authentication error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
