import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Review {
  id: string;
  star_rating: number | null;
  review_text: string | null;
  is_honest: boolean;
  is_respectful: boolean;
  is_helpful: boolean;
  is_calm: boolean;
  is_patient: boolean;
  is_clear_communication: boolean;
  created_at: string;
  reviewer_display_name: string | null;
}

interface ReviewsSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export function useShopReviews(shopId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewsSummary>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!shopId) {
      setIsLoading(false);
      return;
    }

    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('ratings')
          .select('id, star_rating, review_text, is_honest, is_respectful, is_helpful, is_calm, is_patient, is_clear_communication, created_at, reviewer_display_name')
          .eq('shop_id', shopId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const reviewsData = (data || []) as Review[];
        setReviews(reviewsData);

        // Calculate summary
        const reviewsWithStars = reviewsData.filter(r => r.star_rating !== null);
        const totalReviews = reviewsWithStars.length;
        
        if (totalReviews > 0) {
          const sum = reviewsWithStars.reduce((acc, r) => acc + (r.star_rating || 0), 0);
          const averageRating = Math.round((sum / totalReviews) * 10) / 10;
          
          const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          reviewsWithStars.forEach(r => {
            if (r.star_rating) distribution[r.star_rating]++;
          });

          setSummary({ averageRating, totalReviews, ratingDistribution: distribution });
        } else {
          setSummary({ averageRating: 0, totalReviews: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [shopId]);

  return { reviews, summary, isLoading };
}
