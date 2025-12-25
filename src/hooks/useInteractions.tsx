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

  const submitReview = async (
    interactionId: string,
    shopId: string,
    data: {
      starRating: number;
      tags: {
        isHonest: boolean;
        isRespectful: boolean;
        isHelpful: boolean;
        isCalm: boolean;
        isPatient: boolean;
        isClearCommunication: boolean;
      };
      reviewText?: string;
      reviewerDisplayName?: string;
      source?: string;
    }
  ) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to submit reviews.",
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
          star_rating: data.starRating,
          is_honest: data.tags.isHonest,
          is_respectful: data.tags.isRespectful,
          is_helpful: data.tags.isHelpful,
          is_calm: data.tags.isCalm,
          is_patient: data.tags.isPatient,
          is_clear_communication: data.tags.isClearCommunication,
          review_text: data.reviewText || null,
          reviewer_display_name: data.reviewerDisplayName || null,
          source: data.source || 'whatsapp',
        });

      if (error) throw error;

      toast({ title: "Thank you for your review!" });
      fetchPendingRatings();
      return true;
    } catch (err) {
      console.error('Error submitting review:', err);
      toast({
        title: "Error",
        description: "Unable to submit review. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Keep old method for backward compatibility
  const submitRating = async (
    interactionId: string,
    shopId: string,
    tags: { isHonest: boolean; isRespectful: boolean; isHelpful: boolean; isCalm: boolean }
  ) => {
    return submitReview(interactionId, shopId, {
      starRating: 5,
      tags: { ...tags, isPatient: false, isClearCommunication: false },
    });
  };

  return { pendingRatings, isLoading, logInteraction, submitRating, submitReview, refetch: fetchPendingRatings };
}