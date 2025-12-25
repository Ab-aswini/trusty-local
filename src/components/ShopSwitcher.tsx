import { Shop } from '@/types/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Store, ChevronDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ShopSwitcherProps {
  shops: Shop[];
  currentShop: Shop;
  onSelectShop: (shop: Shop) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ShopSwitcher = ({ shops, currentShop, onSelectShop, isOpen, onOpenChange }: ShopSwitcherProps) => {
  const navigate = useNavigate();

  const handleSelect = (shop: Shop) => {
    onSelectShop(shop);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle>Select Shop</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {shops.map(shop => (
            <button
              key={shop.id}
              onClick={() => handleSelect(shop)}
              className={`w-full p-3 rounded-xl flex items-center gap-3 text-left transition-calm ${
                shop.id === currentShop.id 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'bg-muted/50 hover:bg-muted border border-transparent'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                {shop.image_url ? (
                  <img src={shop.image_url} alt={shop.name} className="w-full h-full object-cover" />
                ) : (
                  <Store className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{shop.name}</p>
                <p className="text-xs text-muted-foreground truncate">{shop.area}, {shop.city}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    shop.vendor_status === 'approved' ? 'bg-green-500' : 
                    shop.vendor_status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  <span className="text-[10px] text-muted-foreground capitalize">{shop.vendor_status}</span>
                </div>
              </div>
              {shop.id === currentShop.id && (
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        <div className="pt-2 border-t border-border">
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={() => {
              onOpenChange(false);
              navigate('/vendor?create=true');
            }}
          >
            <Plus className="h-4 w-4" />
            Add Another Shop
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Trigger button component
interface ShopSwitcherTriggerProps {
  shop: Shop;
  shopCount: number;
  onClick: () => void;
}

export const ShopSwitcherTrigger = ({ shop, shopCount, onClick }: ShopSwitcherTriggerProps) => {
  if (shopCount <= 1) {
    return (
      <div>
        <h1 className="font-display text-lg font-semibold text-foreground">
          My Portfolio
        </h1>
        <p className="text-xs text-muted-foreground">{shop.name}</p>
      </div>
    );
  }

  return (
    <button 
      onClick={onClick}
      className="text-left hover:bg-muted/50 rounded-lg p-1 -m-1 transition-calm"
    >
      <div className="flex items-center gap-1">
        <h1 className="font-display text-lg font-semibold text-foreground">
          My Portfolio
        </h1>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-xs text-muted-foreground">
        {shop.name} · {shopCount} shops
      </p>
    </button>
  );
};

export default ShopSwitcher;
