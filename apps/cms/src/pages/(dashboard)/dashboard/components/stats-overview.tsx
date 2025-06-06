import { StatsCard } from './stats-card';
import { Icons } from '@/components/icons';

export const StatsOverview = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Memes"
        value="0"
        icon={<Icons.Meme className="h-4 w-4 text-muted-foreground" />}
        helperText="+0% from last month"
      />
      <StatsCard
        title="Total Tags"
        value="0"
        icon={<Icons.Tag className="h-4 w-4 text-muted-foreground" />}
        helperText="+0% since last month"
      />
      <StatsCard
        title="Active Users"
        value="0"
        icon={<Icons.Users className="h-4 w-4 text-muted-foreground" />}
        helperText="+0% from last week"
      />
      <StatsCard
        title="Storage Used"
        value="0 MB"
        icon={<Icons.Database className="h-4 w-4 text-muted-foreground" />}
        helperText="+0% from last month"
      />
    </div>
  );
};
