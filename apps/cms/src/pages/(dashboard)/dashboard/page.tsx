import { DatabaseManager } from './components/database-manager';
import { StatsOverview } from './components/stats-overview';
import { useUser } from '@/lib/context/UserContext';

export const Component = () => {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mt-6">
        <h1 className="!text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Welcome, {user?.name || 'Admin'}</span>
        </div>
      </div>

      <div className="flex flex-col gap-6 space-y-8 mb-10">
        {/* Database Management Section */}
        <DatabaseManager />

        {/* Stats Overview Section */}
        <StatsOverview />
      </div>
    </div>
  );
};
