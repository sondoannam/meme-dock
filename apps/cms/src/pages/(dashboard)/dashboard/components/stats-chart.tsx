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

    // Enhanced chart configuration with app theme colors
    const chartConfig = {
      primary: { color: 'hsl(var(--chart-1))' },
      secondary: { color: 'hsl(var(--chart-2))' },
      accent: { color: 'hsl(var(--chart-3))' },
      muted: { color: 'hsl(var(--chart-4))' },
      highlight: { color: 'hsl(var(--chart-5))' },
    };

    return (
      <ChartContainer className="h-[300px]" config={chartConfig}>
        {chartType === 'line' ? (
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
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
              stroke="var(--color-muted-foreground)"
              tick={{ fill: 'var(--color-foreground)' }}
            />
            <YAxis
              fontSize={12}
              stroke="var(--color-muted-foreground)"
              tick={{ fill: 'var(--color-foreground)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-popover)',
                color: 'var(--color-foreground)',
                border: '1px solid var(--color-border)',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '10px',
                fontWeight: 500,
                color: 'var(--color-foreground)',
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="var(--color-chart-1)"
              fill="url(#colorCount)"
              name={`${title} Count`}
              activeDot={{ r: 8, fill: 'var(--color-chart-1)', stroke: 'var(--color-background)' }}
              strokeWidth={3}
            />
          </LineChart>
        ) : (
          <BarChart data={chartData}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={1} />
                <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
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
              stroke="var(--color-muted-foreground)"
              tick={{ fill: 'var(--color-foreground)' }}
            />
            <YAxis
              fontSize={12}
              stroke="var(--color-muted-foreground)"
              tick={{ fill: 'var(--color-foreground)' }}
            />
            <Tooltip
              cursor={{ fill: 'var(--color-accent)', opacity: 0.1 }}
              contentStyle={{
                backgroundColor: 'var(--color-popover)',
                color: 'var(--color-foreground)',
                border: '1px solid var(--color-border)',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '10px',
                fontWeight: 500,
                color: 'var(--color-foreground)',
              }}
            />
            <Bar
              dataKey="count"
              fill="url(#barGradient)"
              stroke="var(--color-chart-1)"
              strokeWidth={1}
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
  // Enhanced chart configuration with app theme colors
  const chartConfig = {
    primary: { color: 'hsl(var(--chart-1))' },
    secondary: { color: 'hsl(var(--chart-2))' },
    accent: { color: 'hsl(var(--chart-3))' },
    muted: { color: 'hsl(var(--chart-4))' },
    highlight: { color: 'hsl(var(--chart-5))' },
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
              <defs>
                <linearGradient id="colorCountDemo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
              <XAxis
                dataKey="name"
                fontSize={12}
                stroke="var(--color-muted-foreground)"
                tick={{ fill: 'var(--color-foreground)' }}
              />
              <YAxis
                fontSize={12}
                stroke="var(--color-muted-foreground)"
                tick={{ fill: 'var(--color-foreground)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-popover)',
                  color: 'var(--color-foreground)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: '10px',
                  fontWeight: 500,
                  color: 'var(--color-foreground)',
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--color-chart-2)"
                fill="url(#colorCountDemo)"
                name={`${title} (Demo)`}
                activeDot={{
                  r: 8,
                  fill: 'var(--color-chart-2)',
                  stroke: 'var(--color-background)',
                }}
                strokeWidth={3}
              />
            </LineChart>
          ) : (
            <BarChart data={demoData}>
              <defs>
                <linearGradient id="barGradientDemo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={1} />
                  <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
              <XAxis
                dataKey="name"
                fontSize={12}
                stroke="var(--color-muted-foreground)"
                tick={{ fill: 'var(--color-foreground)' }}
              />
              <YAxis
                fontSize={12}
                stroke="var(--color-muted-foreground)"
                tick={{ fill: 'var(--color-foreground)' }}
              />
              <Tooltip
                cursor={{ fill: 'var(--color-accent)', opacity: 0.1 }}
                contentStyle={{
                  backgroundColor: 'var(--color-popover)',
                  color: 'var(--color-foreground)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: '10px',
                  fontWeight: 500,
                  color: 'var(--color-foreground)',
                }}
              />
              <Bar
                dataKey="count"
                fill="url(#barGradientDemo)"
                stroke="var(--color-chart-2)"
                strokeWidth={1}
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
