import { useState, useRef, useCallback } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import MobileLayout from '@/components/MobileLayout';
import ProductMultiImageUpload from '@/components/ProductMultiImageUpload';
import BulkProductImport from '@/components/BulkProductImport';
import ProductImageCarousel from '@/components/ProductImageCarousel';
import PullToRefresh from '@/components/PullToRefresh';
import { ArrowLeft, Plus, Trash2, Edit, Sparkles, Images, Camera, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
  const [imageDialogProduct, setImageDialogProduct] = useState<Product | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
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
      category: '',
      price_type: 'enquiry',
      price_fixed: '',
      price_min: '',
      price_max: '',
      price_original: '',
      price_discounted: '',
    });
    setSelectedImages([]);
    setImagePreviews([]);
    setEditingProduct(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: `${file.name} is too large (max 5MB)`, variant: "destructive" });
        continue;
      }
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setSelectedImages(prev => [...prev, ...newFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
      category: product.category || '',
      price_type: product.price_type,
      price_fixed: product.price_fixed?.toString() || '',
      price_min: product.price_min?.toString() || '',
      price_max: product.price_max?.toString() || '',
      price_original: product.price_original?.toString() || '',
      price_discounted: product.price_discounted?.toString() || '',
    });
    setSelectedImages([]);
    setImagePreviews([]);
    setIsDialogOpen(true);
  };

  const uploadProductImages = async (productId: string) => {
    for (let i = 0; i < selectedImages.length; i++) {
      const file = selectedImages[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}-${Date.now()}-${i}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('shop-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('shop-images')
        .getPublicUrl(filePath);

      const isPrimary = i === 0;

      await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          image_url: publicUrl,
          display_order: i,
          is_primary: isPrimary,
        });

      // Set main product image
      if (isPrimary) {
        await supabase
          .from('products')
          .update({ image_url: publicUrl })
          .eq('id', productId);
      }
    }
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
        category: formData.category || null,
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
        const newProduct = await createProduct(productData);
        
        // Upload images if any
        if (selectedImages.length > 0 && newProduct?.id) {
          await uploadProductImages(newProduct.id);
        }
        
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

  const handleRefresh = useCallback(async () => {
    await refetch();
    toast({ title: "Refreshed!", variant: "default" });
  }, [refetch]);

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
          <div className="flex items-center gap-2">
            <BulkProductImport shopId={shop.id} onImportComplete={refetch} />
            <Button size="sm" onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </header>

      <PullToRefresh onRefresh={handleRefresh} className="flex-1">
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
                <button 
                  onClick={() => setImageDialogProduct(product)}
                  className="relative w-16 h-16 bg-muted rounded-xl overflow-hidden flex-shrink-0 group"
                >
                  <ProductImageCarousel
                    productId={product.id}
                    fallbackImage={product.image_url}
                    className="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-calm flex items-center justify-center">
                    <Images className="h-4 w-4 text-white" />
                  </div>
                </button>
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
                    onClick={() => setImageDialogProduct(product)}
                    className="p-2 hover:bg-muted rounded-lg transition-calm"
                    title="Manage images"
                  >
                    <Images className="h-4 w-4" />
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
      </PullToRefresh>

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload Section - Only show for new products */}
            {!editingProduct && (
              <div className="space-y-2">
                <Label>Product Images</Label>
                <div className="flex flex-wrap gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-[8px] text-center py-0.5">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-calm"
                  >
                    <Camera className="h-5 w-5" />
                    <span className="text-[9px]">Add</span>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">First image will be the main photo</p>
              </div>
            )}

            {/* For editing, show link to manage images */}
            {editingProduct && (
              <div className="space-y-2">
                <Label>Product Images</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setImageDialogProduct(editingProduct);
                  }}
                >
                  <Images className="h-4 w-4" />
                  Manage Images
                </Button>
              </div>
            )}

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
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Rice, Pulses, Spices"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
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

      {/* Image Management Dialog */}
      <Dialog open={!!imageDialogProduct} onOpenChange={(open) => !open && setImageDialogProduct(null)}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Images className="h-5 w-5" />
              {imageDialogProduct?.name} - Images
            </DialogTitle>
          </DialogHeader>
          
          {imageDialogProduct && (
            <ScrollArea className="max-h-[60vh]">
              <ProductMultiImageUpload
                productId={imageDialogProduct.id}
                onImagesUpdated={() => refetch()}
              />
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default VendorProducts;
