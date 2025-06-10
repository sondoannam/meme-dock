import React, { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../lib/context/UserContext';

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
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login page, but remember where they were trying to go
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  // If admin access is required, check for admin role
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" state={{ from: location.pathname }} replace />;
  }
  // If all checks pass, render the child routes
  return children;
}
