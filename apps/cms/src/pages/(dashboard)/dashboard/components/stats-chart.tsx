import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentIncreaseResponse } from '@/services/document';

type Duration = 'day' | 'week' | 'month';

// Using imported DocumentIncreaseResponse from services instead

interface StatsChartProps {
  title: string;
  data: DocumentIncreaseResponse | undefined;
  isLoading: boolean;
  error: string | null;
  duration: Duration;
  limit: number;
  onOptionsChange: (duration: Duration, limit: number) => void;
}

export const StatsChart: React.FC<StatsChartProps> = ({
  title,
  data,
  isLoading,
  error,
  duration,
  limit,
  onOptionsChange,
}) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const handleDurationChange = (newDuration: string) => {
    onOptionsChange(newDuration as Duration, limit);
  };

  const handleLimitChange = (newLimit: number) => {
    onOptionsChange(duration, newLimit);
  };

  // Helper function to get period label
  const getPeriodLabel = (periodType: Duration, plural = false) => {
    switch (periodType) {
      case 'day':
        return plural ? 'Days' : 'Day';
      case 'week':
        return plural ? 'Weeks' : 'Week';
      case 'month':
        return plural ? 'Months' : 'Month';
    }
  };

  const renderChart = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    if (error) {
      return <div className="text-red-500">{error}</div>;
    }

    if (!data?.periods?.length) {
      return <div className="text-muted-foreground">No data available</div>;
    }

    const chartData = data.periods.map((period) => ({
      name: period.period,
      count: period.count,
    }));

    const chartConfig = {
      primary: { color: 'hsl(var(--primary))' },
      secondary: { color: 'hsl(var(--secondary))' },
    };

    return (
      <ChartContainer className="h-[300px]" config={chartConfig}>
        {chartType === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              fontSize={12}
              tickFormatter={(value) => {
                // Shorten month names for better display
                if (duration === 'month') {
                  return value.split(' ')[0].substring(0, 3) + ' ' + value.split(' ')[1];
                }
                return value;
              }}
            />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="var(--color-primary)"
              name={`${title} Count`}
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          </LineChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              fontSize={12}
              tickFormatter={(value) => {
                // Shorten month names for better display
                if (duration === 'month') {
                  return value.split(' ')[0].substring(0, 3) + ' ' + value.split(' ')[1];
                }
                return value;
              }}
            />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="count"
              fill="var(--color-primary)"
              name={`${title} Count`}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        )}
      </ChartContainer>
    );
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <Tabs defaultValue={duration} onValueChange={(value) => handleDurationChange(value)}>
          <TabsList>
            <TabsTrigger value="day">Daily</TabsTrigger>
            <TabsTrigger value="week">Weekly</TabsTrigger>
            <TabsTrigger value="month">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button
            variant={chartType === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('line')}
          >
            Line Chart
          </Button>
          <Button
            variant={chartType === 'bar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('bar')}
          >
            Bar Chart
          </Button>
        </div>
      </div>

      <div className="border rounded-lg p-4">{renderChart()}</div>
      <div className="grid grid-cols-3 gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleLimitChange(6)}
          className={limit === 6 ? 'border-primary' : ''}
        >
          Last 6 {getPeriodLabel(duration, true)}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleLimitChange(12)}
          className={limit === 12 ? 'border-primary' : ''}
        >
          Last 12 {getPeriodLabel(duration, true)}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleLimitChange(24)}
          className={limit === 24 ? 'border-primary' : ''}
        >
          Last 24 {getPeriodLabel(duration, true)}
        </Button>
      </div>
    </div>
  );
};

// Demo chart component for cards that don't have real data yet
export const DemoStatsChart: React.FC<{ title: string }> = ({ title }) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // Generate demo data
  const demoData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      name: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
      count: Math.floor(Math.random() * 100) + 10,
    };
  }).reverse();

  const chartConfig = {
    primary: { color: 'hsl(var(--primary))' },
    secondary: { color: 'hsl(var(--secondary))' },
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">Demo Data</h3>
        <div className="flex items-center gap-2">
          <Button
            variant={chartType === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('line')}
          >
            Line Chart
          </Button>
          <Button
            variant={chartType === 'bar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('bar')}
          >
            Bar Chart
          </Button>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <ChartContainer className="h-[300px]" config={chartConfig}>
          {chartType === 'line' ? (
            <LineChart data={demoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--color-primary)"
                name={`${title} (Demo)`}
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          ) : (
            <BarChart data={demoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="count"
                fill="var(--color-primary)"
                name={`${title} (Demo)`}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ChartContainer>
      </div>

      <div className="flex justify-center">
        <p className="text-sm text-muted-foreground italic">
          This is a demo visualization. Real data integration coming soon.
        </p>
      </div>
    </div>
  );
};
