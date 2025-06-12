import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../lib/context/UserContext';
import { ROUTE_PATH } from '@/constants/routes';
import { PageLoading } from '@/components/custom/loading';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

/**
 * ProtectedRoute component to restrict access to authenticated users
 * or users with admin role if requireAdmin is true
 */
export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading, checkAdminAccess } = useUser();
  const location = useLocation();

  // Effect to refresh admin status when the component mounts or route changes
  useEffect(() => {
    // If user is authenticated and this is an admin-required route, verify admin access
    if (isAuthenticated && requireAdmin) {
      checkAdminAccess().catch((error) => {
        console.error('Failed to verify admin access:', error);
      });
    }
  }, [isAuthenticated, requireAdmin, checkAdminAccess, location.pathname]);
  // Show loading indicator while checking authentication
  if (isLoading) {
    return <PageLoading message="Verifying authentication..." />;
  }
  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login page, but remember where they were trying to go
    return <Navigate to={ROUTE_PATH.LOGIN} state={{ from: location.pathname }} replace />;
  }
  // If admin access is required, check for admin role
  if (requireAdmin && !isAdmin) {
    return <Navigate to={ROUTE_PATH.UNAUTHORIZED} state={{ from: location.pathname }} replace />;
  }
  // If all checks pass, render the child routes
  return children;
}
