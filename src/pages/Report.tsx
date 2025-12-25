import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useShopById } from '@/hooks/useShops';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import MobileLayout from '@/components/MobileLayout';
import { ArrowLeft, AlertTriangle, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const reportReasons = [
  { key: 'misleading_info', label: 'Misleading Information', description: 'Product or shop details are inaccurate' },
  { key: 'rude_behavior', label: 'Rude Behavior', description: 'Vendor was disrespectful or aggressive' },
  { key: 'fake_products', label: 'Fake Products', description: 'Products are counterfeit or not as described' },
  { key: 'scam', label: 'Suspected Scam', description: 'Vendor tried to cheat or defraud' },
  { key: 'closed_always', label: 'Always Closed', description: 'Shop shows open but is always closed' },
  { key: 'other', label: 'Other Issue', description: 'Something else not listed above' },
];

const Report = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shop, isLoading: shopLoading } = useShopById(shopId);
  
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason || !shopId) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          shop_id: shopId,
          reporter_id: user?.id || null,
          reason: selectedReason,
          details: details.trim() || null,
        });

      if (error) throw error;

      setIsSubmitted(true);
      toast({ title: "Report submitted" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit report",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (shopLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </MobileLayout>
    );
  }

  if (isSubmitted) {
    return (
      <MobileLayout>
        <div className="px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">
            Report Submitted
          </h2>
          <p className="text-muted-foreground mb-8">
            Thank you for helping keep TrustLocal safe. Our team will review this report.
          </p>
          <Button onClick={() => navigate('/')}>
            Back to Home
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
            Report Issue
          </h1>
        </div>
      </header>

      <main className="px-4 py-6">
        {/* Shop Info */}
        <div className="card-soft p-4 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h2 className="font-medium text-foreground">
              Reporting: {shop?.name || 'Shop'}
            </h2>
            <p className="text-xs text-muted-foreground">
              Your identity will not be shared
            </p>
          </div>
        </div>

        {/* Reason Selection */}
        <div className="space-y-2 mb-6">
          <p className="text-sm font-medium text-foreground mb-3">
            What's the issue?
          </p>
          
          {reportReasons.map((reason) => (
            <button
              key={reason.key}
              onClick={() => setSelectedReason(reason.key)}
              className={`card-soft p-4 w-full text-left transition-calm ${
                selectedReason === reason.key
                  ? 'border-2 border-destructive bg-destructive/5'
                  : 'hover:shadow-elevated'
              }`}
            >
              <p className="font-medium text-sm text-foreground">{reason.label}</p>
              <p className="text-xs text-muted-foreground">{reason.description}</p>
            </button>
          ))}
        </div>

        {/* Details */}
        <div className="space-y-2 mb-6">
          <label className="text-sm font-medium text-foreground">
            Additional Details (Optional)
          </label>
          <Textarea
            placeholder="Describe what happened..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
          />
        </div>

        {/* Privacy Note */}
        <div className="card-soft p-4 bg-muted/50 mb-6">
          <p className="text-xs text-muted-foreground">
            🔒 Your report is confidential. We will investigate and take appropriate action without revealing your identity.
          </p>
        </div>

        {/* Submit */}
        <Button 
          onClick={handleSubmit} 
          className="w-full"
          disabled={!selectedReason || isSubmitting}
          variant="destructive"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </Button>
      </main>
    </MobileLayout>
  );
};

export default Report;
