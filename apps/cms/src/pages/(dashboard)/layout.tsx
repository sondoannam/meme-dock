import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/layouts/app-sidebar';
import MainLayout from '@/layouts/main-layout';
import { useAuthCheck } from '@/hooks/use-auth-check';
import { ROUTE_PATH } from '@/constants/routes';
import { PageLoading } from '@/components/custom/loading';

/**
 * Layout component for dashboard routes
 * This layout checks if the user is authenticated and has admin privileges
 */
export function Component() {
  // Use the auth check hook to handle authentication and admin checks
  const { isLoading } = useAuthCheck({
    requireAuth: true,
    requireAdmin: true,
    redirectTo: ROUTE_PATH.LOGIN,
    storeRedirectPath: true,
  });

  if (isLoading) {
    return (
      <PageLoading message={isLoading ? 'Verifying authentication...' : 'Checking API access...'} />
    );
  }

  // If user has admin privileges and API access, render the dashboard layout
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <MainLayout />
      </div>
    </SidebarProvider>
  );
}
