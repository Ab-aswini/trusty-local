import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface RecentInteraction {
  id: string;
  consumer_id: string;
  interaction_type: string;
  created_at: string;
  consumer_display_name: string | null;
  consumer_trust_level: 'low' | 'medium' | 'high' | null;
  has_rated_vendor: boolean;
  vendor_has_rated: boolean;
}

export function useVendorFeedback(shopId: string | undefined) {
  const [recentInteractions, setRecentInteractions] = useState<RecentInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecentInteractions = useCallback(async () => {
    if (!shopId) {
      setRecentInteractions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch recent interactions (last 30 days, WhatsApp clicks only)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: interactions, error: interactionsError } = await supabase
        .from('interactions')
        .select('id, consumer_id, interaction_type, created_at')
        .eq('shop_id', shopId)
        .eq('interaction_type', 'whatsapp_click')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (interactionsError) throw interactionsError;

      if (!interactions || interactions.length === 0) {
        setRecentInteractions([]);
        setIsLoading(false);
        return;
      }

      // Get unique consumer IDs
      const consumerIds = [...new Set(interactions.map(i => i.consumer_id).filter(Boolean))];

      // Fetch consumer trust data
      const { data: trustData, error: trustError } = await supabase
        .from('consumer_trust')
        .select('user_id, trust_level')
        .in('user_id', consumerIds);

      if (trustError) console.error('Trust fetch error:', trustError);

      // Fetch ratings (consumer rated vendor)
      const interactionIds = interactions.map(i => i.id);
      const { data: ratings, error: ratingsError } = await supabase
        .from('ratings')
        .select('interaction_id')
        .in('interaction_id', interactionIds);

      if (ratingsError) console.error('Ratings fetch error:', ratingsError);

      // Fetch vendor feedback (vendor rated consumer)
      const { data: vendorFeedback, error: feedbackError } = await supabase
        .from('vendor_feedback')
        .select('interaction_id')
        .eq('shop_id', shopId)
        .in('interaction_id', interactionIds);

      if (feedbackError) console.error('Vendor feedback fetch error:', feedbackError);

      // Fetch profiles for display names
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', consumerIds);

      if (profilesError) console.error('Profiles fetch error:', profilesError);

      // Map data
      const trustMap = new Map(trustData?.map(t => [t.user_id, t.trust_level]) || []);
      const ratedInteractions = new Set(ratings?.map(r => r.interaction_id) || []);
      const vendorRatedInteractions = new Set(vendorFeedback?.map(f => f.interaction_id) || []);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);

      const enrichedInteractions: RecentInteraction[] = interactions
        .filter(i => i.consumer_id) // Only show interactions with logged-in consumers
        .map(interaction => ({
          id: interaction.id,
          consumer_id: interaction.consumer_id!,
          interaction_type: interaction.interaction_type,
          created_at: interaction.created_at,
          consumer_display_name: profileMap.get(interaction.consumer_id!) || null,
          consumer_trust_level: (trustMap.get(interaction.consumer_id!) as 'low' | 'medium' | 'high') || null,
          has_rated_vendor: ratedInteractions.has(interaction.id),
          vendor_has_rated: vendorRatedInteractions.has(interaction.id),
        }));

      setRecentInteractions(enrichedInteractions);
    } catch (error) {
      console.error('Error fetching recent interactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [shopId]);

  const submitFeedback = async (
    interactionId: string,
    consumerId: string,
    feedback: { isCalm: boolean; isRespectful: boolean; isPunctual: boolean }
  ) => {
    if (!shopId) return false;

    try {
      const { error } = await supabase
        .from('vendor_feedback')
        .insert({
          shop_id: shopId,
          consumer_id: consumerId,
          interaction_id: interactionId,
          is_calm: feedback.isCalm,
          is_respectful: feedback.isRespectful,
          is_punctual: feedback.isPunctual,
        });

      if (error) throw error;

      toast({ title: 'Feedback submitted', description: 'Thank you for your feedback!' });
      fetchRecentInteractions();
      return true;
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      if (error.code === '23505') {
        toast({ title: 'Already submitted', description: 'You have already rated this customer.', variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: 'Failed to submit feedback', variant: 'destructive' });
      }
      return false;
    }
  };

  useEffect(() => {
    fetchRecentInteractions();
  }, [fetchRecentInteractions]);

  return { recentInteractions, isLoading, submitFeedback, refetch: fetchRecentInteractions };
}
