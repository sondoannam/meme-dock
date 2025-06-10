import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthCheck } from '@/hooks/use-auth-check';

/**
 * Layout component for authentication routes (login, register, etc.)
 * This layout checks if the user is already authenticated and redirects to dashboard if true
 */
export function Component() {
  const { isLoading } = useAuthCheck({
    redirectIfAuthenticated: true,
    redirectIfAuthenticated_To: '/dashboard',
  });

  // Show loading indicator while checking authentication status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Render the outlet (child routes) if the user is not authenticated
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading authentication...</p>
          </div>
        </div>
      }
    >
      <Outlet />
    </Suspense>
  );
}
