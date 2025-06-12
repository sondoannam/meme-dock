import { TokenService } from './token';
import { AuthService } from './auth';

// Configuration
const REFRESH_TOKEN_THRESHOLD = 5 * 60; // 5 minutes before expiry in seconds
const TOKEN_REFRESH_INTERVAL = 14 * 60; // Check every 14 minutes

// Scheduled token refresh functionality
export const TokenRefreshService = {
  refreshIntervalId: null as number | null,

  /**
   * Initialize token refresh scheduling
   * This will periodically check token validity and refresh when needed
   */
  initTokenRefresh(): void {
    // Clear any existing interval first
    this.stopTokenRefresh();

    // Set up periodic token check
    this.refreshIntervalId = window.setInterval(() => {
      this.checkAndRefreshToken();
    }, TOKEN_REFRESH_INTERVAL * 1000);

    // Initial check
    this.checkAndRefreshToken();
  },

  /**
   * Stop the token refresh scheduling
   */
  stopTokenRefresh(): void {
    if (this.refreshIntervalId !== null) {
      window.clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  },

  /**
   * Check if token needs refreshing and refresh if needed
   */
  async checkAndRefreshToken(): Promise<void> {
    try {
      const token = TokenService.getToken();

      // If no token or user is not logged in, don't try to refresh
      if (!token) {
        return;
      }

      // Check if token will expire within threshold
      if (TokenService.isTokenExpired(REFRESH_TOKEN_THRESHOLD)) {
        console.log('Token expiring soon. Refreshing...');
        await AuthService.getJWT();
      }
    } catch (error) {
      console.error('Error checking/refreshing token:', error);
    }
  },
};
