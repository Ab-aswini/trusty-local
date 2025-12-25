import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PendingInteraction {
  id: string;
  shop_id: string;
  created_at: string;
  rating_expires_at: string;
  shop?: {
    name: string;
    image_url: string | null;
  };
}

export const usePendingRatings = () => {
  const { user } = useAuth();
  const [pendingRatings, setPendingRatings] = useState<PendingInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingRatings = async () => {
    if (!user) {
      setPendingRatings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('interactions')
        .select(`
          id,
          shop_id,
          created_at,
          rating_expires_at,
          shops:shop_id (name, image_url)
        `)
        .eq('consumer_id', user.id)
        .eq('rated', false)
        .gt('rating_expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = data?.map(interaction => ({
        ...interaction,
        shop: Array.isArray(interaction.shops) ? interaction.shops[0] : interaction.shops,
      })) || [];

      setPendingRatings(transformedData as PendingInteraction[]);
    } catch (error) {
      console.error('Error fetching pending ratings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRatings();
  }, [user]);

  return {
    pendingRatings,
    isLoading,
    count: pendingRatings.length,
    refetch: fetchPendingRatings,
  };
};
