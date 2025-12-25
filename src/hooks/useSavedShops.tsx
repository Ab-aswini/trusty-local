import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { SavedShop, Shop, Category } from '@/types/database';
import { toast } from '@/hooks/use-toast';

export function useSavedShops() {
  const { user } = useAuth();
  const [savedShops, setSavedShops] = useState<SavedShop[]>([]);
  const [savedShopIds, setSavedShopIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchSavedShops = useCallback(async () => {
    if (!user) {
      setSavedShops([]);
      setSavedShopIds(new Set());
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_shops')
        .select(`
          *,
          shop:shops(*, category:categories(*))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformed = (data || []).map(item => ({
        ...item,
        shop: item.shop ? {
          ...item.shop,
          category: item.shop.category as Category | undefined,
        } as Shop : undefined,
      })) as SavedShop[];

      setSavedShops(transformed);
      setSavedShopIds(new Set(transformed.map(s => s.shop_id)));
    } catch (err) {
      console.error('Error fetching saved shops:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSavedShops();
  }, [fetchSavedShops]);

  const toggleSave = async (shopId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save shops.",
        variant: "destructive",
      });
      return;
    }

    const isSaved = savedShopIds.has(shopId);

    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_shops')
          .delete()
          .eq('user_id', user.id)
          .eq('shop_id', shopId);

        if (error) throw error;

        setSavedShopIds(prev => {
          const next = new Set(prev);
          next.delete(shopId);
          return next;
        });
        setSavedShops(prev => prev.filter(s => s.shop_id !== shopId));
        
        toast({ title: "Removed from saved" });
      } else {
        const { error } = await supabase
          .from('saved_shops')
          .insert({ user_id: user.id, shop_id: shopId });

        if (error) throw error;

        setSavedShopIds(prev => new Set(prev).add(shopId));
        
        toast({ title: "Saved!" });
        fetchSavedShops();
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isShopSaved = (shopId: string) => savedShopIds.has(shopId);

  return { savedShops, isLoading, toggleSave, isShopSaved, refetch: fetchSavedShops };
}