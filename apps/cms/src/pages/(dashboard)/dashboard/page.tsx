import { DatabaseManager } from './components/database-manager';
import { StatsOverview } from './components/stats-overview';
import { useAdminApiAccess } from '@/hooks/use-admin-api-access';
import { ApiError } from '@/components/custom/api-error';
import { useUser } from '@/lib/context/UserContext';
import { Button } from '@/components/ui/button';

export const Component = () => {
  const { hasApiAccess, isVerifying, error } = useAdminApiAccess();
  const { user, checkAdminAccess } = useUser();

  // Show loading state while verifying API access
  if (isVerifying) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying API access...</p>
        </div>
      </div>
    );
  }

  // Show error if API access is denied
  if (error || !hasApiAccess) {
    return (
      <div className="p-8">
        <ApiError
          error={error || "You don't have access to the admin API. Please check your permissions."}
          onRetry={checkAdminAccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mt-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Welcome, {user?.name || 'Admin'}</span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Database Management Section */}
        <DatabaseManager />

        {/* Stats Overview Section */}
        <StatsOverview />
      </div>
    </div>
  );
};
