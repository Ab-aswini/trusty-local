import { Heart, ThumbsUp, Smile, Shield } from 'lucide-react';

interface RatingsSummaryProps {
  summary: {
    totalRatings: number;
    honestCount: number;
    respectfulCount: number;
    helpfulCount: number;
    calmCount: number;
    positivePercentage: number;
  };
  interactionCount: number;
}

const RatingsSummary = ({ summary, interactionCount }: RatingsSummaryProps) => {
  if (summary.totalRatings === 0) {
    return (
      <div className="card-soft p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground text-center">
          No ratings yet. Be the first to rate after visiting!
        </p>
      </div>
    );
  }

  const tags = [
    { 
      key: 'honest', 
      label: 'Honest', 
      count: summary.honestCount, 
      icon: Shield,
      color: 'text-emerald-600 bg-emerald-100'
    },
    { 
      key: 'respectful', 
      label: 'Respectful', 
      count: summary.respectfulCount, 
      icon: Heart,
      color: 'text-pink-600 bg-pink-100'
    },
    { 
      key: 'helpful', 
      label: 'Helpful', 
      count: summary.helpfulCount, 
      icon: ThumbsUp,
      color: 'text-blue-600 bg-blue-100'
    },
    { 
      key: 'calm', 
      label: 'Calm', 
      count: summary.calmCount, 
      icon: Smile,
      color: 'text-amber-600 bg-amber-100'
    },
  ];

  return (
    <div className="card-soft p-4">
      {/* Overall Score */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-semibold text-primary">
              {summary.positivePercentage}%
            </span>
            <span className="text-sm text-muted-foreground">positive</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on {summary.totalRatings} {summary.totalRatings === 1 ? 'rating' : 'ratings'} from {interactionCount} interactions
          </p>
        </div>
        
        {/* Circular Progress */}
        <div className="relative w-16 h-16">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              className="stroke-muted"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              className="stroke-primary"
              strokeWidth="3"
              strokeDasharray={`${summary.positivePercentage} 100`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-foreground">
            {summary.positivePercentage}%
          </span>
        </div>
      </div>

      {/* Tag Breakdown */}
      <div className="grid grid-cols-2 gap-2">
        {tags.map(({ key, label, count, icon: Icon, color }) => (
          <div 
            key={key}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl ${color.split(' ')[1]}`}
          >
            <Icon className={`h-4 w-4 ${color.split(' ')[0]}`} />
            <span className={`text-sm font-medium ${color.split(' ')[0]}`}>
              {label}
            </span>
            <span className={`ml-auto text-sm font-semibold ${color.split(' ')[0]}`}>
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingsSummary;
