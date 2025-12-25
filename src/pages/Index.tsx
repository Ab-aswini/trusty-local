import { Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useShops, useCategories } from '@/hooks/useShops';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import MobileLayout from '@/components/MobileLayout';
import PendingRatingsBanner from '@/components/PendingRatingsBanner';
import ShopCard from '@/components/ShopCard';
import CategoryFilter from '@/components/CategoryFilter';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
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
              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 hover:opacity-80 transition-calm"
              >
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user.email?.split('@')[0]}
                </span>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user.email?.[0].toUpperCase()}
                  </span>
                </div>
              </button>
            ) : (
              <Button onClick={() => navigate('/auth')} variant="outline" size="sm">
                Sign In
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search shops, products, areas..."
              className="pl-10 bg-muted/50 border-0 h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Pending Ratings Banner */}
      <PendingRatingsBanner />

      {/* Location hint */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/10">
        <div className="container py-2 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          <span>Showing shops nearby</span>
        </div>
      </div>

      {/* Categories */}
      <CategoryFilter 
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Shops Grid */}
      <main className="container py-6">
        {/* Results count */}
        {!shopsLoading && shops.length > 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            {shops.length} {shops.length === 1 ? 'shop' : 'shops'} found
            {selectedCategory && categories.find(c => c.id === selectedCategory) && (
              <> in <span className="font-medium text-foreground">{categories.find(c => c.id === selectedCategory)?.name}</span></>
            )}
          </p>
        )}

        {shopsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-soft overflow-hidden animate-pulse">
                <div className="h-36 bg-muted" />
                <div className="p-4">
                  <div className="flex gap-2 mb-3">
                    <div className="h-6 bg-muted rounded-full w-20" />
                    <div className="h-6 bg-muted rounded-full w-24" />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 aspect-square bg-muted rounded-lg" />
                    <div className="flex-1 aspect-square bg-muted rounded-lg" />
                    <div className="flex-1 aspect-square bg-muted rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : shops.length === 0 ? (
          <div className="empty-state">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="empty-state-title">No shops found</p>
            <p className="empty-state-message">
              {searchQuery
                ? "Try a different search term or browse all categories."
                : "New shops are joining every day. Check back soon!"}
            </p>
            {(searchQuery || selectedCategory) && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(undefined);
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </main>
    </MobileLayout>
  );
};

export default Index;