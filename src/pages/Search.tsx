import { Search as SearchIcon, MapPin, Filter, X, Star, Shield, Zap, Clock, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useShops, useCategories } from '@/hooks/useShops';
import MobileLayout from '@/components/MobileLayout';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

type TrustFilter = 'all' | 'trusted' | 'reliable' | 'active' | 'new';
type AvailabilityFilter = 'all' | 'open' | 'closing_soon' | 'closed';

const Search = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { categories } = useCategories();
  
  // Initialize from URL params
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    searchParams.get('category') || undefined
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState(searchParams.get('area') || '');
  const [trustFilter, setTrustFilter] = useState<TrustFilter>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { shops: allShops, isLoading } = useShops({
    categoryId: selectedCategory,
    searchQuery: searchQuery || undefined,
    city: city || undefined,
    area: area || undefined,
    limit: 100,
  });

  // Apply client-side filters for trust and availability
  const filteredShops = useMemo(() => {
    let result = allShops;
    
    if (trustFilter !== 'all') {
      result = result.filter(shop => shop.trust_state === trustFilter);
    }
    
    if (availabilityFilter !== 'all') {
      result = result.filter(shop => shop.availability_status === availabilityFilter);
    }
    
    return result;
  }, [allShops, trustFilter, availabilityFilter]);

  // Get unique areas and cities for suggestions
  const uniqueAreas = useMemo(() => 
    [...new Set(allShops.map(s => s.area))].filter(Boolean).slice(0, 10),
    [allShops]
  );
  
  const uniqueCities = useMemo(() => 
    [...new Set(allShops.map(s => s.city))].filter(Boolean).slice(0, 10),
    [allShops]
  );

  // Count active filters
  const activeFilterCount = [
    trustFilter !== 'all',
    availabilityFilter !== 'all',
    city !== '',
    area !== '',
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSelectedCategory(undefined);
    setSearchQuery('');
    setCity('');
    setArea('');
    setTrustFilter('all');
    setAvailabilityFilter('all');
  };

  const getTrustBadgeClass = (trustState: string) => {
    switch (trustState) {
      case 'trusted': return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'reliable': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'active': return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getTrustLabel = (trustState: string) => {
    switch (trustState) {
      case 'trusted': return '✓ Trusted';
      case 'reliable': return '★ Reliable';
      case 'active': return '◆ Active';
      default: return '○ New';
    }
  };

  return (
    <MobileLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-display text-xl font-semibold text-foreground">
              Find Shops
            </h1>
            
            {/* Filter Button */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="relative gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
                <SheetHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="font-display">Advanced Filters</SheetTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearAllFilters}
                      className="text-muted-foreground"
                    >
                      Clear all
                    </Button>
                  </div>
                </SheetHeader>
                
                <div className="space-y-6 overflow-y-auto pb-8">
                  {/* Trust Level Filter */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      Trust Level
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        { value: 'all', label: 'All', icon: null },
                        { value: 'trusted', label: 'Trusted', icon: '✓' },
                        { value: 'reliable', label: 'Reliable', icon: '★' },
                        { value: 'active', label: 'Active', icon: '◆' },
                        { value: 'new', label: 'New', icon: '○' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setTrustFilter(option.value as TrustFilter)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            trustFilter === option.value
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {option.icon && <span className="mr-1">{option.icon}</span>}
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Availability Filter */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Availability
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        { value: 'all', label: 'All', color: '' },
                        { value: 'open', label: 'Open Now', color: 'text-emerald-500' },
                        { value: 'closing_soon', label: 'Closing Soon', color: 'text-amber-500' },
                        { value: 'closed', label: 'Closed', color: 'text-muted-foreground' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setAvailabilityFilter(option.value as AvailabilityFilter)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            availabilityFilter === option.value
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {option.value === 'open' && (
                            <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block mr-2" />
                          )}
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location Filters */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Location
                    </label>
                    <div className="space-y-3 mt-2">
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="City"
                          className="pl-10 bg-muted/50 border-border"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                      {uniqueCities.length > 0 && !city && (
                        <div className="flex flex-wrap gap-1.5">
                          {uniqueCities.slice(0, 5).map((c) => (
                            <button
                              key={c}
                              onClick={() => setCity(c)}
                              className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <Input
                        placeholder="Area / Neighborhood"
                        className="bg-muted/50 border-border"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                      />
                      {uniqueAreas.length > 0 && !area && (
                        <div className="flex flex-wrap gap-1.5">
                          {uniqueAreas.slice(0, 5).map((a) => (
                            <button
                              key={a}
                              onClick={() => setArea(a)}
                              className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                            >
                              {a}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Show {filteredShops.length} Results
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search shops, products..."
              className="pl-10 pr-10 bg-muted/50 border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Active Filter Tags */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {trustFilter !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="gap-1 cursor-pointer hover:bg-destructive/20"
                  onClick={() => setTrustFilter('all')}
                >
                  <Shield className="h-3 w-3" />
                  {trustFilter}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              {availabilityFilter !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="gap-1 cursor-pointer hover:bg-destructive/20"
                  onClick={() => setAvailabilityFilter('all')}
                >
                  <Clock className="h-3 w-3" />
                  {availabilityFilter.replace('_', ' ')}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              {city && (
                <Badge 
                  variant="secondary" 
                  className="gap-1 cursor-pointer hover:bg-destructive/20"
                  onClick={() => setCity('')}
                >
                  <MapPin className="h-3 w-3" />
                  {city}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              {area && (
                <Badge 
                  variant="secondary" 
                  className="gap-1 cursor-pointer hover:bg-destructive/20"
                  onClick={() => setArea('')}
                >
                  {area}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="overflow-x-auto scrollbar-hide border-t border-border">
          <div className="px-4 py-3 flex gap-2">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
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
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
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
        ) : filteredShops.length === 0 ? (
          <div className="empty-state mt-8">
            <SearchIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="empty-state-title">No shops found</p>
            <p className="empty-state-message mb-4">
              Try adjusting your search or filters
            </p>
            {activeFilterCount > 0 && (
              <Button variant="outline" onClick={clearAllFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-2">
              {filteredShops.length} shop{filteredShops.length !== 1 ? 's' : ''} found
            </p>
            {filteredShops.map((shop) => (
              <div
                key={shop.id}
                onClick={() => navigate(`/shop/${shop.id}`)}
                className="card-soft p-3 flex gap-3 hover:shadow-elevated transition-all duration-200 cursor-pointer group"
              >
                <div className="w-20 h-20 bg-muted rounded-xl overflow-hidden flex-shrink-0 relative">
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
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-medium text-foreground truncate">
                      {shop.name}
                    </h3>
                    <span
                      className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        shop.availability_status === 'open'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : shop.availability_status === 'closing_soon'
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-muted text-muted-foreground border border-border'
                      }`}
                    >
                      {shop.availability_status === 'open'
                        ? 'Open'
                        : shop.availability_status === 'closing_soon'
                        ? 'Soon'
                        : 'Closed'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground truncate">
                      {shop.category?.name}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] px-1.5 py-0 ${getTrustBadgeClass(shop.trust_state)}`}
                    >
                      {getTrustLabel(shop.trust_state)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {shop.area}, {shop.city}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground self-center opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}
      </main>
    </MobileLayout>
  );
};

export default Search;
