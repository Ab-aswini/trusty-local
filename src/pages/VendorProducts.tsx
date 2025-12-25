import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useVendorShop } from '@/hooks/useVendorShop';
import { useVendorProducts } from '@/hooks/useVendorProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MobileLayout from '@/components/MobileLayout';
import ProductImageUpload from '@/components/ProductImageUpload';
import { ArrowLeft, Plus, Trash2, Edit, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Product } from '@/types/database';

const VendorProducts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shop } = useVendorShop();
  const { products, isLoading, createProduct, updateProduct, deleteProduct, refetch } = useVendorProducts(shop?.id);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_type: 'enquiry' as 'fixed' | 'range' | 'discount' | 'enquiry',
    price_fixed: '',
    price_min: '',
    price_max: '',
    price_original: '',
    price_discounted: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price_type: 'enquiry',
      price_fixed: '',
      price_min: '',
      price_max: '',
      price_original: '',
      price_discounted: '',
    });
    setEditingProduct(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price_type: product.price_type,
      price_fixed: product.price_fixed?.toString() || '',
      price_min: product.price_min?.toString() || '',
      price_max: product.price_max?.toString() || '',
      price_original: product.price_original?.toString() || '',
      price_discounted: product.price_discounted?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    
    if (!formData.name) {
      toast({ title: "Product name is required", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        price_type: formData.price_type,
        price_fixed: formData.price_fixed ? parseFloat(formData.price_fixed) : null,
        price_min: formData.price_min ? parseFloat(formData.price_min) : null,
        price_max: formData.price_max ? parseFloat(formData.price_max) : null,
        price_original: formData.price_original ? parseFloat(formData.price_original) : null,
        price_discounted: formData.price_discounted ? parseFloat(formData.price_discounted) : null,
        shop_id: shop.id,
      };
      
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast({ title: "Product updated!" });
      } else {
        await createProduct(productData);
        toast({ title: "Product added!" });
      }
      
      setIsDialogOpen(false);
      resetForm();
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Delete this product?')) return;
    
    try {
      await deleteProduct(productId);
      toast({ title: "Product deleted" });
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (!shop) {
    return (
      <MobileLayout>
        <div className="px-4 py-8 text-center">
          <p className="text-muted-foreground">Please create a shop first</p>
          <Button onClick={() => navigate('/vendor')} className="mt-4">
            Create Shop
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/vendor')} className="p-2 -ml-2 hover:bg-muted rounded-xl transition-calm">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-xl font-semibold text-foreground">
              Products
            </h1>
          </div>
          <Button size="sm" onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </header>

      <main className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card-soft p-4 animate-pulse flex gap-3">
                <div className="w-16 h-16 bg-muted rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="card-soft p-8 text-center">
            <p className="text-muted-foreground mb-4">No products yet</p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className="card-soft p-3 flex gap-3">
                <ProductImageUpload
                  productId={product.id}
                  currentImage={product.image_url}
                  productName={product.name}
                  onImageUpdated={() => refetch()}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{product.name}</h3>
                  <p className="text-xs text-primary font-medium">
                    {product.price_type === 'fixed' && product.price_fixed
                      ? `₹${product.price_fixed}`
                      : product.price_type === 'range'
                      ? `₹${product.price_min} - ₹${product.price_max}`
                      : product.price_type === 'discount'
                      ? `₹${product.price_discounted}`
                      : 'Enquire'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{product.description}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => openEditDialog(product)}
                    className="p-2 hover:bg-muted rounded-lg transition-calm"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-calm text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Studio Promo */}
        <button
          onClick={() => navigate('/vendor/ai-studio')}
          className="card-soft p-4 w-full mt-6 flex items-center gap-3 bg-primary/5 border-primary/10 hover:shadow-elevated transition-calm"
        >
          <Sparkles className="h-6 w-6 text-primary" />
          <div className="text-left">
            <p className="font-medium text-sm">Enhance with AI Studio</p>
            <p className="text-xs text-muted-foreground">Get professional photos & descriptions</p>
          </div>
        </button>
      </main>

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                placeholder="e.g., Basmati Rice (5kg)"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Price Type</Label>
              <Select
                value={formData.price_type}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, price_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enquiry">Enquire for Price</SelectItem>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="range">Price Range</SelectItem>
                  <SelectItem value="discount">Discounted Price</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.price_type === 'fixed' && (
              <div className="space-y-2">
                <Label htmlFor="priceFixed">Price (₹)</Label>
                <Input
                  id="priceFixed"
                  type="number"
                  placeholder="299"
                  value={formData.price_fixed}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_fixed: e.target.value }))}
                />
              </div>
            )}

            {formData.price_type === 'range' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="priceMin">Min (₹)</Label>
                  <Input
                    id="priceMin"
                    type="number"
                    placeholder="100"
                    value={formData.price_min}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_min: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceMax">Max (₹)</Label>
                  <Input
                    id="priceMax"
                    type="number"
                    placeholder="500"
                    value={formData.price_max}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_max: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {formData.price_type === 'discount' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="priceOriginal">Original (₹)</Label>
                  <Input
                    id="priceOriginal"
                    type="number"
                    placeholder="500"
                    value={formData.price_original}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_original: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceDiscounted">Discounted (₹)</Label>
                  <Input
                    id="priceDiscounted"
                    type="number"
                    placeholder="399"
                    value={formData.price_discounted}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_discounted: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingProduct ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default VendorProducts;
