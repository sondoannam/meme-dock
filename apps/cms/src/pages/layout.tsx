import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useUser } from '@/lib/context/UserContext';
import { TokenService } from '@/services/token';
import { TokenRefreshService } from '@/services/token-refresh';

/**
 * Root layout component that wraps all routes
 * Handles global authentication state and token validation
 */
export function Component() {
  const { isAuthenticated, isLoading } = useUser();
  const location = useLocation();

  // Initialize token refresh service when user is authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Start token refresh service
      TokenRefreshService.initTokenRefresh();
    } else {
      // Stop token refresh service when logged out
      TokenRefreshService.stopTokenRefresh();
    }

    // Cleanup on unmount
    return () => {
      TokenRefreshService.stopTokenRefresh();
    };
  }, [isAuthenticated, isLoading]);

  // Effect to check token validity on location changes
  useEffect(() => {
    // If the user is authenticated, validate token on each route change
    if (isAuthenticated && !isLoading) {
      // If token is expired or invalid, TokenService will handle token refresh
      if (TokenService.isTokenExpired()) {
        console.log('Token is expired or close to expiry, refreshing...');
        TokenRefreshService.checkAndRefreshToken();
      }
    }
  }, [location.pathname, isAuthenticated, isLoading]);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading application...</p>
          </div>
        </div>
      }
    >
      <Outlet />
    </Suspense>
  );
}
