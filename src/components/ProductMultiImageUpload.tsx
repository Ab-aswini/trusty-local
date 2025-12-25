import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Plus, X, Star, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
}

interface ProductMultiImageUploadProps {
  productId: string;
  onImagesUpdated?: () => void;
}

const ProductMultiImageUpload = ({ productId, onImagesUpdated }: ProductMultiImageUploadProps) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (err) {
      console.error('Error fetching images:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [productId]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        toast({ title: `${file.name} is not an image`, variant: "destructive" });
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: `${file.name} is too large (max 5MB)`, variant: "destructive" });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
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

        const isPrimary = images.length === 0 && i === 0;
        const displayOrder = images.length + i;

        const { error: insertError } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            image_url: publicUrl,
            display_order: displayOrder,
            is_primary: isPrimary,
          });

        if (insertError) throw insertError;

        // Update main product image_url if this is the first/primary image
        if (isPrimary) {
          await supabase
            .from('products')
            .update({ image_url: publicUrl })
            .eq('id', productId);
        }
      }

      toast({ title: `${validFiles.length} image(s) uploaded!` });
      fetchImages();
      onImagesUpdated?.();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (imageId: string, imageUrl: string) => {
    try {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      // Update primary if needed
      const remainingImages = images.filter(img => img.id !== imageId);
      if (remainingImages.length > 0) {
        const hasPrimary = remainingImages.some(img => img.is_primary);
        if (!hasPrimary) {
          await supabase
            .from('product_images')
            .update({ is_primary: true })
            .eq('id', remainingImages[0].id);
          
          await supabase
            .from('products')
            .update({ image_url: remainingImages[0].image_url })
            .eq('id', productId);
        }
      } else {
        await supabase
          .from('products')
          .update({ image_url: null })
          .eq('id', productId);
      }

      toast({ title: "Image deleted" });
      fetchImages();
      onImagesUpdated?.();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  const handleSetPrimary = async (imageId: string, imageUrl: string) => {
    try {
      // Remove primary from all
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId);

      // Set new primary
      await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      // Update product main image
      await supabase
        .from('products')
        .update({ image_url: imageUrl })
        .eq('id', productId);

      toast({ title: "Primary image updated" });
      fetchImages();
      onImagesUpdated?.();
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">Product Images</label>
        <span className="text-xs text-muted-foreground">{images.length} image(s)</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {images.map((image) => (
          <div key={image.id} className="relative aspect-square rounded-xl overflow-hidden bg-muted group">
            <img 
              src={image.image_url} 
              alt="Product" 
              className="w-full h-full object-cover"
            />
            {image.is_primary && (
              <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Star className="h-2.5 w-2.5 fill-current" />
                Main
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-calm flex items-center justify-center gap-2">
              {!image.is_primary && (
                <button
                  onClick={() => handleSetPrimary(image.id, image.image_url)}
                  className="p-1.5 bg-white/20 rounded-full hover:bg-white/40 transition-calm"
                  title="Set as primary"
                >
                  <Star className="h-4 w-4 text-white" />
                </button>
              )}
              <button
                onClick={() => handleDelete(image.id, image.image_url)}
                className="p-1.5 bg-red-500/80 rounded-full hover:bg-red-500 transition-calm"
                title="Delete"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        ))}

        {/* Add button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-calm disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Plus className="h-5 w-5" />
              <span className="text-[10px]">Add</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        Upload multiple images. The primary image will be shown in the catalog.
      </p>
    </div>
  );
};

export default ProductMultiImageUpload;