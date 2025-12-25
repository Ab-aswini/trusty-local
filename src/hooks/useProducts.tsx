import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/database';

export function useProductsByShop(shopId: string | undefined) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shopId) {
      setIsLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('shop_id', shopId)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setProducts((data || []) as Product[]);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Unable to load products.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [shopId]);

  return { products, isLoading, error };
}

export function formatPrice(product: Product): string {
  switch (product.price_type) {
    case 'fixed':
      return product.price_fixed ? `₹${product.price_fixed.toLocaleString()}` : 'Contact for price';
    case 'range':
      if (product.price_min && product.price_max) {
        return `₹${product.price_min.toLocaleString()} – ₹${product.price_max.toLocaleString()}`;
      }
      return 'Contact for price';
    case 'discount':
      if (product.price_original && product.price_discounted) {
        return `₹${product.price_discounted.toLocaleString()}`;
      }
      return 'Contact for price';
    case 'enquiry':
    default:
      return 'Contact for price';
  }
}

export function getOriginalPrice(product: Product): string | null {
  if (product.price_type === 'discount' && product.price_original) {
    return `₹${product.price_original.toLocaleString()}`;
  }
  return null;
}