import { Star, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePendingRatings } from '@/hooks/usePendingRatings';
import { useState } from 'react';

const PendingRatingsBanner = () => {
  const navigate = useNavigate();
  const { pendingRatings, isLoading, count } = usePendingRatings();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isLoading || count === 0 || isDismissed) {
    return null;
  }

  const firstPending = pendingRatings[0];
  const timeLeft = firstPending 
    ? Math.ceil((new Date(firstPending.rating_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border-b border-accent/20">
      <div className="container py-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <Star className="h-5 w-5 text-accent" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              {count === 1 ? 'Rate your recent visit' : `${count} shops to rate`}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {firstPending?.shop?.name && (
                <>
                  {firstPending.shop.name}
                  {count > 1 && ` + ${count - 1} more`}
                  {timeLeft > 0 && ` · ${timeLeft}d left`}
                </>
              )}
            </p>
          </div>

          <button
            onClick={() => navigate(`/rate/${firstPending.id}`)}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-accent text-accent-foreground rounded-full text-sm font-medium hover:bg-accent/90 transition-calm"
          >
            Rate
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="flex-shrink-0 p-1 hover:bg-muted rounded-full transition-calm"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingRatingsBanner;
