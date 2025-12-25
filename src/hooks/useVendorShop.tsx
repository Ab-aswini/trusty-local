import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Shop } from '@/types/database';
import { toast } from '@/hooks/use-toast';

export function useVendorShop() {
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [allShops, setAllShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchShops = useCallback(async () => {
    if (!user) {
      setShop(null);
      setAllShops([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const shops = (data as Shop[]) || [];
      setAllShops(shops);
      
      // Set current shop to first one if not already selected
      if (shops.length > 0 && !shop) {
        setShop(shops[0]);
      } else if (shop) {
        // Refresh current shop data
        const updated = shops.find(s => s.id === shop.id);
        if (updated) setShop(updated);
        else if (shops.length > 0) setShop(shops[0]);
      }
    } catch (err) {
      console.error('Error fetching vendor shops:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const selectShop = (selectedShop: Shop) => {
    setShop(selectedShop);
  };

  const createShop = async (shopData: { name: string; whatsapp_number: string; city: string; area: string; story?: string; established_year?: number }) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('shops')
      .insert({
        name: shopData.name,
        whatsapp_number: shopData.whatsapp_number,
        city: shopData.city,
        area: shopData.area,
        story: shopData.story || null,
        established_year: shopData.established_year || null,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    setShop(data as Shop);
    await fetchShops(); // Refresh all shops
    return data;
  };

  const updateShop = async (updates: Partial<Shop>) => {
    if (!shop) throw new Error('No shop found');

    const { data, error } = await supabase
      .from('shops')
      .update(updates)
      .eq('id', shop.id)
      .select()
      .single();

    if (error) throw error;
    setShop(data as Shop);
    return data;
  };

  return { 
    shop, 
    allShops,
    isLoading, 
    createShop, 
    updateShop, 
    selectShop,
    refetch: fetchShops 
  };
}
