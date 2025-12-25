import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useVendorShop } from '@/hooks/useVendorShop';
import { useVendorProducts } from '@/hooks/useVendorProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import MobileLayout from '@/components/MobileLayout';
import VendorPortfolioPreview from '@/components/VendorPortfolioPreview';
import SharePortfolio from '@/components/SharePortfolio';
import ShopImageUpload from '@/components/ShopImageUpload';
import { 
  ArrowLeft, 
  Store, 
  Clock, 
  Eye,
  Package,
  Sparkles,
  Share2,
  Camera,
  QrCode,
  ChevronRight,
  Star,
  Users,
  TrendingUp
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Vendor = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { shop, isLoading: shopLoading, createShop, updateShop, refetch } = useVendorShop();
  const { products, isLoading: productsLoading, refetch: refetchProducts } = useVendorProducts(shop?.id);
  
  const [isCreating, setIsCreating] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp_number: '',
    city: '',
    area: '',
    story: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (shop) {
      setFormData({
        name: shop.name,
        whatsapp_number: shop.whatsapp_number,
        city: shop.city,
        area: shop.area,
        story: shop.story || '',
      });
    }
  }, [shop]);

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.whatsapp_number || !formData.city || !formData.area) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createShop(formData);
      toast({ title: "Shop created!", description: "Your digital portfolio is ready." });
      setIsCreating(false);
      refetch();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create shop",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!shop) return;
    
    const newStatus = shop.availability_status === 'open' ? 'closed' : 'open';
    
    try {
      await updateShop({ availability_status: newStatus });
      toast({ title: newStatus === 'open' ? "You're now open!" : "Shop marked as closed" });
      refetch();
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  if (authLoading || shopLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </MobileLayout>
    );
  }

  // No shop yet - show create form
  if (!shop || isCreating) {
    return (
      <MobileLayout>
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
          <div className="px-4 py-4 flex items-center gap-3">
            <button onClick={() => shop ? setIsCreating(false) : navigate(-1)} className="p-2 -ml-2 hover:bg-muted rounded-xl transition-calm">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-xl font-semibold text-foreground">
              Create Your Digital Profile
            </h1>
          </div>
        </header>

        <main className="px-4 py-6">
          {/* Hero Section */}
          <div className="card-soft p-6 mb-6 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-amber-400 flex items-center justify-center">
                <Store className="h-7 w-7 text-amber-900" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-foreground">
                  Your Shop, Online
                </h2>
                <p className="text-sm text-muted-foreground">
                  Create a shareable digital portfolio
                </p>
              </div>
            </div>
            
            {/* Benefits */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="text-center p-2 bg-background/50 rounded-xl">
                <Camera className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">AI Photos</p>
              </div>
              <div className="text-center p-2 bg-background/50 rounded-xl">
                <QrCode className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">QR Share</p>
              </div>
              <div className="text-center p-2 bg-background/50 rounded-xl">
                <Star className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">Build Trust</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateShop} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Shop Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Sharma General Store"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number *</Label>
              <Input
                id="whatsapp"
                placeholder="+91 98765 43210"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                Customers will contact you on this number
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="e.g., Mumbai"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Area *</Label>
                <Input
                  id="area"
                  placeholder="e.g., Andheri West"
                  value={formData.area}
                  onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="story">About Your Shop (Optional)</Label>
              <Textarea
                id="story"
                placeholder="Tell customers what makes your shop special..."
                value={formData.story}
                onChange={(e) => setFormData(prev => ({ ...prev, story: e.target.value }))}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full h-14 text-lg" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create My Portfolio'}
            </Button>
          </form>
        </main>
      </MobileLayout>
    );
  }

  // Has shop - show portfolio dashboard
  return (
    <MobileLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/profile')} className="p-2 -ml-2 hover:bg-muted rounded-xl transition-calm">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-display text-lg font-semibold text-foreground">
                My Portfolio
              </h1>
              <p className="text-xs text-muted-foreground">{shop.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/shop/${shop.id}`)}
              className="p-2 hover:bg-muted rounded-xl transition-calm"
              aria-label="Preview"
            >
              <Eye className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsShareOpen(true)}
              className="p-2 hover:bg-muted rounded-xl transition-calm text-primary"
              aria-label="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 pb-24">
        {/* Shop Identity Card with Image Upload */}
        <div className="card-soft p-4">
          <div className="flex items-center gap-4 mb-4">
            <ShopImageUpload
              shopId={shop.id}
              currentImage={shop.image_url}
              shopName={shop.name}
              onImageUpdated={(url) => refetch()}
            />
            <div className="flex-1">
              <h2 className="font-display font-semibold text-foreground">{shop.name}</h2>
              <p className="text-sm text-muted-foreground">{shop.area}, {shop.city}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${
                  shop.vendor_status === 'approved' ? 'bg-green-500' : 
                  shop.vendor_status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
                <span className="text-xs text-muted-foreground capitalize">{shop.vendor_status}</span>
              </div>
            </div>
          </div>
          
          {/* Availability Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {shop.availability_status === 'open' ? 'Open for business' : 'Currently closed'}
              </span>
            </div>
            <Switch 
              checked={shop.availability_status === 'open'} 
              onCheckedChange={handleToggleAvailability}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card-soft p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">{shop.interaction_count}</span>
            </div>
            <p className="text-xs text-muted-foreground">Views</p>
          </div>
          <div className="card-soft p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="font-semibold text-foreground">{shop.positive_tag_count}</span>
            </div>
            <p className="text-xs text-muted-foreground">Ratings</p>
          </div>
          <div className="card-soft p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="font-semibold text-foreground capitalize">{shop.trust_state}</span>
            </div>
            <p className="text-xs text-muted-foreground">Trust</p>
          </div>
        </div>

        {/* Portfolio Preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-medium text-foreground">Your Portfolio</h2>
            <button 
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-1 text-sm text-primary"
            >
              <QrCode className="h-4 w-4" />
              Get QR
            </button>
          </div>
          
          <VendorPortfolioPreview shop={shop} products={products} />
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h2 className="font-display font-medium text-foreground">Manage</h2>
          
          {/* Add Products */}
          <button
            onClick={() => navigate('/vendor/products')}
            className="card-soft p-4 w-full flex items-center gap-3 hover:shadow-elevated transition-calm"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium text-foreground">Products & Services</h3>
              <p className="text-sm text-muted-foreground">
                {products.length > 0 
                  ? `${products.length} items • Add more`
                  : 'Add your first product'}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* AI Studio */}
          <button
            onClick={() => navigate('/vendor/ai-studio')}
            className="card-soft p-4 w-full flex items-center gap-3 hover:shadow-elevated transition-calm bg-gradient-to-r from-primary/5 to-transparent"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium text-foreground">AI Photo Studio</h3>
              <p className="text-sm text-muted-foreground">
                Enhance photos & generate descriptions
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Share Tips */}
        <div className="card-soft p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
              <Share2 className="h-5 w-5 text-amber-900" />
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Grow Your Reach</h3>
              <p className="text-sm text-muted-foreground">
                Share your portfolio QR on visiting cards, shop counter, and WhatsApp status to get more customers.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setIsShareOpen(true)}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Get Shareable QR
              </Button>
            </div>
          </div>
        </div>

        {/* Warning if any */}
        {shop.warning_level && (
          <div className="card-soft p-4 bg-destructive/10 border-destructive/20">
            <p className="text-sm font-medium text-destructive">
              Warning: {shop.warning_reason || 'Please review your shop activity'}
            </p>
          </div>
        )}
      </main>

      {/* Share Modal */}
      <SharePortfolio 
        shop={shop} 
        isOpen={isShareOpen} 
        onClose={() => setIsShareOpen(false)} 
      />
    </MobileLayout>
  );
};

export default Vendor;
