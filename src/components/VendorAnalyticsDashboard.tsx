import { useState } from 'react';
import { useVendorAnalytics } from '@/hooks/useVendorAnalytics';
import { 
  Eye, 
  MessageCircle, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface VendorAnalyticsDashboardProps {
  shopId: string;
}

type TimeRange = 7 | 14 | 30;

export default function VendorAnalyticsDashboard({ shopId }: VendorAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(7);
  const { data, isLoading } = useVendorAnalytics(shopId, timeRange);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-soft p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-6 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
        <div className="card-soft p-4 h-48 animate-pulse">
          <div className="h-full bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card-soft p-6 text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  const TrendIndicator = ({ value }: { value: number }) => {
    if (value === 0) {
      return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
    if (value > 0) {
      return (
        <span className="flex items-center text-green-600 text-xs">
          <TrendingUp className="h-3 w-3 mr-0.5" />
          +{value}%
        </span>
      );
    }
    return (
      <span className="flex items-center text-red-500 text-xs">
        <TrendingDown className="h-3 w-3 mr-0.5" />
        {value}%
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-medium text-foreground">Analytics</h2>
        <div className="flex bg-muted rounded-lg p-1">
          {([7, 14, 30] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-calm",
                timeRange === range
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {range}d
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card-soft p-3">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Views</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-semibold text-foreground">{data.totalViews}</span>
            <TrendIndicator value={data.viewsTrend} />
          </div>
        </div>

        <div className="card-soft p-3">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Clicks</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-semibold text-foreground">{data.totalClicks}</span>
            <TrendIndicator value={data.clicksTrend} />
          </div>
        </div>

        <div className="card-soft p-3">
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">Ratings</span>
          </div>
          <span className="text-xl font-semibold text-foreground">{data.totalRatings}</span>
        </div>
      </div>

      {/* Conversion Rate */}
      {data.totalViews > 0 && (
        <div className="card-soft p-3 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Click-through rate</span>
            <span className="text-lg font-semibold text-primary">
              {((data.totalClicks / data.totalViews) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${Math.min((data.totalClicks / data.totalViews) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="card-soft p-4">
        <h3 className="text-sm font-medium text-foreground mb-4">Activity over time</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.dailyStats} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }} 
                className="text-muted-foreground"
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar 
                dataKey="views" 
                name="Views"
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
              <Bar 
                dataKey="clicks" 
                name="Clicks"
                fill="hsl(142 76% 36%)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary opacity-80" />
            <span className="text-xs text-muted-foreground">Views</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(142 76% 36%)' }} />
            <span className="text-xs text-muted-foreground">Clicks</span>
          </div>
        </div>
      </div>
    </div>
  );
}
