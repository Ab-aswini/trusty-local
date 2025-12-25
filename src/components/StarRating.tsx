import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating = ({ rating, onRatingChange, readonly = false, size = 'md' }: StarRatingProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const gapClasses = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5',
  };

  return (
    <div className={`flex items-center ${gapClasses[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRatingChange?.(star)}
          className={`transition-transform ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'}`}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'fill-muted text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
