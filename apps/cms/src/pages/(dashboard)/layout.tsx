import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/layouts/app-sidebar';
import MainLayout from '@/layouts/main-layout';
import { useAuthCheck } from '@/hooks/use-auth-check';
import { useAdminApiAccess } from '@/hooks/use-admin-api-access';

/**
 * Layout component for dashboard routes
 * This layout checks if the user is authenticated and has admin privileges
 */
export function Component() {
  // Use the auth check hook to handle authentication and admin checks
  const { isLoading } = useAuthCheck({
    requireAuth: true,
    requireAdmin: true,
    redirectTo: '/login',
    storeRedirectPath: true,
  });

  const { isVerifying } = useAdminApiAccess();

  // Show loading indicator while checking authentication or API access
  if (isLoading || isVerifying) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isLoading ? 'Verifying authentication...' : 'Checking API access...'}
          </p>
        </div>
      </div>
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
