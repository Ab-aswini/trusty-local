import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Shop } from '@/types/database';
import { toast } from '@/hooks/use-toast';

export function useVendorShop() {
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchShop = useCallback(async () => {
    if (!user) {
      setShop(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setShop(data as Shop | null);
    } catch (err) {
      console.error('Error fetching vendor shop:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchShop();
  }, [fetchShop]);

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

  return { shop, isLoading, createShop, updateShop, refetch: fetchShop };
}
