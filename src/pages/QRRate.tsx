import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useShopById } from '@/hooks/useShops';
import { supabase } from '@/integrations/supabase/client';
import MobileLayout from '@/components/MobileLayout';
import { Button } from '@/components/ui/button';
import { Star, Store, ArrowRight, LogIn } from 'lucide-react';

const QRRate = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { shop, isLoading: shopLoading } = useShopById(shopId);
  const [isCreatingInteraction, setIsCreatingInteraction] = useState(false);

  const handleStartRating = async () => {
    if (!user || !shop) return;

    setIsCreatingInteraction(true);
    try {
      // Create a QR-based interaction
      const { data, error } = await supabase
        .from('interactions')
        .insert({
          consumer_id: user.id,
          shop_id: shop.id,
          interaction_type: 'qr_scan',
        })
        .select()
        .single();

      if (error) throw error;

      // Navigate to the rating page
      navigate(`/rate/${data.id}`);
    } catch (err) {
      console.error('Error creating interaction:', err);
      // If interaction already exists, try to find it
      const { data: existing } = await supabase
        .from('interactions')
        .select('id')
        .eq('consumer_id', user.id)
        .eq('shop_id', shop.id)
        .eq('rated', false)
        .gt('rating_expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        navigate(`/rate/${existing.id}`);
      } else {
        navigate(`/shop/${shop.id}`);
      }
    } finally {
      setIsCreatingInteraction(false);
    }
  };

  if (authLoading || shopLoading) {
    return (
      <MobileLayout showNav={false}>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </MobileLayout>
    );
  }

  if (!shop) {
    return (
      <MobileLayout showNav={false}>
        <div className="px-4 py-8 text-center">
          <p className="text-muted-foreground">Shop not found</p>
          <Button variant="outline" onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showNav={false}>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Shop Card */}
        <div className="card-soft p-6 w-full max-w-sm text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-muted overflow-hidden mx-auto mb-4">
            {shop.image_url ? (
              <img src={shop.image_url} alt={shop.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">
                {shop.category?.icon || '🏪'}
              </div>
            )}
          </div>
          <h1 className="font-display text-xl font-semibold text-foreground mb-1">
            {shop.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {shop.area}, {shop.city}
          </p>
        </div>

        {/* Action Card */}
        <div className="card-soft p-6 w-full max-w-sm bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
            <h2 className="font-display text-lg font-semibold text-foreground">
              Rate Your Experience
            </h2>
          </div>
          
          <p className="text-sm text-muted-foreground text-center mb-6">
            Help build trust in your community by sharing your feedback about this shop.
          </p>

          {user ? (
            <Button 
              onClick={handleStartRating} 
              className="w-full h-12 text-base"
              disabled={isCreatingInteraction}
            >
              {isCreatingInteraction ? (
                'Starting...'
              ) : (
                <>
                  Start Rating
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/auth', { state: { returnTo: `/qr/${shopId}` } })} 
                className="w-full h-12 text-base"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Sign In to Rate
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Sign in to share your feedback
              </p>
            </div>
          )}
        </div>

        {/* View Shop Link */}
        <button
          onClick={() => navigate(`/shop/${shop.id}`)}
          className="mt-6 text-sm text-primary flex items-center gap-1"
        >
          <Store className="h-4 w-4" />
          View Shop Profile
        </button>

        {/* Trust Note */}
        <p className="text-xs text-muted-foreground text-center mt-8 max-w-sm">
          💚 Your feedback is anonymous and helps build trust in your local community
        </p>
      </div>
    </MobileLayout>
  );
};

export default QRRate;
