/**
 * Service for JWT token management, storage, and refresh
 * Handles token storage, retrieval, and refresh mechanisms
 */

// Storage keys
const ACCESS_TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

// Token storage options
type StorageType = 'local' | 'session' | 'memory';

// In-memory storage for tokens when not using localStorage/sessionStorage
const memoryStorage: Record<string, string> = {};

/**
 * TokenService provides methods for managing authentication tokens securely
 */
export const TokenService = {
  /**
   * Store the JWT token using the specified storage method
   * @param token JWT token string
   * @param expiryInSeconds Seconds until the token expires
   * @param storageType Where to store the token
   */
  storeToken(token: string, expiryInSeconds = 3600, storageType: StorageType = 'local'): void {
    const expiryTime = Date.now() + expiryInSeconds * 1000;

    try {
      if (storageType === 'local' && window.localStorage) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
      } else if (storageType === 'session' && window.sessionStorage) {
        sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
        sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
      } else {
        // Fall back to memory storage
        memoryStorage[ACCESS_TOKEN_KEY] = token;
        memoryStorage[TOKEN_EXPIRY_KEY] = expiryTime.toString();
      }
    } catch (error) {
      console.error('Error storing auth token:', error);
      // Fall back to memory storage on error
      memoryStorage[ACCESS_TOKEN_KEY] = token;
      memoryStorage[TOKEN_EXPIRY_KEY] = expiryTime.toString();
    }
  },

  /**
   * Get the stored JWT token
   * @returns Stored JWT token or null if not found or expired
   */
  getToken(): string | null {
    try {
      // Try localStorage first
      let token = localStorage.getItem(ACCESS_TOKEN_KEY);
      let expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

      // If not in localStorage, check sessionStorage
      if (!token) {
        token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
        expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
      }

      // If still not found, check memory storage
      if (!token) {
        token = memoryStorage[ACCESS_TOKEN_KEY];
        expiry = memoryStorage[TOKEN_EXPIRY_KEY];
      }

      // Check if token exists and is not expired
      if (token && expiry) {
        const expiryTime = parseInt(expiry, 10);
        if (Date.now() < expiryTime) {
          return token;
        }
      }

      // Token not found or expired
      return null;
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      return null;
    }
  },

  /**
   * Clear the stored token from all storage methods
   */
  clearToken(): void {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
      delete memoryStorage[ACCESS_TOKEN_KEY];
      delete memoryStorage[TOKEN_EXPIRY_KEY];
    } catch (error) {
      console.error('Error clearing auth token:', error);
    }
  },

  /**
   * Check if token is expired or close to expiring
   * @param bufferSeconds Seconds before actual expiry to consider token as expired
   * @returns True if token is expired or will expire soon
   */
  isTokenExpired(bufferSeconds = 300): boolean {
    try {
      // Try localStorage first
      let expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

      // If not in localStorage, check sessionStorage
      if (!expiry) {
        expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
      }

      // If still not found, check memory storage
      if (!expiry) {
        expiry = memoryStorage[TOKEN_EXPIRY_KEY];
      }

      if (expiry) {
        const expiryTime = parseInt(expiry, 10);
        // Consider token expired if within buffer period
        return Date.now() + bufferSeconds * 1000 >= expiryTime;
      }

      return true; // No expiry time found, consider expired
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  },

  /**
   * Parse JWT token to get its payload
   * @param token JWT token string
   * @returns Decoded payload or null if invalid
   */
  parseToken(token: string): any | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  },
};
