import { Search as SearchIcon, MapPin, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useShops, useCategories } from '@/hooks/useShops';
import MobileLayout from '@/components/MobileLayout';

const Search = () => {
  const { categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');

  const { shops, isLoading } = useShops({
    categoryId: selectedCategory,
    searchQuery: searchQuery || undefined,
    city: city || undefined,
    area: area || undefined,
    limit: 50,
  });

  return (
    <MobileLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-4">
          <h1 className="font-display text-xl font-semibold text-foreground mb-4">
            Find Shops
          </h1>

          {/* Search Input */}
          <div className="relative mb-3">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search shops, products..."
              className="pl-10 bg-muted/50 border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Location Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="City"
                className="pl-10 bg-muted/50 border-0 text-sm"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="relative flex-1">
              <Input
                placeholder="Area"
                className="bg-muted/50 border-0 text-sm"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="overflow-x-auto scrollbar-hide border-t border-border">
          <div className="px-4 py-3 flex gap-2">
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
      </header>

      {/* Results */}
      <main className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card-soft p-4 animate-pulse flex gap-4">
                <div className="w-20 h-20 bg-muted rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : shops.length === 0 ? (
          <div className="empty-state mt-8">
            <SearchIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="empty-state-title">No shops found</p>
            <p className="empty-state-message">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-2">
              {shops.length} shop{shops.length !== 1 ? 's' : ''} found
            </p>
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="card-soft p-3 flex gap-3 hover:shadow-elevated transition-calm cursor-pointer"
              >
                <div className="w-20 h-20 bg-muted rounded-xl overflow-hidden flex-shrink-0">
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
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-medium text-foreground truncate">
                      {shop.name}
                    </h3>
                    <span
                      className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${
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
                        ? 'Soon'
                        : 'Closed'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {shop.category?.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {shop.area}, {shop.city}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </MobileLayout>
  );
};

export default Search;
