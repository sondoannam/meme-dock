import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthCheck } from '@/hooks/use-auth-check';

/**
 * Layout component for authentication routes (login, register, etc.)
 * This layout checks if the user is already authenticated and redirects to dashboard if true
 */
export function Component() {
  useAuthCheck({
    redirectIfAuthenticated: true,
  });

  return (
    <Suspense fallback={undefined}>
      <Outlet />
    </Suspense>
  );
}
