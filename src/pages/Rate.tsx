import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useShopById } from '@/hooks/useShops';
import { useInteractions } from '@/hooks/useInteractions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import MobileLayout from '@/components/MobileLayout';
import StarRating from '@/components/StarRating';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Blocked words for content moderation (no public shaming)
const BLOCKED_WORDS = [
  'fraud', 'fraudster', 'cheater', 'scam', 'scammer', 'liar', 'thief', 
  'cheat', 'fake', 'criminal', 'chor', 'dhokha', 'beiman'
];

const ratingTags = [
  { key: 'is_helpful', label: 'Helpful', emoji: '🤝', description: 'Assisted well with your needs' },
  { key: 'is_honest', label: 'Honest', emoji: '✅', description: 'Transparent about products & prices' },
  { key: 'is_respectful', label: 'Respectful', emoji: '🙏', description: 'Treated you with respect' },
  { key: 'is_calm', label: 'Calm', emoji: '😌', description: 'Patient and composed' },
  { key: 'is_patient', label: 'Patient', emoji: '⏳', description: 'Took time to explain' },
  { key: 'is_clear_communication', label: 'Clear', emoji: '💬', description: 'Easy to understand' },
];

const Rate = () => {
  const { interactionId } = useParams<{ interactionId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { pendingRatings, submitReview, isLoading } = useInteractions();
  
  const interaction = pendingRatings.find(i => i.id === interactionId);
  const { shop } = useShopById(interaction?.shop_id);
  
  const [starRating, setStarRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState({
    isHelpful: false,
    isHonest: false,
    isRespectful: false,
    isCalm: false,
    isPatient: false,
    isClearCommunication: false,
  });
  const [reviewText, setReviewText] = useState('');
  const [textError, setTextError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const tagKeyMap: Record<string, keyof typeof selectedTags> = {
    is_helpful: 'isHelpful',
    is_honest: 'isHonest',
    is_respectful: 'isRespectful',
    is_calm: 'isCalm',
    is_patient: 'isPatient',
    is_clear_communication: 'isClearCommunication',
  };

  const toggleTag = (key: string) => {
    const mappedKey = tagKeyMap[key];
    if (mappedKey) {
      setSelectedTags(prev => ({ ...prev, [mappedKey]: !prev[mappedKey] }));
    }
  };

  const isTagSelected = (key: string) => {
    const mappedKey = tagKeyMap[key];
    return mappedKey ? selectedTags[mappedKey] : false;
  };

  const validateText = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    for (const word of BLOCKED_WORDS) {
      if (lowerText.includes(word)) {
        setTextError(`Please focus on positive feedback. For concerns about "${word}", use the Report option instead.`);
        return false;
      }
    }
    setTextError('');
    return true;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 200) {
      setReviewText(text);
      validateText(text);
    }
  };

  const handleSubmit = async () => {
    if (!interaction) return;
    
    if (starRating === 0) {
      toast({
        title: "Please select a star rating",
        description: "Tap the stars to rate your experience",
        variant: "destructive",
      });
      return;
    }

    if (reviewText && !validateText(reviewText)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Anonymous';
      
      await submitReview(interaction.id, interaction.shop_id, {
        starRating,
        tags: selectedTags,
        reviewText: reviewText.trim() || undefined,
        reviewerDisplayName: displayName,
        source: interaction.interaction_type || 'whatsapp',
      });
      
      navigate('/');
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </MobileLayout>
    );
  }

  if (!interaction) {
    return (
      <MobileLayout>
        <div className="px-4 py-8 text-center">
          <p className="text-muted-foreground">Rating not found or expired</p>
          <Button variant="outline" onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-muted rounded-xl transition-calm">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-xl font-semibold text-foreground">
            Rate Your Experience
          </h1>
        </div>
      </header>

      <main className="px-4 py-6 pb-32">
        {/* Shop Info */}
        <div className="card-soft p-4 mb-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden">
            {shop?.image_url ? (
              <img src={shop.image_url} alt={shop.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl">🏪</div>
            )}
          </div>
          <div>
            <h2 className="font-display font-medium text-foreground">
              {shop?.name || 'Loading...'}
            </h2>
            <p className="text-sm text-muted-foreground">
              How was your interaction?
            </p>
          </div>
        </div>

        {/* Star Rating (Required) */}
        <div className="card-soft p-4 mb-6">
          <p className="text-sm font-medium text-foreground mb-3">Overall Rating *</p>
          <div className="flex justify-center">
            <StarRating rating={starRating} onRatingChange={setStarRating} size="lg" />
          </div>
          {starRating > 0 && (
            <p className="text-sm text-center text-muted-foreground mt-2">
              {starRating === 5 ? 'Excellent!' : starRating === 4 ? 'Great!' : starRating === 3 ? 'Good' : starRating === 2 ? 'Fair' : 'Poor'}
            </p>
          )}
        </div>

        {/* Behavior Tags */}
        <div className="space-y-3 mb-6">
          <p className="text-sm text-muted-foreground">
            Select qualities that describe your experience:
          </p>
          
          <div className="grid grid-cols-2 gap-2">
            {ratingTags.map((tag) => (
              <button
                key={tag.key}
                onClick={() => toggleTag(tag.key)}
                className={`card-soft p-3 flex items-center gap-2 transition-calm ${
                  isTagSelected(tag.key) 
                    ? 'border-2 border-primary bg-primary/5' 
                    : 'hover:shadow-elevated'
                }`}
              >
                <span className="text-lg">{tag.emoji}</span>
                <span className="text-sm font-medium text-foreground">{tag.label}</span>
                {isTagSelected(tag.key) && (
                  <Check className="h-4 w-4 text-primary ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Comment */}
        <div className="card-soft p-4 mb-6">
          <p className="text-sm font-medium text-foreground mb-2">
            Add a comment (optional)
          </p>
          <Textarea
            placeholder="Share your experience in a few words..."
            value={reviewText}
            onChange={handleTextChange}
            className="resize-none"
            rows={3}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {reviewText.length}/200
            </span>
            {textError && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {textError}
              </span>
            )}
          </div>
        </div>

        {/* Calm Reminder */}
        <div className="card-soft p-4 bg-primary/5 border-primary/10 mb-6">
          <p className="text-sm text-muted-foreground text-center">
            💚 Your honest feedback helps build trust in your local community
          </p>
        </div>

        {/* Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <div className="flex gap-3 max-w-lg mx-auto">
            <Button variant="outline" onClick={handleSkip} className="flex-1">
              Skip
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1" 
              disabled={isSubmitting || starRating === 0 || !!textError}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </main>
    </MobileLayout>
  );
};

export default Rate;
