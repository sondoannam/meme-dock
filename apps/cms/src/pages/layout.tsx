import { Suspense, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@/lib/context/UserContext';
import { TokenService } from '@/services/token';
import { TokenRefreshService } from '@/services/token-refresh';
import { ROUTE_PATH } from '@/constants/routes';
import { PageLoading } from '@/components/custom/loading';

/**
 * Root layout component that wraps all routes
 * Handles global authentication state and token validation
 */
export function Component() {
  const { isAuthenticated, isLoading, isAdmin } = useUser();
  const { pathname } = useLocation();
  const navigate = useNavigate();

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
    if (!isAuthenticated && !isLoading) {
      navigate(ROUTE_PATH.LOGIN);
    }

    if (isAuthenticated && !isLoading) {
      if (TokenService.isTokenExpired()) {
        console.log('Token is expired or close to expiry, refreshing...');
        TokenRefreshService.checkAndRefreshToken();
      }

      if (isAdmin && pathname === ROUTE_PATH.HOME) {
        navigate(ROUTE_PATH.DASHBOARD);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isAuthenticated, isLoading]);

  return (
    <Suspense fallback={<PageLoading message="Loading application..." />}>
      <Outlet />
    </Suspense>
  );
}
