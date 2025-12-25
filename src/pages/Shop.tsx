import { useParams, useNavigate } from 'react-router-dom';
import { useShopById } from '@/hooks/useShops';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { useSavedShops } from '@/hooks/useSavedShops';
import { useInteractions } from '@/hooks/useInteractions';
import { Button } from '@/components/ui/button';
import MobileLayout from '@/components/MobileLayout';
import { 
  ArrowLeft, 
  Bookmark, 
  Share2, 
  MessageCircle, 
  Clock, 
  MapPin,
  Shield,
  AlertTriangle,
  Phone
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

  const handleWhatsAppClick = async () => {
    if (!shop) return;
    
    // Log interaction for rating eligibility
    if (user) {
      await logInteraction(shop.id, 'whatsapp_click');
    }
    
    const message = encodeURIComponent(`Hi! I found your shop on TrustLocal.`);
    const whatsappUrl = `https://wa.me/${shop.whatsapp_number.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = async () => {
    if (!shop) return;
    
    const url = window.location.href;
    const text = `Check out ${shop.name} on TrustLocal`;
    
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

  const handleReport = () => {
    navigate(`/report/${shopId}`);
  };

  if (shopLoading) {
    return (
      <MobileLayout>
        <div className="animate-pulse">
          <div className="h-48 bg-muted" />
          <div className="px-4 py-4 space-y-3">
            <div className="h-6 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!shop) {
    return (
      <MobileLayout>
        <div className="px-4 py-8 text-center">
          <p className="text-muted-foreground">Shop not found</p>
          <Button variant="outline" onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const isSaved = isShopSaved(shop.id);

  return (
    <MobileLayout>
      {/* Hero Image */}
      <div className="relative h-48 bg-muted">
        {shop.image_url ? (
          <img src={shop.image_url} alt={shop.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {shop.category?.icon || '🏪'}
          </div>
        )}
        
        {/* Overlay Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => toggleSave(shop.id)}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isSaved ? 'bg-primary text-primary-foreground' : 'bg-white/90'
              }`}
            >
              <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Availability Badge */}
        <div className="absolute bottom-4 left-4">
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              shop.availability_status === 'open'
                ? 'status-open'
                : shop.availability_status === 'closing_soon'
                ? 'status-closing'
                : 'status-closed'
            }`}
          >
            {shop.availability_status === 'open'
              ? '🟢 Open Now'
              : shop.availability_status === 'closing_soon'
              ? '🟡 Closing Soon'
              : '🔴 Closed'}
          </span>
        </div>
      </div>

      {/* Shop Info */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h1 className="font-display text-xl font-semibold text-foreground">{shop.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {shop.category?.name} · {shop.sub_category}
            </p>
          </div>
          
          {/* Trust Badge */}
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${
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

        {/* Location */}
        <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{shop.area}, {shop.city}</span>
        </div>

        {/* Verification badges */}
        {(shop.gst_number || shop.udyam_number) && (
          <div className="flex gap-2 mt-3">
            {shop.gst_number && (
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                GST Verified
              </span>
            )}
            {shop.udyam_number && (
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                Udyam Registered
              </span>
            )}
          </div>
        )}

        {/* Story */}
        {shop.story && (
          <p className="mt-4 text-sm text-foreground leading-relaxed">{shop.story}</p>
        )}
      </div>

      {/* Products Section */}
      <div className="px-4 py-4">
        <h2 className="font-display font-medium text-foreground mb-3">Products & Services</h2>
        
        {productsLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card-soft p-3 animate-pulse">
                <div className="h-24 bg-muted rounded-xl mb-2" />
                <div className="h-4 bg-muted rounded w-3/4 mb-1" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="card-soft p-6 text-center">
            <p className="text-muted-foreground text-sm">
              No products listed yet. Contact the shop for more details.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <div key={product.id} className="card-soft p-3">
                <div className="h-24 bg-muted rounded-xl mb-2 overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                  )}
                </div>
                <h3 className="font-medium text-sm text-foreground truncate">{product.name}</h3>
                <p className="text-xs text-primary font-medium mt-1">
                  {product.price_type === 'fixed' && product.price_fixed
                    ? `₹${product.price_fixed}`
                    : product.price_type === 'range' && product.price_min && product.price_max
                    ? `₹${product.price_min} - ₹${product.price_max}`
                    : product.price_type === 'discount' && product.price_original && product.price_discounted
                    ? (
                      <span>
                        <span className="line-through text-muted-foreground">₹{product.price_original}</span>
                        {' '}₹{product.price_discounted}
                      </span>
                    )
                    : 'Enquire'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Link */}
      <div className="px-4 pb-4">
        <button
          onClick={handleReport}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-calm"
        >
          <AlertTriangle className="h-4 w-4" />
          Report an issue
        </button>
      </div>

      {/* WhatsApp CTA */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <Button
          onClick={handleWhatsAppClick}
          className="w-full h-14 text-lg bg-[#25D366] hover:bg-[#128C7E] text-white"
        >
          <MessageCircle className="h-6 w-6 mr-2" />
          Chat on WhatsApp
        </Button>
      </div>
    </MobileLayout>
  );
};

export default Shop;
