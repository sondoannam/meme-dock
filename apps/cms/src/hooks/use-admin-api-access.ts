import { useEffect, useState } from 'react';
import { useUser } from '../lib/context/UserContext';
import { authApi } from '../api/auth-client';

/**
 * Hook to verify API access with admin privileges
 * @returns Authentication status and loading state
 */
export function useAdminApiAccess() {
  const { isAuthenticated, isAdmin } = useUser();
  const [hasApiAccess, setHasApiAccess] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyApiAccess = async () => {
      if (isAuthenticated && isAdmin) {
        setIsVerifying(true);
        setError(null);

        try {
          const { authenticated, isAdmin } = await authApi.checkAdminStatus();
          setHasApiAccess(authenticated && isAdmin);

          if (!(authenticated && isAdmin)) {
            setError(
              'Unable to verify admin API access. You may not have permissions to access admin features.',
            );
          }
        } catch (err) {
          console.error('Failed to verify API access:', err);
          setError('Error verifying API access. The API server may be unavailable.');
          setHasApiAccess(false);
        } finally {
          setIsVerifying(false);
        }
      } else {
        setHasApiAccess(false);
      }
    };

    verifyApiAccess();
  }, [isAuthenticated, isAdmin]);

  return {
    hasApiAccess,
    isVerifying,
    error,
    isAuthenticated,
    isAdmin,
  };
}
