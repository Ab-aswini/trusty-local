import { Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useShops, useCategories } from '@/hooks/useShops';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import MobileLayout from '@/components/MobileLayout';

const Index = () => {
  const navigate = useNavigate();
  const { user, signInWithGoogle, isLoading: authLoading } = useAuth();
  const { categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { shops, isLoading: shopsLoading } = useShops({
    categoryId: selectedCategory,
    searchQuery: searchQuery || undefined,
    limit: 20,
  });

  return (
    <MobileLayout>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-display text-2xl font-semibold text-primary">
              TrustLocal
            </h1>
            
            {authLoading ? null : user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user.email?.split('@')[0]}
                </span>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user.email?.[0].toUpperCase()}
                  </span>
                </div>
              </div>
            ) : (
              <Button onClick={signInWithGoogle} variant="outline" size="sm">
                Sign in with Google
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search shops, products, areas..."
              className="pl-10 bg-muted/50 border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Location hint */}
      <div className="bg-primary/5 border-b border-primary/10">
        <div className="container py-2 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Showing shops nearby</span>
        </div>
      </div>

      {/* Categories */}
      <div className="border-b border-border overflow-x-auto scrollbar-hide">
        <div className="container py-3 flex gap-2">
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-calm ${
              !selectedCategory
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-calm ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Shops Grid */}
      <main className="container py-6">
        {shopsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-soft p-4 animate-pulse">
                <div className="h-32 bg-muted rounded-xl mb-3" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : shops.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No shops found</p>
            <p className="empty-state-message">
              {searchQuery
                ? "Try a different search term."
                : "New shops are joining every day. Check back soon!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shops.map((shop) => (
              <div
                key={shop.id}
                onClick={() => navigate(`/shop/${shop.id}`)}
                className="card-soft p-4 hover:shadow-elevated transition-calm cursor-pointer"
              >
                {/* Shop Image */}
                <div className="relative h-32 bg-muted rounded-xl mb-3 overflow-hidden">
                  {shop.image_url ? (
                    <img
                      src={shop.image_url}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {shop.category?.icon || '🏪'}
                    </div>
                  )}
                  
                  {/* Availability Badge */}
                  <span
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                      shop.availability_status === 'open'
                        ? 'status-open'
                        : shop.availability_status === 'closing_soon'
                        ? 'status-closing'
                        : 'status-closed'
                    }`}
                  >
                    {shop.availability_status === 'open'
                      ? 'Open'
                      : shop.availability_status === 'closing_soon'
                      ? 'Closing Soon'
                      : 'Closed'}
                  </span>
                </div>

                {/* Shop Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-medium text-foreground truncate">
                      {shop.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {shop.category?.name} · {shop.area}
                    </p>
                  </div>
                  
                  {/* Trust Badge */}
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      shop.trust_state === 'trusted'
                        ? 'trust-badge-trusted'
                        : shop.trust_state === 'reliable'
                        ? 'trust-badge-reliable'
                        : shop.trust_state === 'active'
                        ? 'trust-badge-active'
                        : 'trust-badge-new'
                    }`}
                    title={`Trust: ${shop.trust_state}`}
                  >
                    {shop.trust_state === 'trusted'
                      ? '✓'
                      : shop.trust_state === 'reliable'
                      ? '★'
                      : shop.trust_state === 'active'
                      ? '●'
                      : '◎'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </MobileLayout>
  );
};

export default Index;