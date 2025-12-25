import StarRating from '@/components/StarRating';
import { formatDistanceToNow } from 'date-fns';
import { Shield, Heart, ThumbsUp, Smile, Clock, MessageCircle } from 'lucide-react';

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

interface ReviewsDisplayProps {
  reviews: Review[];
  summary: {
    averageRating: number;
    totalReviews: number;
  };
  isLoading: boolean;
}

const ReviewsDisplay = ({ reviews, summary, isLoading }: ReviewsDisplayProps) => {
  if (isLoading) {
    return (
      <div className="card-soft p-4 animate-pulse">
        <div className="h-20 bg-muted rounded" />
      </div>
    );
  }

  if (summary.totalReviews === 0) {
    return (
      <div className="card-soft p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground text-center">
          No reviews yet. Be the first to leave a review!
        </p>
      </div>
    );
  }

  const recentReviews = reviews.filter(r => r.star_rating !== null).slice(0, 5);

  const getTags = (review: Review) => {
    const tags = [];
    if (review.is_honest) tags.push({ label: 'Honest', icon: Shield });
    if (review.is_respectful) tags.push({ label: 'Respectful', icon: Heart });
    if (review.is_helpful) tags.push({ label: 'Helpful', icon: ThumbsUp });
    if (review.is_calm) tags.push({ label: 'Calm', icon: Smile });
    if (review.is_patient) tags.push({ label: 'Patient', icon: Clock });
    if (review.is_clear_communication) tags.push({ label: 'Clear', icon: MessageCircle });
    return tags;
  };

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="card-soft p-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-display font-semibold text-foreground">
              {summary.averageRating.toFixed(1)}
            </div>
            <StarRating rating={Math.round(summary.averageRating)} readonly size="sm" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {summary.totalReviews} {summary.totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      {recentReviews.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Recent Reviews</h3>
          {recentReviews.map((review) => (
            <div key={review.id} className="card-soft p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      {review.reviewer_display_name?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {review.reviewer_display_name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <StarRating rating={review.star_rating || 0} readonly size="sm" />
              </div>
              
              {/* Behavior Tags */}
              {getTags(review).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {getTags(review).map(({ label, icon: Icon }) => (
                    <span 
                      key={label}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      <Icon className="h-3 w-3" />
                      {label}
                    </span>
                  ))}
                </div>
              )}

              {/* Review Text */}
              {review.review_text && (
                <p className="text-sm text-muted-foreground">
                  "{review.review_text}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsDisplay;
