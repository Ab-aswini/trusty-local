import { Sparkles, TrendingUp, Star, Clock } from 'lucide-react';
import { useShops } from '@/hooks/useShops';
import MobileLayout from '@/components/MobileLayout';

const Discover = () => {
  const { shops: trustedShops, isLoading: trustedLoading } = useShops({
    limit: 10,
  });

  const { shops: recentShops, isLoading: recentLoading } = useShops({
    limit: 10,
  });

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
        {/* Trusted Shops Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4 text-amber-500" />
            <h2 className="font-display font-medium text-foreground">
              Trusted by Community
            </h2>
          </div>
          
          {trustedLoading ? (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card-soft p-3 min-w-[160px] animate-pulse">
                  <div className="h-24 bg-muted rounded-xl mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-1" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : trustedShops.length === 0 ? (
            <div className="card-soft p-6 text-center">
              <p className="text-muted-foreground text-sm">
                Trusted shops will appear here soon
              </p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {trustedShops.filter(s => s.trust_state === 'trusted' || s.trust_state === 'reliable').slice(0, 6).map((shop) => (
                <div
                  key={shop.id}
                  className="card-soft p-3 min-w-[160px] max-w-[160px] hover:shadow-elevated transition-calm cursor-pointer"
                >
                  <div className="h-24 bg-muted rounded-xl mb-2 overflow-hidden relative">
                    {shop.image_url ? (
                      <img
                        src={shop.image_url}
                        alt={shop.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        {shop.category?.icon || '🏪'}
                      </div>
                    )}
                    <span className="absolute top-1 right-1 trust-badge-trusted w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  </div>
                  <h3 className="font-medium text-sm text-foreground truncate">
                    {shop.name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {shop.area}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recently Active Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-primary" />
            <h2 className="font-display font-medium text-foreground">
              Recently Active
            </h2>
          </div>
          
          {recentLoading ? (
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
          ) : recentShops.length === 0 ? (
            <div className="card-soft p-6 text-center">
              <p className="text-muted-foreground text-sm">
                Active shops will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentShops.filter(s => s.availability_status === 'open').slice(0, 5).map((shop) => (
                <div
                  key={shop.id}
                  className="card-soft p-3 flex gap-3 hover:shadow-elevated transition-calm cursor-pointer"
                >
                  <div className="w-16 h-16 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                    {shop.image_url ? (
                      <img
                        src={shop.image_url}
                        alt={shop.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {shop.category?.icon || '🏪'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground truncate">
                        {shop.name}
                      </h3>
                      <span className="status-open px-2 py-0.5 rounded-full text-[10px]">
                        Open
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {shop.category?.name} · {shop.area}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Empty State for New Cities */}
        <section className="card-soft p-6 bg-primary/5 border-primary/10">
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
