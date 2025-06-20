import { useState } from 'react';
import { StatsCard } from './stats-card';
import { StatsChart, DemoStatsChart } from './stats-chart';
import { Icons } from '@/components/icons';
import { useRequest } from 'ahooks';
import { documentApi, GetDocumentCountResponse } from '@/services/document';
import { useMemeCollectionStore } from '@/stores/meme-store';

type CardType = 'memes' | 'tags' | 'users' | 'storage' | null;
type Duration = 'day' | 'week' | 'month';

export const StatsOverview = () => {
  const [activeCard, setActiveCard] = useState<CardType>('memes');
  const [chartOptions, setChartOptions] = useState<{
    duration: Duration;
    limit: number;
  }>({
    duration: 'month',
    limit: 12,
  });

  const memeCollection = useMemeCollectionStore((state) => state.memeCollection);

  const { data: memesCount, loading: memesCountLoading } = useRequest(
    () => {
      if (!memeCollection) return Promise.resolve(undefined);
      return documentApi.getDocumentCount(memeCollection.id);
    },
    {
      refreshDeps: [memeCollection],
    },
  );

  const {
    data: memeIncreaseData,
    loading: memeLoading,
    error: memeError,
  } = useRequest(
    () => {
      if (!memeCollection) return Promise.resolve(undefined);

      return documentApi.getDocumentIncreases({
        collectionId: memeCollection.id,
        duration: chartOptions.duration,
        limit: chartOptions.limit,
      });
    },
    {
      refreshDeps: [memeCollection, chartOptions.duration, chartOptions.limit],
      debounceWait: 500,
    },
  );

  const handleCardClick = (card: CardType) => {
    if (activeCard === card) {
      setActiveCard(null);
      return;
    }

    setActiveCard(card);
  };

  // Callback for chart options changed in children
  const handleMemeChartOptionsChange = (duration: Duration, limit: number) => {
    setChartOptions({ duration, limit });
  };

  const renderChartView = () => {
    switch (activeCard) {
      case 'memes':
        return (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Meme Statistics</h2>
            <StatsChart
              title="Memes"
              data={memeIncreaseData}
              isLoading={memeLoading}
              error={memeError ? String(memeError) : null}
              duration={chartOptions.duration}
              limit={chartOptions.limit}
              onOptionsChange={handleMemeChartOptionsChange}
            />
          </div>
        );
      case 'tags':
        return (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Tag Statistics</h2>
            <DemoStatsChart title="Tags" />
          </div>
        );
      case 'users':
        return (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">User Statistics</h2>
            <DemoStatsChart title="Users" />
          </div>
        );
      case 'storage':
        return (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Storage Statistics</h2>
            <DemoStatsChart title="Storage" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className='space-y-6'>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Memes"
          value={memesCountLoading ? '...' : String(memesCount?.total ?? 0)}
          icon={<Icons.Meme className="h-4 w-4 text-muted-foreground" />}
          helperText="+0% from last month"
          onClick={() => handleCardClick('memes')}
          isActive={activeCard === 'memes'}
        />
        <StatsCard
          title="Total Tags"
          value={'0'}
          icon={<Icons.Tag className="h-4 w-4 text-muted-foreground" />}
          helperText="+0% since last month"
          onClick={() => handleCardClick('tags')}
          isActive={activeCard === 'tags'}
        />
        <StatsCard
          title="Active Users"
          value="0"
          icon={<Icons.Users className="h-4 w-4 text-muted-foreground" />}
          helperText="+0% from last week"
          onClick={() => handleCardClick('users')}
          isActive={activeCard === 'users'}
        />
        <StatsCard
          title="Storage Used"
          value="0 MB"
          icon={<Icons.Database className="h-4 w-4 text-muted-foreground" />}
          helperText="+0% from last month"
          onClick={() => handleCardClick('storage')}
          isActive={activeCard === 'storage'}
        />
      </div>

      {activeCard && (
        <div className="mt-6 p-6 border rounded-lg bg-card shadow animate-in fade-in-50 duration-300">
          {renderChartView()}
        </div>
      )}
    </div>
  );
};
