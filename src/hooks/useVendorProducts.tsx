import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/database';

export function useProducts(shopId: string | undefined) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!shopId) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('shop_id', shopId)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data as Product[]);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [shopId]);

  return { products, isLoading };
}

export function useVendorProducts(shopId: string | undefined) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    if (!shopId) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data as Product[]);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (productData: {
    name: string;
    shop_id: string;
    description?: string | null;
    category?: string | null;
    price_type?: 'fixed' | 'range' | 'discount' | 'enquiry';
    price_fixed?: number | null;
    price_min?: number | null;
    price_max?: number | null;
    price_original?: number | null;
    price_discounted?: number | null;
  }) => {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        shop_id: productData.shop_id,
        description: productData.description,
        category: productData.category,
        price_type: productData.price_type || 'enquiry',
        price_fixed: productData.price_fixed,
        price_min: productData.price_min,
        price_max: productData.price_max,
        price_original: productData.price_original,
        price_discounted: productData.price_discounted,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
  };

  return { products, isLoading, createProduct, updateProduct, deleteProduct, refetch: fetchProducts };
}
