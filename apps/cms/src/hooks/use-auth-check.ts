import { useEffect, useState } from 'react';
import { useUser } from '@/lib/context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTE_PATH } from '@/constants/routes';

interface UseAuthCheckOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
  redirectIfAuthenticated?: boolean;
  redirectIfAuthenticated_To?: string;
  storeRedirectPath?: boolean;
}

/**
 * Hook for performing common authentication checks in components and layouts
 */
export function useAuthCheck({
  requireAuth = true,
  requireAdmin = true,
  redirectTo = ROUTE_PATH.LOGIN,
  redirectIfAuthenticated = false,
  redirectIfAuthenticated_To = ROUTE_PATH.DASHBOARD,
  storeRedirectPath = true,
}: UseAuthCheckOptions = {}) {
  const { isAuthenticated, isAdmin, isLoading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkComplete, setCheckComplete] = useState(false);

  useEffect(() => {
    if (isLoading) {
      return; // Wait until auth loading is complete
    }

    // Handle redirection for authenticated users when needed
    if (redirectIfAuthenticated && isAuthenticated) {
      navigate(redirectIfAuthenticated_To);
      return;
    }

    // Handle auth requirements
    if (requireAuth && !isAuthenticated) {
      // Store current path for redirect after login if needed
      if (storeRedirectPath) {
        navigate(redirectTo, { state: { from: location.pathname } });
      } else {
        navigate(redirectTo);
      }
      return;
    }

    // Handle admin requirements
    if (requireAdmin && (!isAuthenticated || !isAdmin)) {
      navigate('/unauthorized', { state: { from: location.pathname } });
      return;
    }

    // Mark checks as complete if we reach here
    setCheckComplete(true);
  }, [
    isLoading,
    isAuthenticated,
    isAdmin,
    requireAuth,
    requireAdmin,
    redirectIfAuthenticated,
    redirectTo,
    redirectIfAuthenticated_To,
    navigate,
    location.pathname,
    storeRedirectPath,
  ]);

  return {
    isLoading,
    isAuthenticated,
    isAdmin,
    checkComplete,
    currentPath: location.pathname,
  };
}
