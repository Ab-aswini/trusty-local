import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, subDays, format, eachDayOfInterval } from 'date-fns';

interface DailyStats {
  date: string;
  views: number;
  clicks: number;
}

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  totalRatings: number;
  dailyStats: DailyStats[];
  viewsTrend: number; // percentage change
  clicksTrend: number;
}

export function useVendorAnalytics(shopId: string | undefined, days: number = 7) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!shopId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const endDate = new Date();
      const startDate = subDays(endDate, days - 1);
      const previousStartDate = subDays(startDate, days);

      // Fetch interactions for current period
      const { data: currentInteractions, error: currentError } = await supabase
        .from('interactions')
        .select('interaction_type, created_at')
        .eq('shop_id', shopId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (currentError) throw currentError;

      // Fetch interactions for previous period (for trend calculation)
      const { data: previousInteractions, error: previousError } = await supabase
        .from('interactions')
        .select('interaction_type, created_at')
        .eq('shop_id', shopId)
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      if (previousError) throw previousError;

      // Fetch ratings count
      const { count: ratingsCount, error: ratingsError } = await supabase
        .from('ratings')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', shopId);

      if (ratingsError) throw ratingsError;

      // Process current period data
      const currentViews = currentInteractions?.filter(i => i.interaction_type === 'view').length || 0;
      const currentClicks = currentInteractions?.filter(i => i.interaction_type === 'whatsapp_click').length || 0;

      // Process previous period data for trends
      const previousViews = previousInteractions?.filter(i => i.interaction_type === 'view').length || 0;
      const previousClicks = previousInteractions?.filter(i => i.interaction_type === 'whatsapp_click').length || 0;

      // Calculate trends
      const viewsTrend = previousViews > 0 
        ? Math.round(((currentViews - previousViews) / previousViews) * 100) 
        : currentViews > 0 ? 100 : 0;
      const clicksTrend = previousClicks > 0 
        ? Math.round(((currentClicks - previousClicks) / previousClicks) * 100) 
        : currentClicks > 0 ? 100 : 0;

      // Generate daily stats
      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
      const dailyStats: DailyStats[] = dateRange.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayStart = startOfDay(date);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const dayInteractions = currentInteractions?.filter(i => {
          const iDate = new Date(i.created_at);
          return iDate >= dayStart && iDate < dayEnd;
        }) || [];

        return {
          date: format(date, 'MMM d'),
          views: dayInteractions.filter(i => i.interaction_type === 'view').length,
          clicks: dayInteractions.filter(i => i.interaction_type === 'whatsapp_click').length,
        };
      });

      setData({
        totalViews: currentViews,
        totalClicks: currentClicks,
        totalRatings: ratingsCount || 0,
        dailyStats,
        viewsTrend,
        clicksTrend,
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [shopId, days]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, isLoading, refetch: fetchAnalytics };
}
