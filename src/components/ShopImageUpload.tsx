import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Camera, Upload, X, Check, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ShopImageUploadProps {
  shopId: string;
  currentImage: string | null;
  shopName: string;
  onImageUpdated: (url: string) => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const ShopImageUpload = ({ shopId, currentImage, shopName, onImageUpdated }: ShopImageUploadProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isUploading, setIsUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setIsOpen(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1)); // 1:1 aspect ratio for logo
  }, []);

  const getCroppedImg = async (
    image: HTMLImageElement,
    pixelCrop: PixelCrop
  ): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = pixelCrop.width * scaleX;
    canvas.height = pixelCrop.height * scaleY;

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas is empty'));
        },
        'image/jpeg',
        0.9
      );
    });
  };

  const handleUpload = async () => {
    if (!imgRef.current || !completedCrop) return;

    setIsUploading(true);
    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
      
      const fileName = `${shopId}/logo-${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('shop-images')
        .upload(fileName, croppedBlob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('shop-images')
        .getPublicUrl(fileName);

      // Update shop with new image URL
      const { error: updateError } = await supabase
        .from('shops')
        .update({ image_url: publicUrl })
        .eq('id', shopId);

      if (updateError) throw updateError;

      onImageUpdated(publicUrl);
      toast({ title: "Photo updated!" });
      setIsOpen(false);
      setImgSrc('');
    } catch (err: any) {
      console.error('Upload error:', err);
      toast({
        title: "Upload failed",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setImgSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  return (
    <>
      {/* Upload Trigger */}
      <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <div className="w-20 h-20 rounded-full bg-amber-400 border-4 border-background flex items-center justify-center shadow-lg overflow-hidden">
          {currentImage ? (
            <img 
              src={currentImage} 
              alt={shopName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl font-bold text-amber-900">
              {shopName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        
        {/* Camera overlay */}
        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="h-6 w-6 text-white" />
        </div>
        
        {/* Camera badge */}
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-background">
          <Camera className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onSelectFile}
        className="hidden"
      />

      {/* Crop Dialog */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Crop Your Photo</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {imgSrc && (
              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                  className="max-h-[300px] rounded-lg overflow-hidden"
                >
                  <img
                    ref={imgRef}
                    alt="Crop preview"
                    src={imgSrc}
                    onLoad={onImageLoad}
                    className="max-h-[300px] w-auto"
                  />
                </ReactCrop>
              </div>
            )}
            <p className="text-xs text-center text-muted-foreground mt-3">
              Drag to adjust the crop area
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isUploading || !completedCrop}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Photo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShopImageUpload;
