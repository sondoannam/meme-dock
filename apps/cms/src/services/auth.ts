import { account, client } from '../lib/appwrite';
import { Teams } from 'appwrite';
import { TokenService } from './token';

// Define team ID for admin users
const ADMIN_TEAM_ID = process.env.VITE_APPWRITE_ADMIN_TEAM_ID;

if (!ADMIN_TEAM_ID) {
  console.warn('VITE_APPWRITE_ADMIN_TEAM_ID not set. Admin team check will not work correctly.');
}

// JWT token expiration time in seconds (default: 1 hour)
// Default token expiry used when exp claim is not available
const DEFAULT_TOKEN_EXPIRY = 3600;

// User type with basic information and team membership
export interface User {
  $id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

// Auth service to handle user authentication and team membership
export const AuthService = {
  // Login user with email and password
  async login(email: string, password: string): Promise<User | null> {
    try {
      // Create email session (log in)
      await account.createSession(email, password);

      // Get account information
      const accountInfo = await account.get();

      // Check if user is in admin team
      const isAdmin = await this.checkAdminTeamMembership();

      return {
        $id: accountInfo.$id,
        email: accountInfo.email,
        name: accountInfo.name,
        isAdmin,
      };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  // Get current logged in user
  async getCurrentUser(): Promise<User | null> {
    try {
      const accountInfo = await account.get();
      const isAdmin = await this.checkAdminTeamMembership();

      return {
        $id: accountInfo.$id,
        email: accountInfo.email,
        name: accountInfo.name,
        isAdmin,
      };
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },

  // Check if current user is in admin team
  async checkAdminTeamMembership(): Promise<boolean> {
    if (!ADMIN_TEAM_ID) return false;

    try {
      const teams = new Teams(client);
      const membershipsList = await teams.listMemberships(ADMIN_TEAM_ID);

      // Get current account details to compare with team memberships
      const currentUser = await account.get();

      // Check if user ID exists in admin team memberships
      return membershipsList.memberships.some(
        (membership) => membership.userId === currentUser.$id,
      );
    } catch (error) {
      console.error('Failed to check team membership:', error);
      return false;
    }
  }, 
  
  // Get JWT token for API authorization with admin status
  async getJWT(): Promise<string> {
    try {
      // Check if we already have a valid token in storage
      const existingToken = TokenService.getToken();
      if (existingToken && !TokenService.isTokenExpired()) {
        return existingToken;
      }

      // No valid token found, create a new one
      const jwtObj = await account.createJWT();

      // Extract the JWT and get its expiry information
      const token = jwtObj.jwt;

      // Parse the token to get expiration time
      const payload = TokenService.parseToken(token);
      // Calculate token expiration in seconds
      // Use the exp claim if available, otherwise default to 1 hour
      const expiryInSeconds = payload?.exp
        ? (payload.exp * 1000 - Date.now()) / 1000
        : DEFAULT_TOKEN_EXPIRY;

      // Store the token securely
      TokenService.storeToken(token, expiryInSeconds);

      return token;
    } catch (error) {
      console.error('Failed to create JWT:', error);
      throw error;
    }
  }, 
  
  // Logout current user
  async logout(): Promise<void> {
    try {
      try {
        // First attempt to delete all sessions for complete logout across devices
        await account.deleteSessions();
      } catch (err) {
        // If deleting all sessions fails, fall back to deleting just the current session
        console.warn('Failed to delete all sessions, falling back to current session:', err);
        await account.deleteSession('current');
      }

      // Clear any stored tokens
      TokenService.clearToken();

      // Clear any cookies that might store authentication data
      document.cookie.split(';').forEach((cookie) => {
        const [name] = cookie.trim().split('=');
        if (name && (name.includes('auth') || name.includes('token') || name.includes('session'))) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        }
      });

      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },
};
