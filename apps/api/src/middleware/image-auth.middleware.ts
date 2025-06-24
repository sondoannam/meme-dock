import { Request, Response, NextFunction } from 'express';
import { createBaseClient, Teams } from '../config/appwrite';
import { Account } from 'node-appwrite';
import { createServiceLogger } from '../utils/logger-utils';

// Environment variables
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from '../config/appwrite';

const logger = createServiceLogger('ImageAuthMiddleware');

const ADMIN_TEAM_ID = process.env.APPWRITE_ADMIN_TEAM_ID;

/**
 * Optional authentication middleware for routes that can work both authenticated and unauthenticated.
 * If a valid token is provided, it will attach the userId to the request.
 * If no token is provided or the token is invalid, it will still allow the request to proceed.
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  // If Appwrite is not configured, skip auth check and continue
  if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
    return next();
  }

  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      // No token provided, continue as unauthenticated
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      // Invalid token format, continue as unauthenticated
      return next();
    }

    try {
      // Create a client-side instance of Appwrite
      const clientJWT = createBaseClient().setJWT(token);
      const account = new Account(clientJWT);

      // This call will automatically verify the JWT and throw if invalid
      const user = await account.get();
      req.userId = user.$id;

      // If admin team ID is set, check if user is an admin
      if (ADMIN_TEAM_ID) {
        try {
          const teams = new Teams(clientJWT);
          const membershipsList = await teams.listMemberships(ADMIN_TEAM_ID);

          // Check if user ID exists in admin team memberships
          req.isAdmin = membershipsList.memberships.some(
            (membership) => membership.userId === user.$id,
          );
        } catch (error) {
          logger.error('Error checking admin status', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            userId: user.$id,
          });
          req.isAdmin = false;
        }
      }
    } catch (verifyError) {
      // Token verification failed, continue as unauthenticated
      logger.debug('Optional auth token verification failed', {
        error: verifyError instanceof Error ? verifyError.message : String(verifyError),
        stack: verifyError instanceof Error ? verifyError.stack : undefined,
      });
    }

    // Continue with the request, authenticated or not
    return next();
  } catch (error) {
    logger.error('Optional authentication error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ipAddress: req.ip,
    });
    // Continue rather than blocking the request on auth errors
    return next();
  }
}

/**
 * Authentication middleware for read operations that allows both admin and regular users.
 * For public routes that we want to eventually secure but keep public for now.
 */
export async function readAuth(req: Request, res: Response, next: NextFunction) {
  // If Appwrite is not configured, skip auth check and continue
  if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
    return next();
  }

  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      // For now, allow unauthenticated access
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      // For now, allow even with invalid token format
      return next();
    }

    try {
      // Create a client-side instance of Appwrite
      const clientJWT = createBaseClient().setJWT(token);
      const account = new Account(clientJWT);

      // Verify the token
      const user = await account.get();
      req.userId = user.$id;
    } catch (verifyError) {
      // For now, continue even if token verification fails
      logger.debug('Token verification failed but continuing', {
        error: verifyError instanceof Error ? verifyError.message : String(verifyError),
        stack: verifyError instanceof Error ? verifyError.stack : undefined,
      });
    }

    return next();
  } catch (error) {
    logger.error('Authentication error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ipAddress: req.ip,
    });
    // Continue rather than blocking on auth errors
    return next();
  }
}

/**
 * Authentication middleware for write operations that ensures the user is authenticated.
 * This is a middle ground between adminAuth and optionalAuth.
 */
export async function writeAuth(req: Request, res: Response, next: NextFunction) {
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

    try {
      // Create a client-side instance of Appwrite
      const clientJWT = createBaseClient().setJWT(token);
      const account = new Account(clientJWT);

      // Verify the token
      const user = await account.get();
      req.userId = user.$id;

      // Continue - user is authenticated (doesn't need to be admin)
      return next();
    } catch (verifyError) {
      logger.error('Token verification failed', {
        error: verifyError instanceof Error ? verifyError.message : String(verifyError),
        stack: verifyError instanceof Error ? verifyError.stack : undefined,
        ipAddress: req.ip,
      });
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  } catch (error) {
    logger.error('Authentication error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ipAddress: req.ip,
    });
    return res.status(500).json({
      message: 'Authentication error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
