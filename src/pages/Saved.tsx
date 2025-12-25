import { Bookmark, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSavedShops } from '@/hooks/useSavedShops';
import { Button } from '@/components/ui/button';
import MobileLayout from '@/components/MobileLayout';
import { Link } from 'react-router-dom';

const Saved = () => {
  const { user, signInWithGoogle, isLoading: authLoading } = useAuth();
  const { savedShops, isLoading: savedLoading, toggleSave } = useSavedShops();

  if (authLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </MobileLayout>
    );
  }

  if (!user) {
    return (
      <MobileLayout>
        <div className="px-4 py-8">
          <div className="card-soft p-8 text-center">
            <Bookmark className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="font-display text-lg font-medium text-foreground mb-2">
              Save Your Favorites
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Sign in to save shops you love and access them anytime
            </p>
            <Button onClick={signInWithGoogle} className="w-full">
              Sign in with Google
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            <h1 className="font-display text-xl font-semibold text-foreground">
              Saved Shops
            </h1>
          </div>
          {savedShops.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {savedShops.length} shop{savedShops.length !== 1 ? 's' : ''} saved
            </p>
          )}
        </div>
      </header>

      <main className="px-4 py-4">
        {savedLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card-soft p-3 animate-pulse">
                <div className="h-28 bg-muted rounded-xl mb-2" />
                <div className="h-4 bg-muted rounded w-3/4 mb-1" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : savedShops.length === 0 ? (
          <div className="empty-state mt-8">
            <Heart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="empty-state-title">No saved shops yet</p>
            <p className="empty-state-message mb-6">
              Explore and save shops you want to remember
            </p>
            <Link to="/">
              <Button variant="outline">Explore Shops</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {savedShops.map((saved) => (
              <div
                key={saved.id}
                className="card-soft p-3 hover:shadow-elevated transition-calm cursor-pointer relative group"
              >
                <div className="h-28 bg-muted rounded-xl mb-2 overflow-hidden">
                  {saved.shop?.image_url ? (
                    <img
                      src={saved.shop.image_url}
                      alt={saved.shop?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      🏪
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-sm text-foreground truncate">
                  {saved.shop?.name || 'Unknown Shop'}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {saved.shop?.area}, {saved.shop?.city}
                </p>

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSave(saved.shop_id);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-calm hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Bookmark className="h-4 w-4 fill-current" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </MobileLayout>
  );
};

export default Saved;
