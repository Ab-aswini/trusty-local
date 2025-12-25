import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Camera } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ProductImageUploadProps {
  productId: string;
  currentImage: string | null;
  productName: string;
  onImageUpdated: (url: string) => void;
}

const ProductImageUpload = ({ productId, currentImage, productName, onImageUpdated }: ProductImageUploadProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5MB", variant: "destructive" });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIsOpen(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${productId}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('shop-images')
        .upload(filePath, selectedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('shop-images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('products')
        .update({ image_url: publicUrl })
        .eq('id', productId);

      if (updateError) throw updateError;

      onImageUpdated(publicUrl);
      toast({ title: "Photo updated!" });
      handleClose();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerCamera = () => {
    cameraInputRef.current?.click();
  };

  return (
    <>
      <button
        onClick={triggerFileInput}
        className="relative w-16 h-16 bg-muted rounded-xl overflow-hidden flex-shrink-0 group"
      >
        {currentImage ? (
          <img src={currentImage} alt={productName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-calm flex items-center justify-center">
          <Camera className="h-5 w-5 text-white" />
        </div>
      </button>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Update Product Photo</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {previewUrl && (
              <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={triggerCamera} disabled={isUploading}>
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </Button>
              <Button variant="outline" onClick={triggerFileInput} disabled={isUploading}>
                Choose File
              </Button>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleClose} disabled={isUploading}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleUpload} disabled={isUploading || !selectedFile}>
                {isUploading ? 'Uploading...' : 'Save Photo'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductImageUpload;
