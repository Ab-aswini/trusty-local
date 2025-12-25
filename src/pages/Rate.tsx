import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useShopById } from '@/hooks/useShops';
import { useInteractions } from '@/hooks/useInteractions';
import { Button } from '@/components/ui/button';
import MobileLayout from '@/components/MobileLayout';
import { ArrowLeft, Star, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ratingTags = [
  { key: 'is_helpful', label: 'Helpful', emoji: '🤝', description: 'Assisted well with your needs' },
  { key: 'is_honest', label: 'Honest', emoji: '✅', description: 'Transparent about products & prices' },
  { key: 'is_respectful', label: 'Respectful', emoji: '🙏', description: 'Treated you with respect' },
  { key: 'is_calm', label: 'Calm', emoji: '😌', description: 'Patient and composed' },
];

const Rate = () => {
  const { interactionId } = useParams<{ interactionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pendingRatings, submitRating, isLoading } = useInteractions();
  
  const interaction = pendingRatings.find(i => i.id === interactionId);
  const { shop } = useShopById(interaction?.shop_id);
  
  const [selectedTags, setSelectedTags] = useState({
    isHelpful: false,
    isHonest: false,
    isRespectful: false,
    isCalm: false,
  });
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

  const handleSubmit = async () => {
    if (!interaction) return;
    
    setIsSubmitting(true);
    
    try {
      await submitRating(interaction.id, interaction.shop_id, selectedTags);
      toast({ title: "Thank you for your feedback!" });
      navigate('/');
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit rating",
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

      <main className="px-4 py-6">
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

        {/* Rating Tags */}
        <div className="space-y-3 mb-8">
          <p className="text-sm text-muted-foreground mb-4">
            Tap the qualities that describe your experience (you can select multiple):
          </p>
          
          {ratingTags.map((tag) => (
            <button
              key={tag.key}
              onClick={() => toggleTag(tag.key)}
              className={`card-soft p-4 w-full flex items-center gap-4 transition-calm ${
                isTagSelected(tag.key) 
                  ? 'border-2 border-primary bg-primary/5' 
                  : 'hover:shadow-elevated'
              }`}
            >
              <span className="text-2xl">{tag.emoji}</span>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">{tag.label}</p>
                <p className="text-xs text-muted-foreground">{tag.description}</p>
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isTagSelected(tag.key)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}>
                {isTagSelected(tag.key) && <Check className="h-4 w-4" />}
              </div>
            </button>
          ))}
        </div>

        {/* Calm Reminder */}
        <div className="card-soft p-4 bg-primary/5 border-primary/10 mb-6">
          <p className="text-sm text-muted-foreground text-center">
            💚 Your honest feedback helps build trust in your local community
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSkip} className="flex-1">
            Skip
          </Button>
          <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </main>
    </MobileLayout>
  );
};

export default Rate;
