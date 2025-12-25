import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Shop, Category } from '@/types/database';

interface UseShopsOptions {
  categoryId?: string;
  city?: string;
  area?: string;
  searchQuery?: string;
  limit?: number;
}

export interface ShopWithProducts extends Shop {
  products?: {
    id: string;
    name: string;
    image_url: string | null;
    price_type: string;
    price_fixed: number | null;
  }[];
}

export function useShops(options: UseShopsOptions = {}) {
  const [shops, setShops] = useState<ShopWithProducts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShops = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('shops')
        .select(`
          *,
          category:categories(*),
          products(id, name, image_url, price_type, price_fixed)
        `)
        .eq('vendor_status', 'approved')
        .order('created_at', { ascending: false });

      if (options.categoryId) {
        query = query.eq('category_id', options.categoryId);
      }

      if (options.city) {
        query = query.ilike('city', `%${options.city}%`);
      }

      if (options.area) {
        query = query.ilike('area', `%${options.area}%`);
      }

      if (options.searchQuery) {
        query = query.or(`name.ilike.%${options.searchQuery}%,area.ilike.%${options.searchQuery}%`);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Transform the data to match our Shop type
      const transformedShops = (data || []).map(shop => ({
        ...shop,
        category: shop.category as Category | undefined,
        products: (shop.products || []).slice(0, 3), // Limit to 3 products for preview
      })) as ShopWithProducts[];

      setShops(transformedShops);
    } catch (err) {
      console.error('Error fetching shops:', err);
      setError('Unable to load shops. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [options.categoryId, options.city, options.area, options.searchQuery, options.limit]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  return { shops, isLoading, error, refetch: fetchShops };
}

export function useShopById(shopId: string | undefined) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shopId) {
      setIsLoading(false);
      return;
    }

    const fetchShop = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('shops')
          .select(`
            *,
            category:categories(*)
          `)
          .eq('id', shopId)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (data) {
          setShop({
            ...data,
            category: data.category as Category | undefined,
          } as Shop);
        }
      } catch (err) {
        console.error('Error fetching shop:', err);
        setError('Unable to load shop. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchShop();
  }, [shopId]);

  return { shop, isLoading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .or('is_system.eq.true,approved.eq.true')
          .is('parent_id', null)
          .order('name');

        if (error) throw error;
        setCategories((data || []) as Category[]);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading };
}