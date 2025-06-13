import { useNavigate } from 'react-router-dom';
import { useUser } from '@/lib/context/UserContext';
import { TokenService } from '@/services/token';
import { ROUTE_PATH } from '@/constants/routes';

/**
 * Hook for handling authentication session recovery
 * Provides functions to handle auth errors and attempt recovery
 */
export function useSessionRecovery() {
  const navigate = useNavigate();
  const { logout, user } = useUser();

  /**
   * Handle authentication errors and attempt recovery
   * @param error The error object
   * @param options Recovery options
   * @returns True if recovery was successful
   */
  const handleAuthError = async (
    error: any,
    options: {
      redirectToLogin?: boolean;
      attemptRefresh?: boolean;
    } = {
      redirectToLogin: true,
      attemptRefresh: true,
    },
  ): Promise<boolean> => {
    // Check if this is an auth error
    const isAuthError = error?.response?.status === 401 || error?.response?.status === 403;

    if (!isAuthError) return false;

    // Clear the token if it's invalid
    TokenService.clearToken();

    // If we were already logged out, just redirect
    if (!user) {
      if (options.redirectToLogin) {
        navigate(ROUTE_PATH.LOGIN, {
          state: {
            from: window.location.pathname,
            authError: 'Your session has expired. Please log in again.',
          },
        });
      }
      return false;
    }

    // Log the user out
    try {
      await logout();

      if (options.redirectToLogin) {
        navigate(ROUTE_PATH.LOGIN, {
          state: {
            from: window.location.pathname,
            authError: 'Your session has expired. Please log in again.',
          },
        });
      }
    } catch (logoutError) {
      console.error('Error during logout in session recovery:', logoutError);
      // Force navigation to login as a last resort
      if (options.redirectToLogin) {
        navigate(ROUTE_PATH.LOGIN, {
          state: {
            from: window.location.pathname,
            authError: 'Authentication error. Please log in again.',
          },
        });
      }
    }

    return false;
  };

  return { handleAuthError };
}
