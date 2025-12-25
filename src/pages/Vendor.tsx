import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useVendorShop } from '@/hooks/useVendorShop';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import MobileLayout from '@/components/MobileLayout';
import { 
  ArrowLeft, 
  Store, 
  Plus, 
  Camera, 
  Clock, 
  Eye,
  Settings,
  Package,
  Sparkles
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Vendor = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { shop, isLoading: shopLoading, createShop, updateShop, refetch } = useVendorShop();
  
  const [isCreating, setIsCreating] = useState(false);
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
      toast({ title: "Shop created!", description: "Your shop is pending approval." });
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
              Create Your Shop
            </h1>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="card-soft p-6 mb-6 bg-primary/5 border-primary/10">
            <Store className="h-8 w-8 text-primary mb-3" />
            <h2 className="font-display font-medium text-foreground mb-2">
              Start Your Digital Presence
            </h2>
            <p className="text-sm text-muted-foreground">
              List your shop, add products with AI-enhanced photos, and connect with local customers.
            </p>
          </div>

          <form onSubmit={handleCreateShop} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Shop Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Sharma General Store"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number *</Label>
              <Input
                id="whatsapp"
                placeholder="+91 98765 43210"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="e.g., Mumbai"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Area *</Label>
                <Input
                  id="area"
                  placeholder="e.g., Andheri West"
                  value={formData.area}
                  onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
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

            <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Shop'}
            </Button>
          </form>
        </main>
      </MobileLayout>
    );
  }

  // Has shop - show dashboard
  return (
    <MobileLayout>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/profile')} className="p-2 -ml-2 hover:bg-muted rounded-xl transition-calm">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-xl font-semibold text-foreground">
              My Shop
            </h1>
          </div>
          <button
            onClick={() => navigate(`/shop/${shop.id}`)}
            className="p-2 hover:bg-muted rounded-xl transition-calm"
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {/* Shop Status Card */}
        <div className="card-soft p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden">
                {shop.image_url ? (
                  <img src={shop.image_url} alt={shop.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🏪</div>
                )}
              </div>
              <div>
                <h2 className="font-display font-medium text-foreground">{shop.name}</h2>
                <p className="text-xs text-muted-foreground">{shop.area}, {shop.city}</p>
              </div>
            </div>
            
            {/* Vendor Status Badge */}
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
              shop.vendor_status === 'approved' 
                ? 'bg-green-100 text-green-700' 
                : shop.vendor_status === 'pending'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {shop.vendor_status}
            </span>
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
          <div className="card-soft p-4 text-center">
            <p className="text-2xl font-display font-semibold text-primary">
              {shop.interaction_count}
            </p>
            <p className="text-xs text-muted-foreground">Interactions</p>
          </div>
          <div className="card-soft p-4 text-center">
            <p className="text-2xl font-display font-semibold text-primary">
              {shop.positive_tag_count}
            </p>
            <p className="text-xs text-muted-foreground">Positive Tags</p>
          </div>
          <div className="card-soft p-4 text-center">
            <p className="text-lg font-display font-semibold text-primary capitalize">
              {shop.trust_state}
            </p>
            <p className="text-xs text-muted-foreground">Trust Level</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <button
            onClick={() => navigate('/vendor/products')}
            className="card-soft p-4 w-full flex items-center gap-3 hover:shadow-elevated transition-calm"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium text-sm">Manage Products</h3>
              <p className="text-xs text-muted-foreground">Add, edit, or remove products</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/vendor/ai-studio')}
            className="card-soft p-4 w-full flex items-center gap-3 hover:shadow-elevated transition-calm"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium text-sm">AI Studio</h3>
              <p className="text-xs text-muted-foreground">Enhance product photos & descriptions</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/vendor/settings')}
            className="card-soft p-4 w-full flex items-center gap-3 hover:shadow-elevated transition-calm"
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium text-sm">Shop Settings</h3>
              <p className="text-xs text-muted-foreground">Update shop details & verification</p>
            </div>
          </button>
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
    </MobileLayout>
  );
};

export default Vendor;
