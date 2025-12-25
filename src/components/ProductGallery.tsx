import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types/database';

interface ProductGalleryProps {
  products: Product[];
}

const ProductGallery = ({ products }: ProductGalleryProps) => {
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
            onClick={() => openLightbox(product, index)}
            className="card-soft overflow-hidden cursor-pointer hover:shadow-elevated transition-calm group"
          >
            <div className="aspect-square bg-muted overflow-hidden">
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
            </div>
            <div className="p-3">
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
            <div className="aspect-square bg-muted">
              {selectedProduct.image_url ? (
                <img 
                  src={selectedProduct.image_url} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
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
              
              {/* Counter */}
              <p className="text-xs text-muted-foreground mt-3">
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
