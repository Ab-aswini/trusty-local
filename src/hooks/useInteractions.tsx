import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Interaction } from '@/types/database';
import { toast } from '@/hooks/use-toast';

export function useInteractions() {
  const { user } = useAuth();
  const [pendingRatings, setPendingRatings] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingRatings = useCallback(async () => {
    if (!user) {
      setPendingRatings([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .eq('consumer_id', user.id)
        .eq('rated', false)
        .gt('rating_expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingRatings((data || []) as Interaction[]);
    } catch (err) {
      console.error('Error fetching pending ratings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPendingRatings();
  }, [fetchPendingRatings]);

  const logInteraction = async (shopId: string, interactionType: string = 'whatsapp_click') => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('interactions')
        .insert({
          consumer_id: user.id,
          shop_id: shopId,
          interaction_type: interactionType,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Interaction;
    } catch (err) {
      console.error('Error logging interaction:', err);
      return null;
    }
  };

  const submitRating = async (
    interactionId: string,
    shopId: string,
    tags: { isHonest: boolean; isRespectful: boolean; isHelpful: boolean; isCalm: boolean }
  ) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to submit ratings.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('ratings')
        .insert({
          interaction_id: interactionId,
          shop_id: shopId,
          is_honest: tags.isHonest,
          is_respectful: tags.isRespectful,
          is_helpful: tags.isHelpful,
          is_calm: tags.isCalm,
        });

      if (error) throw error;

      toast({ title: "Thank you for your feedback!" });
      fetchPendingRatings();
      return true;
    } catch (err) {
      console.error('Error submitting rating:', err);
      toast({
        title: "Error",
        description: "Unable to submit rating. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { pendingRatings, isLoading, logInteraction, submitRating, refetch: fetchPendingRatings };
}