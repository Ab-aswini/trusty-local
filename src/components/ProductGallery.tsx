import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { Product } from '@/types/database';
import { Button } from '@/components/ui/button';

interface ProductGalleryProps {
  products: Product[];
  shopName?: string;
  whatsappNumber?: string;
  onProductInquiry?: (product: Product) => void;
}

const formatPrice = (product: Product): string => {
  if (product.price_type === 'fixed' && product.price_fixed) {
    return `₹${product.price_fixed}`;
  }
  if (product.price_type === 'range' && product.price_min && product.price_max) {
    return `₹${product.price_min} - ₹${product.price_max}`;
  }
  if (product.price_type === 'discount' && product.price_discounted) {
    return `₹${product.price_discounted}`;
  }
  return 'Price on request';
};

const ProductGallery = ({ products, shopName, whatsappNumber, onProductInquiry }: ProductGalleryProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (product: Product, index: number) => {
    setSelectedProduct(product);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedProduct(null);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? products.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedProduct(products[newIndex]);
  };

  const goToNext = () => {
    const newIndex = currentIndex === products.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    setSelectedProduct(products[newIndex]);
  };

  const handleProductInquiry = (product: Product, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    if (whatsappNumber) {
      const price = formatPrice(product);
      const message = `Hi${shopName ? ` ${shopName}` : ''}! I'm interested in:\n\n📦 *${product.name}*\n💰 ${price}\n\nCould you please share more details?`;
      const cleanNumber = whatsappNumber.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, '_blank');
    }
    
    onProductInquiry?.(product);
  };

  if (products.length === 0) {
    return (
      <div className="card-soft p-6 text-center">
        <p className="text-muted-foreground text-sm">
          No products listed yet. Contact the shop for more details.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-3">
        {products.map((product, index) => (
          <div 
            key={product.id} 
            className="card-soft overflow-hidden group"
          >
            <div 
              onClick={() => openLightbox(product, index)}
              className="cursor-pointer"
            >
              <div className="aspect-square bg-muted overflow-hidden relative">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-muted to-muted/50">
                    📦
                  </div>
                )}
                {product.price_type === 'discount' && product.price_original && product.price_discounted && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {Math.round((1 - product.price_discounted / product.price_original) * 100)}% OFF
                  </div>
                )}
              </div>
              <div className="p-3 pb-2">
                <h3 className="font-medium text-sm text-foreground truncate">{product.name}</h3>
                <p className="text-sm text-primary font-semibold mt-1">
                  {product.price_type === 'fixed' && product.price_fixed
                    ? `₹${product.price_fixed}`
                    : product.price_type === 'range' && product.price_min && product.price_max
                    ? `₹${product.price_min} - ₹${product.price_max}`
                    : product.price_type === 'discount' && product.price_original && product.price_discounted
                    ? (
                      <span>
                        <span className="line-through text-muted-foreground text-xs">₹{product.price_original}</span>
                        {' '}₹{product.price_discounted}
                      </span>
                    )
                    : 'Enquire'}
                </p>
              </div>
            </div>
            
            {/* Product CTA Button */}
            {whatsappNumber && (
              <div className="px-3 pb-3">
                <Button
                  size="sm"
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={(e) => handleProductInquiry(product, e)}
                >
                  <MessageCircle className="h-4 w-4" />
                  Enquire Now
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button 
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-calm"
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation */}
          {products.length > 1 && (
            <>
              <button 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-calm"
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-calm"
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Product Content */}
          <div 
            className="max-w-md w-full bg-card rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-square bg-muted relative">
              {selectedProduct.image_url ? (
                <img 
                  src={selectedProduct.image_url} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
              )}
              {selectedProduct.price_type === 'discount' && selectedProduct.price_original && selectedProduct.price_discounted && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {Math.round((1 - selectedProduct.price_discounted / selectedProduct.price_original) * 100)}% OFF
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-display text-lg font-medium text-foreground">{selectedProduct.name}</h3>
              {selectedProduct.description && (
                <p className="text-sm text-muted-foreground mt-2">{selectedProduct.description}</p>
              )}
              <p className="text-xl text-primary font-semibold mt-3">
                {selectedProduct.price_type === 'fixed' && selectedProduct.price_fixed
                  ? `₹${selectedProduct.price_fixed}`
                  : selectedProduct.price_type === 'range' && selectedProduct.price_min && selectedProduct.price_max
                  ? `₹${selectedProduct.price_min} - ₹${selectedProduct.price_max}`
                  : selectedProduct.price_type === 'discount' && selectedProduct.price_original && selectedProduct.price_discounted
                  ? (
                    <span>
                      <span className="line-through text-muted-foreground text-base">₹{selectedProduct.price_original}</span>
                      {' '}₹{selectedProduct.price_discounted}
                    </span>
                  )
                  : 'Enquire for price'}
              </p>
              
              {/* Lightbox CTA */}
              {whatsappNumber && (
                <Button
                  className="w-full mt-4 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleProductInquiry(selectedProduct)}
                >
                  <MessageCircle className="h-5 w-5" />
                  Enquire about {selectedProduct.name}
                </Button>
              )}
              
              {/* Counter */}
              <p className="text-xs text-muted-foreground mt-3 text-center">
                {currentIndex + 1} of {products.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductGallery;
