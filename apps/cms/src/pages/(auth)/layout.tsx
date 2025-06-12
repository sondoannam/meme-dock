import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthCheck } from '@/hooks/use-auth-check';
import { PageLoading } from '@/components/custom/loading';

/**
 * Layout component for authentication routes (login, register, etc.)
 * This layout checks if the user is already authenticated and redirects to dashboard if true
 */
export function Component() {
  useAuthCheck({
    redirectIfAuthenticated: true,
  });

  return (
    <Suspense fallback={<PageLoading message="Loading authentication..." />}>
      <Outlet />
    </Suspense>
  );
}
