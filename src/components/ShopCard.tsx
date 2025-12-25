import { useNavigate } from 'react-router-dom';
import { ShopWithProducts } from '@/hooks/useShops';
import { MapPin, ShieldCheck, Star, TrendingUp, Sparkles } from 'lucide-react';

interface ShopCardProps {
  shop: ShopWithProducts;
}

const TrustIndicator = ({ trustState, interactionCount }: { trustState: string; interactionCount: number }) => {
  const config = {
    trusted: {
      icon: ShieldCheck,
      label: 'Trusted',
      className: 'bg-[hsl(var(--trust-trusted))] text-white',
      description: 'Highly rated by community'
    },
    reliable: {
      icon: Star,
      label: 'Reliable',
      className: 'bg-[hsl(var(--trust-reliable))] text-white',
      description: `${interactionCount}+ positive interactions`
    },
    active: {
      icon: TrendingUp,
      label: 'Active',
      className: 'bg-[hsl(var(--trust-active))] text-white',
      description: 'Growing reputation'
    },
    new: {
      icon: Sparkles,
      label: 'New',
      className: 'bg-[hsl(var(--trust-new))] text-foreground',
      description: 'Recently joined'
    },
  };

  const { icon: Icon, label, className } = config[trustState as keyof typeof config] || config.new;

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </div>
  );
};

const ShopCard = ({ shop }: ShopCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/shop/${shop.id}`)}
      className="card-soft overflow-hidden hover:shadow-elevated transition-calm cursor-pointer group"
    >
      {/* Shop Image with Gradient Overlay */}
      <div className="relative h-36 bg-muted overflow-hidden">
        {shop.image_url ? (
          <img
            src={shop.image_url}
            alt={shop.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-5xl">{shop.category?.icon || '🏪'}</span>
          </div>
        )}
        
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Availability Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
              shop.availability_status === 'open'
                ? 'bg-[hsl(var(--status-open))]/90 text-white'
                : shop.availability_status === 'closing_soon'
                ? 'bg-[hsl(var(--status-closing))]/90 text-foreground'
                : 'bg-[hsl(var(--status-closed))]/90 text-white'
            }`}
          >
            {shop.availability_status === 'open'
              ? '● Open'
              : shop.availability_status === 'closing_soon'
              ? 'Closing Soon'
              : 'Closed'}
          </span>
        </div>

        {/* Shop Name Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-display font-semibold text-white text-lg truncate drop-shadow-md">
            {shop.name}
          </h3>
          <div className="flex items-center gap-1 text-white/80 text-sm">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{shop.area}, {shop.city}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Trust & Category Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <TrustIndicator trustState={shop.trust_state} interactionCount={shop.interaction_count} />
          {shop.category && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {shop.category.icon} {shop.category.name}
            </span>
          )}
        </div>

        {/* Product Previews */}
        {shop.products && shop.products.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Popular Items
            </p>
            <div className="flex gap-2">
              {shop.products.map((product) => (
                <div 
                  key={product.id} 
                  className="flex-1 min-w-0"
                >
                  <div className="aspect-square rounded-lg bg-muted overflow-hidden mb-1.5">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        📦
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-foreground truncate font-medium">{product.name}</p>
                  {product.price_fixed && (
                    <p className="text-xs text-primary font-semibold">₹{product.price_fixed}</p>
                  )}
                </div>
              ))}
              {/* Fill empty slots */}
              {[...Array(Math.max(0, 3 - shop.products.length))].map((_, i) => (
                <div key={`empty-${i}`} className="flex-1 min-w-0 opacity-0" />
              ))}
            </div>
          </div>
        ) : (
          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              {shop.story ? shop.story.slice(0, 60) + (shop.story.length > 60 ? '...' : '') : 'Tap to see what\'s available'}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-3 pt-3 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
          <span>{shop.interaction_count} interactions</span>
          {shop.positive_tag_count > 0 && (
            <span className="text-primary">+{shop.positive_tag_count} positive</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
