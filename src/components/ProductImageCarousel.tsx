import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
}

interface ProductImageCarouselProps {
  productId: string;
  fallbackImage?: string | null;
  className?: string;
}

const ProductImageCarousel = ({ productId, fallbackImage, className = '' }: ProductImageCarouselProps) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', productId)
          .order('display_order', { ascending: true });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setImages(data);
          // Start with primary image
          const primaryIndex = data.findIndex(img => img.is_primary);
          if (primaryIndex >= 0) setCurrentIndex(primaryIndex);
        } else if (fallbackImage) {
          // Use fallback if no multi-images
          setImages([{ id: 'fallback', image_url: fallbackImage, display_order: 0, is_primary: true }]);
        }
      } catch (err) {
        console.error('Error fetching product images:', err);
        if (fallbackImage) {
          setImages([{ id: 'fallback', image_url: fallbackImage, display_order: 0, is_primary: true }]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [productId, fallbackImage]);

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (isLoading) {
    return (
      <div className={`bg-muted animate-pulse ${className}`} />
    );
  }

  if (images.length === 0) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <span className="text-3xl">📦</span>
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      <img
        src={images[currentIndex].image_url}
        alt="Product"
        className="w-full h-full object-cover"
      />

      {images.length > 1 && (
        <>
          {/* Navigation arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-calm flex items-center justify-center hover:bg-black/60"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-calm flex items-center justify-center hover:bg-black/60"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Dots indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-calm ${
                  idx === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Image count badge */}
          <div className="absolute top-1.5 right-1.5 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {currentIndex + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductImageCarousel;