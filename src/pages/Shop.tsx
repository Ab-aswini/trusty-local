import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShopById } from '@/hooks/useShops';
import { useProducts } from '@/hooks/useVendorProducts';
import { useAuth } from '@/hooks/useAuth';
import { useSavedShops } from '@/hooks/useSavedShops';
import { useInteractions } from '@/hooks/useInteractions';
import { useShopRatings } from '@/hooks/useShopRatings';
import { useShopReviews } from '@/hooks/useShopReviews';
import { Button } from '@/components/ui/button';
import MobileLayout from '@/components/MobileLayout';
import ProductGallery from '@/components/ProductGallery';
import RatingsSummary from '@/components/RatingsSummary';
import ReviewsDisplay from '@/components/ReviewsDisplay';
import { 
  ArrowLeft, 
  Bookmark, 
  Share2, 
  MessageCircle, 
  MapPin,
  Shield,
  AlertTriangle,
  Phone,
  CheckCircle,
  ExternalLink,
  Instagram,
  Facebook
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Shop = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shop, isLoading: shopLoading } = useShopById(shopId);
  const { products, isLoading: productsLoading } = useProducts(shopId);
  const { isShopSaved, toggleSave } = useSavedShops();
  const { logInteraction } = useInteractions();
  const { summary: ratingsSummary, isLoading: ratingsLoading } = useShopRatings(shopId);
  const { reviews, summary: reviewsSummary, isLoading: reviewsLoading } = useShopReviews(shopId);
  const viewLoggedRef = useRef(false);

  // Log view interaction once per page load
  useEffect(() => {
    if (shop && user && !viewLoggedRef.current) {
      viewLoggedRef.current = true;
      logInteraction(shop.id, 'view');
    }
  }, [shop, user, logInteraction]);

  const handleWhatsAppClick = async () => {
    if (!shop) return;
    
    // Log interaction for rating eligibility
    if (user) {
      await logInteraction(shop.id, 'whatsapp_click');
    }
    
    const message = encodeURIComponent(`Hi! I found your shop "${shop.name}" on TrustLocal and I'm interested in your products.`);
    const whatsappUrl = `https://wa.me/${shop.whatsapp_number.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = async () => {
    if (!shop) return;
    
    const url = window.location.href;
    const text = `Check out ${shop.name} on TrustLocal - ${shop.category?.name} in ${shop.area}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: shop.name, text, url });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  const handleSave = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    toggleSave(shop!.id);
  };

  const handleReport = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate(`/report/${shopId}`);
  };

  if (shopLoading) {
    return (
      <MobileLayout showNav={false}>
        <div className="animate-pulse">
          <div className="h-56 bg-muted" />
          <div className="px-4 py-4 space-y-3">
            <div className="h-6 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!shop) {
    return (
      <MobileLayout showNav={false}>
        <div className="px-4 py-8 text-center">
          <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="font-display text-lg font-medium text-foreground mb-2">Shop not found</h2>
          <p className="text-muted-foreground text-sm mb-4">This shop may have been removed or doesn't exist.</p>
          <Button variant="outline" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const isSaved = isShopSaved(shop.id);

  return (
    <MobileLayout showNav={false}>
      {/* Hero Image */}
      <div className="relative h-56 bg-muted">
        {shop.image_url ? (
          <img src={shop.image_url} alt={shop.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
            <span className="text-7xl">{shop.category?.icon || '🏪'}</span>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />
        
        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-calm"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className={`w-10 h-10 rounded-full backdrop-blur flex items-center justify-center shadow-lg transition-calm ${
                isSaved 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-white/90 hover:bg-white'
              }`}
            >
              <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-calm"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Shop Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between gap-3">
            <div className="flex-1">
              <h1 className="font-display text-2xl font-semibold text-white drop-shadow-lg">{shop.name}</h1>
              <p className="text-white/80 text-sm mt-1">
                {shop.category?.icon} {shop.category?.name} {shop.sub_category && `· ${shop.sub_category}`}
                {shop.established_year && ` · Since ${shop.established_year}`}
              </p>
            </div>
            
            {/* Availability Badge */}
            <span
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur ${
                shop.availability_status === 'open'
                  ? 'bg-[hsl(var(--status-open))]/90 text-white'
                  : shop.availability_status === 'closing_soon'
                  ? 'bg-[hsl(var(--status-closing))]/90 text-foreground'
                  : 'bg-[hsl(var(--status-closed))]/90 text-white'
              }`}
            >
              {shop.availability_status === 'open'
                ? '● Open'
                : shop.availability_status === 'closing_soon'
                ? 'Closing Soon'
                : 'Closed'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Info Bar */}
      <div className="px-4 py-3 bg-muted/50 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{shop.area}, {shop.city}</span>
        </div>
        
        {/* Trust Badge */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
            shop.trust_state === 'trusted'
              ? 'trust-badge-trusted'
              : shop.trust_state === 'reliable'
              ? 'trust-badge-reliable'
              : shop.trust_state === 'active'
              ? 'trust-badge-active'
              : 'trust-badge-new'
          }`}
        >
          <Shield className="h-3 w-3" />
          {shop.trust_state === 'trusted'
            ? 'Trusted'
            : shop.trust_state === 'reliable'
            ? 'Reliable'
            : shop.trust_state === 'active'
            ? 'Active'
            : 'New'}
        </div>
      </div>

      <div className="px-4 py-4 space-y-6 pb-32">
        {/* Verification badges */}
        {(shop.gst_number || shop.udyam_number) && (
          <div className="flex gap-2 flex-wrap">
            {shop.gst_number && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                <CheckCircle className="h-3 w-3" />
                GST Verified
              </span>
            )}
            {shop.udyam_number && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                <CheckCircle className="h-3 w-3" />
                Udyam Registered
              </span>
            )}
          </div>
        )}

        {/* Story */}
        {shop.story && (
          <div className="card-soft p-4">
            <h2 className="font-display font-medium text-foreground mb-2">About</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{shop.story}</p>
          </div>
        )}

        {/* Ratings Summary */}
        <div>
          <h2 className="font-display font-medium text-foreground mb-3">Community Ratings</h2>
          {ratingsLoading ? (
            <div className="card-soft p-4 animate-pulse">
              <div className="h-16 bg-muted rounded" />
            </div>
          ) : (
            <RatingsSummary summary={ratingsSummary} interactionCount={shop.interaction_count} />
          )}
        </div>

        {/* Reviews Section */}
        <div>
          <h2 className="font-display font-medium text-foreground mb-3">Customer Reviews</h2>
          <ReviewsDisplay 
            reviews={reviews} 
            summary={reviewsSummary} 
            isLoading={reviewsLoading} 
          />
        </div>

        {/* Products Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-medium text-foreground">Products & Services</h2>
            {products.length > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {products.length} items
              </span>
            )}
          </div>
          
          {productsLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card-soft overflow-hidden animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ProductGallery 
              products={products} 
              shopName={shop.name}
              whatsappNumber={shop.whatsapp_number}
            />
          )}
        </div>

        {/* Contact & Social Links */}
        <div className="card-soft p-4">
          <h2 className="font-display font-medium text-foreground mb-3">Contact</h2>
          
          {/* WhatsApp */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center">
              <Phone className="h-5 w-5 text-[#25D366]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{shop.whatsapp_number}</p>
              <p className="text-xs text-muted-foreground">WhatsApp available</p>
            </div>
          </div>

          {/* Social Links */}
          {(shop.instagram_url || shop.facebook_url || shop.google_maps_url) && (
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3">Follow & Find Us</p>
              <div className="flex gap-2">
                {shop.instagram_url && (
                  <a
                    href={shop.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    <Instagram className="h-5 w-5 text-white" />
                  </a>
                )}
                {shop.facebook_url && (
                  <a
                    href={shop.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    <Facebook className="h-5 w-5 text-white" />
                  </a>
                )}
                {shop.google_maps_url && (
                  <a
                    href={shop.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    <MapPin className="h-5 w-5 text-white" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Report Link */}
        <button
          onClick={handleReport}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-calm py-2"
        >
          <AlertTriangle className="h-4 w-4" />
          Report an issue with this shop
        </button>
      </div>

      {/* WhatsApp CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <Button
          onClick={handleWhatsAppClick}
          className="w-full h-14 text-lg bg-[#25D366] hover:bg-[#128C7E] text-white shadow-xl"
        >
          <MessageCircle className="h-6 w-6 mr-2" />
          Chat on WhatsApp
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          You can rate this shop after your interaction
        </p>
      </div>
    </MobileLayout>
  );
};

export default Shop;