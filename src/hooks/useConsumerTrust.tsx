import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ConsumerTrust {
  trust_level: 'low' | 'medium' | 'high';
  positive_interactions: number;
  total_interactions: number;
}

export function useConsumerTrust() {
  const { user } = useAuth();
  const [trust, setTrust] = useState<ConsumerTrust | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTrust(null);
      setIsLoading(false);
      return;
    }

    const fetchTrust = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('consumer_trust')
          .select('trust_level, positive_interactions, total_interactions')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setTrust({
            trust_level: data.trust_level as 'low' | 'medium' | 'high',
            positive_interactions: data.positive_interactions,
            total_interactions: data.total_interactions,
          });
        } else {
          // Default for new users
          setTrust({
            trust_level: 'medium',
            positive_interactions: 0,
            total_interactions: 0,
          });
        }
      } catch (error) {
        console.error('Error fetching consumer trust:', error);
        setTrust({
          trust_level: 'medium',
          positive_interactions: 0,
          total_interactions: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrust();
  }, [user]);

  return { trust, isLoading };
}
