import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RatingsSummary {
  totalRatings: number;
  honestCount: number;
  respectfulCount: number;
  helpfulCount: number;
  calmCount: number;
  positivePercentage: number;
}

export const useShopRatings = (shopId: string | undefined) => {
  const [summary, setSummary] = useState<RatingsSummary>({
    totalRatings: 0,
    honestCount: 0,
    respectfulCount: 0,
    helpfulCount: 0,
    calmCount: 0,
    positivePercentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!shopId) {
      setIsLoading(false);
      return;
    }

    const fetchRatings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('ratings')
          .select('is_honest, is_respectful, is_helpful, is_calm')
          .eq('shop_id', shopId);

        if (error) throw error;

        const ratings = data || [];
        const totalRatings = ratings.length;
        
        if (totalRatings === 0) {
          setSummary({
            totalRatings: 0,
            honestCount: 0,
            respectfulCount: 0,
            helpfulCount: 0,
            calmCount: 0,
            positivePercentage: 0,
          });
        } else {
          const honestCount = ratings.filter(r => r.is_honest).length;
          const respectfulCount = ratings.filter(r => r.is_respectful).length;
          const helpfulCount = ratings.filter(r => r.is_helpful).length;
          const calmCount = ratings.filter(r => r.is_calm).length;
          
          const totalPositive = honestCount + respectfulCount + helpfulCount + calmCount;
          const maxPositive = totalRatings * 4;
          const positivePercentage = Math.round((totalPositive / maxPositive) * 100);

          setSummary({
            totalRatings,
            honestCount,
            respectfulCount,
            helpfulCount,
            calmCount,
            positivePercentage,
          });
        }
      } catch (error) {
        console.error('Error fetching shop ratings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatings();
  }, [shopId]);

  return { summary, isLoading };
};
