import { Sparkles, TrendingUp, Star, Clock, MapPin, ChevronRight, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShops, useCategories } from '@/hooks/useShops';
import MobileLayout from '@/components/MobileLayout';
import { Badge } from '@/components/ui/badge';

const Discover = () => {
  const navigate = useNavigate();
  
  const { shops: allShops, isLoading: shopsLoading } = useShops({
    limit: 20,
  });

  const { categories, isLoading: categoriesLoading } = useCategories();

  // Filter shops by different criteria
  const trustedShops = allShops.filter(s => s.trust_state === 'trusted' || s.trust_state === 'reliable');
  const openShops = allShops.filter(s => s.availability_status === 'open');
  const premiumShops = allShops.filter(s => s.is_premium);
  const newShops = allShops.filter(s => s.trust_state === 'new' || s.trust_state === 'active');

  // Get unique areas for location-based recommendations
  const areas = [...new Set(allShops.map(s => s.area))].slice(0, 6);

  const getTrustBadgeClass = (trustState: string) => {
    switch (trustState) {
      case 'trusted': return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'reliable': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'active': return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <MobileLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="font-display text-xl font-semibold text-foreground">
              Discover
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Find local gems in your area
          </p>
        </div>
      </header>

      <main className="px-4 py-6 space-y-8">
        {/* Trending Categories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="font-display font-medium text-foreground">
                Trending Categories
              </h2>
            </div>
            <button 
              onClick={() => navigate('/search')}
              className="text-xs text-primary flex items-center gap-1 hover:underline"
            >
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          
          {categoriesLoading ? (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 min-w-[72px] animate-pulse">
                  <div className="w-14 h-14 bg-muted rounded-2xl" />
                  <div className="h-3 bg-muted rounded w-12" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {categories.slice(0, 8).map((category) => (
                <button
                  key={category.id}
                  onClick={() => navigate(`/search?category=${category.id}`)}
                  className="flex flex-col items-center gap-2 min-w-[72px] group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-200">
                    {category.icon || '📦'}
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[72px]">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Premium/Featured Shops */}
        {premiumShops.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-4 w-4 text-amber-500" />
              <h2 className="font-display font-medium text-foreground">
                Featured Shops
              </h2>
              <Badge variant="secondary" className="text-[10px] bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border-0">
                Premium
              </Badge>
            </div>
            
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {premiumShops.slice(0, 6).map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => navigate(`/shop/${shop.id}`)}
                  className="relative min-w-[200px] max-w-[200px] rounded-2xl overflow-hidden cursor-pointer group"
                >
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5">
                    {shop.image_url ? (
                      <img
                        src={shop.image_url}
                        alt={shop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {shop.category?.icon || '🏪'}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-medium text-sm text-white truncate">
                      {shop.name}
                    </h3>
                    <p className="text-xs text-white/80 truncate flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {shop.area}
                    </p>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="bg-amber-500/90 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Crown className="h-3 w-3" /> Featured
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trusted by Community */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <h2 className="font-display font-medium text-foreground">
                Trusted by Community
              </h2>
            </div>
          </div>
          
          {shopsLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card-soft p-3 animate-pulse">
                  <div className="h-24 bg-muted rounded-xl mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-1" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : trustedShops.length === 0 ? (
            <div className="card-soft p-6 text-center">
              <Star className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                Trusted shops will appear here as the community grows
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {trustedShops.slice(0, 6).map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => navigate(`/shop/${shop.id}`)}
                  className="card-soft p-3 hover:shadow-elevated transition-all duration-200 cursor-pointer group"
                >
                  <div className="h-24 bg-muted rounded-xl mb-2 overflow-hidden relative">
                    {shop.image_url ? (
                      <img
                        src={shop.image_url}
                        alt={shop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-primary/10 to-primary/5">
                        {shop.category?.icon || '🏪'}
                      </div>
                    )}
                    <Badge 
                      className={`absolute top-1.5 right-1.5 text-[10px] px-1.5 py-0.5 ${getTrustBadgeClass(shop.trust_state)}`}
                    >
                      {shop.trust_state === 'trusted' ? '✓ Trusted' : '★ Reliable'}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-sm text-foreground truncate">
                    {shop.name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {shop.area}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Location-Based Recommendations */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="font-display font-medium text-foreground">
              Explore by Area
            </h2>
          </div>
          
          {areas.length === 0 ? (
            <div className="card-soft p-6 text-center">
              <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                Location recommendations coming soon
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {areas.map((area) => {
                const areaShopCount = allShops.filter(s => s.area === area).length;
                return (
                  <button
                    key={area}
                    onClick={() => navigate(`/search?area=${encodeURIComponent(area)}`)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary/50 hover:bg-secondary border border-border/50 transition-colors group"
                  >
                    <MapPin className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-sm text-foreground">{area}</span>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                      {areaShopCount}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Recently Active / Open Now */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-500" />
              <h2 className="font-display font-medium text-foreground">
                Open Now
              </h2>
            </div>
          </div>
          
          {shopsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card-soft p-4 animate-pulse flex gap-4">
                  <div className="w-16 h-16 bg-muted rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : openShops.length === 0 ? (
            <div className="card-soft p-6 text-center">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                No shops are currently open
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {openShops.slice(0, 5).map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => navigate(`/shop/${shop.id}`)}
                  className="card-soft p-3 flex gap-3 hover:shadow-elevated transition-all duration-200 cursor-pointer group"
                >
                  <div className="w-16 h-16 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                    {shop.image_url ? (
                      <img
                        src={shop.image_url}
                        alt={shop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-primary/10 to-primary/5">
                        {shop.category?.icon || '🏪'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground truncate">
                        {shop.name}
                      </h3>
                      <span className="flex-shrink-0 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Open
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {shop.category?.name} · {shop.area}
                    </p>
                    {shop.interaction_count > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {shop.interaction_count} interactions
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground self-center opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* New Shops */}
        {newShops.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-primary" />
              <h2 className="font-display font-medium text-foreground">
                New on TrustLocal
              </h2>
            </div>
            
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {newShops.slice(0, 6).map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => navigate(`/shop/${shop.id}`)}
                  className="card-soft p-3 min-w-[150px] max-w-[150px] hover:shadow-elevated transition-all duration-200 cursor-pointer group"
                >
                  <div className="h-20 bg-muted rounded-xl mb-2 overflow-hidden relative">
                    {shop.image_url ? (
                      <img
                        src={shop.image_url}
                        alt={shop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-primary/10 to-primary/5">
                        {shop.category?.icon || '🏪'}
                      </div>
                    )}
                    <Badge className="absolute top-1.5 right-1.5 text-[10px] bg-primary/90 text-primary-foreground border-0">
                      New
                    </Badge>
                  </div>
                  <h3 className="font-medium text-sm text-foreground truncate">
                    {shop.name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {shop.category?.name}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Community Growth Banner */}
        <section className="card-soft p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <div className="text-center">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-display font-medium text-foreground mb-2">
              Growing Every Day
            </h3>
            <p className="text-sm text-muted-foreground">
              New local businesses are joining TrustLocal daily. 
              Check back often to discover more trusted shops in your area.
            </p>
          </div>
        </section>
      </main>
    </MobileLayout>
  );
};

export default Discover;
