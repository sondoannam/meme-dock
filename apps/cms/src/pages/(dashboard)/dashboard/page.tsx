import { DatabaseManager } from './components/database-manager';
import { StatsOverview } from './components/stats-overview';

export const Component = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mt-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
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
