import { Shop, Product } from '@/types/database';
import { 
  MapPin, 
  Phone, 
  MessageCircle, 
  Star,
  Instagram,
  Facebook,
  ExternalLink
} from 'lucide-react';

interface VendorPortfolioPreviewProps {
  shop: Shop;
  products: Product[];
}

const VendorPortfolioPreview = ({ shop, products }: VendorPortfolioPreviewProps) => {
  const getStarRating = () => {
    if (shop.trust_state === 'trusted') return 5;
    if (shop.trust_state === 'reliable') return 4;
    if (shop.trust_state === 'active') return 3;
    return 2;
  };

  const formatPrice = (product: Product) => {
    if (product.price_type === 'fixed' && product.price_fixed) {
      return `₹${product.price_fixed}`;
    }
    if (product.price_type === 'range' && product.price_min && product.price_max) {
      return `₹${product.price_min} - ₹${product.price_max}`;
    }
    if (product.price_type === 'discount' && product.price_discounted) {
      return (
        <span className="flex items-center gap-1">
          <span className="text-destructive line-through text-xs">₹{product.price_original}</span>
          <span>₹{product.price_discounted}</span>
        </span>
      );
    }
    return 'Contact for price';
  };

  return (
    <div className="bg-background rounded-2xl overflow-hidden shadow-elevated border border-border">
      {/* Hero Banner */}
      <div className="relative h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-background">
        {shop.image_url && (
          <img 
            src={shop.image_url} 
            alt={shop.name} 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Shop Logo/Initial */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <div className="w-16 h-16 rounded-full bg-amber-400 border-4 border-background flex items-center justify-center shadow-lg overflow-hidden">
            {shop.image_url ? (
              <img 
                src={shop.image_url} 
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-amber-900">
                {shop.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Shop Identity */}
      <div className="pt-10 pb-4 px-4 text-center">
        <h2 className="font-display text-lg font-semibold text-foreground">
          {shop.name}
        </h2>
        
        {/* Star Rating */}
        <div className="flex items-center justify-center gap-0.5 my-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${i < getStarRating() ? 'text-amber-400 fill-amber-400' : 'text-muted'}`}
            />
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground">
          Since {new Date(shop.created_at).getFullYear()}
        </p>
      </div>

      {/* Contact Info */}
      <div className="px-4 pb-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
          </div>
          <span className="text-muted-foreground">WhatsApp</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <Phone className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="text-muted-foreground">{shop.whatsapp_number}</span>
        </div>
      </div>

      {/* Social Links */}
      <div className="px-4 pb-4 flex justify-center gap-2">
        {/* WhatsApp - always show */}
        <a
          href={`https://wa.me/${shop.whatsapp_number.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center hover:scale-105 transition-transform"
        >
          <MessageCircle className="h-5 w-5 text-white" />
        </a>
        
        {/* Instagram */}
        {shop.instagram_url ? (
          <a
            href={shop.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center hover:scale-105 transition-transform"
          >
            <Instagram className="h-5 w-5 text-white" />
          </a>
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center opacity-40">
            <Instagram className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        
        {/* Facebook */}
        {shop.facebook_url ? (
          <a
            href={shop.facebook_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:scale-105 transition-transform"
          >
            <Facebook className="h-5 w-5 text-white" />
          </a>
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center opacity-40">
            <Facebook className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        
        {/* Google Maps */}
        {shop.google_maps_url ? (
          <a
            href={shop.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center hover:scale-105 transition-transform"
          >
            <MapPin className="h-5 w-5 text-white" />
          </a>
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center opacity-40">
            <MapPin className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Location Map Placeholder */}
      <div className="mx-4 mb-4 h-16 bg-muted rounded-xl flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{shop.area}, {shop.city}</span>
        </div>
      </div>

      {/* Products Preview */}
      {products.length > 0 && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {products.slice(0, 2).map((product) => (
              <div key={product.id} className="bg-muted/50 rounded-xl overflow-hidden">
                <div className="aspect-square bg-muted">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      📦
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium text-foreground line-clamp-2">
                    {product.name}
                  </p>
                  <p className="text-xs text-primary font-semibold mt-0.5">
                    {formatPrice(product)}
                  </p>
                  <div className="mt-2 bg-amber-400 text-amber-900 rounded-lg py-1 px-2 flex items-center justify-center gap-1 text-xs font-medium">
                    <MessageCircle className="h-3 w-3" />
                    WhatsApp to Order
                  </div>
                </div>
              </div>
            ))}
          </div>
          {products.length > 2 && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              +{products.length - 2} more products
            </p>
          )}
        </div>
      )}

      {products.length === 0 && (
        <div className="px-4 pb-4">
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              No products added yet
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPortfolioPreview;
