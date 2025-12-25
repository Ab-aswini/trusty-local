import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useVendorFeedback } from '@/hooks/useVendorFeedback';
import TrustBadge from '@/components/TrustBadge';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet';
import { 
  Users, 
  MessageCircle, 
  Check, 
  Smile, 
  Heart, 
  Clock,
  ChevronRight
} from 'lucide-react';

interface VendorCustomerFeedbackProps {
  shopId: string;
}

const feedbackTags = [
  { key: 'isCalm', label: 'Calm', emoji: '😌', icon: Smile, description: 'Patient and composed' },
  { key: 'isRespectful', label: 'Respectful', emoji: '🙏', icon: Heart, description: 'Polite and courteous' },
  { key: 'isPunctual', label: 'Punctual', emoji: '⏰', icon: Clock, description: 'On time' },
];

const VendorCustomerFeedback = ({ shopId }: VendorCustomerFeedbackProps) => {
  const { recentInteractions, isLoading, submitFeedback } = useVendorFeedback(shopId);
  const [selectedInteraction, setSelectedInteraction] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState({
    isCalm: false,
    isRespectful: false,
    isPunctual: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eligibleInteractions = recentInteractions.filter(
    i => !i.vendor_has_rated && i.has_rated_vendor
  );

  const selectedInteractionData = recentInteractions.find(i => i.id === selectedInteraction);

  const toggleTag = (key: keyof typeof selectedTags) => {
    setSelectedTags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    if (!selectedInteraction || !selectedInteractionData) return;
    
    setIsSubmitting(true);
    const success = await submitFeedback(
      selectedInteraction,
      selectedInteractionData.consumer_id,
      selectedTags
    );
    
    if (success) {
      setSelectedInteraction(null);
      setSelectedTags({ isCalm: false, isRespectful: false, isPunctual: false });
    }
    setIsSubmitting(false);
  };

  const getDisplayName = (interaction: typeof recentInteractions[0]) => {
    if (interaction.consumer_display_name) {
      // Show only first name or initial for privacy
      const firstName = interaction.consumer_display_name.split(' ')[0];
      return firstName.length > 10 ? firstName.substring(0, 10) + '...' : firstName;
    }
    return 'Customer';
  };

  if (isLoading) {
    return (
      <div className="card-soft p-4 animate-pulse">
        <div className="h-16 bg-muted rounded" />
      </div>
    );
  }

  if (eligibleInteractions.length === 0) {
    return (
      <div className="card-soft p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium text-sm text-foreground">Customer Feedback</h3>
            <p className="text-xs text-muted-foreground">No pending feedback</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          When customers rate you, you can provide feedback on their behavior here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="card-soft p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-medium text-foreground">Rate Customers</h3>
          </div>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {eligibleInteractions.length} pending
          </span>
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          Customers who rated you can receive positive behavior feedback
        </p>

        <div className="space-y-2">
          {eligibleInteractions.slice(0, 3).map((interaction) => (
            <button
              key={interaction.id}
              onClick={() => setSelectedInteraction(interaction.id)}
              className="w-full flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-calm"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {getDisplayName(interaction)[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {getDisplayName(interaction)}
                  </p>
                  {interaction.consumer_trust_level && (
                    <TrustBadge level={interaction.consumer_trust_level} size="sm" showLabel={false} />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(interaction.created_at), { addSuffix: true })}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Sheet */}
      <Sheet open={!!selectedInteraction} onOpenChange={() => setSelectedInteraction(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader className="text-left">
            <SheetTitle>Rate Customer Behavior</SheetTitle>
            <SheetDescription>
              Only positive feedback is shared. This helps build trust in the community.
            </SheetDescription>
          </SheetHeader>

          {selectedInteractionData && (
            <div className="py-6 space-y-6">
              {/* Customer Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-medium text-primary">
                    {getDisplayName(selectedInteractionData)[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {getDisplayName(selectedInteractionData)}
                  </p>
                  {selectedInteractionData.consumer_trust_level && (
                    <TrustBadge level={selectedInteractionData.consumer_trust_level} size="sm" />
                  )}
                </div>
              </div>

              {/* Feedback Tags */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Select qualities that describe this customer:
                </p>
                {feedbackTags.map((tag) => (
                  <button
                    key={tag.key}
                    onClick={() => toggleTag(tag.key as keyof typeof selectedTags)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-calm ${
                      selectedTags[tag.key as keyof typeof selectedTags]
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-muted/50 border-2 border-transparent'
                    }`}
                  >
                    <span className="text-2xl">{tag.emoji}</span>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">{tag.label}</p>
                      <p className="text-xs text-muted-foreground">{tag.description}</p>
                    </div>
                    {selectedTags[tag.key as keyof typeof selectedTags] && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>

              {/* Privacy Note */}
              <div className="p-3 bg-muted/50 rounded-xl">
                <p className="text-xs text-muted-foreground text-center">
                  🔒 Customer identity remains private. Only positive behavior contributes to their trust score.
                </p>
              </div>

              {/* Submit */}
              <Button 
                onClick={handleSubmit} 
                className="w-full" 
                disabled={isSubmitting || !Object.values(selectedTags).some(Boolean)}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default VendorCustomerFeedback;
