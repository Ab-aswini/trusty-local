import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface VendorApplication {
  id: string;
  name: string;
  owner_id: string;
  whatsapp_number: string;
  city: string;
  area: string;
  story: string | null;
  image_url: string | null;
  vendor_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  gst_number: string | null;
  udyam_number: string | null;
}

export const useAdminVendors = () => {
  const [vendors, setVendors] = useState<VendorApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const fetchVendors = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('shops')
        .select('id, name, owner_id, whatsapp_number, city, area, story, image_url, vendor_status, created_at, gst_number, udyam_number')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('vendor_status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setVendors(data as VendorApplication[]);
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vendor applications',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const approveVendor = async (shopId: string) => {
    try {
      const { error } = await supabase
        .from('shops')
        .update({ vendor_status: 'approved' })
        .eq('id', shopId);

      if (error) throw error;

      // Add vendor role to shop owner
      const shop = vendors.find(v => v.id === shopId);
      if (shop) {
        await supabase
          .from('user_roles')
          .upsert({ user_id: shop.owner_id, role: 'vendor' }, { onConflict: 'user_id,role' });
      }

      toast({ title: 'Vendor approved successfully' });
      fetchVendors();
    } catch (error: any) {
      console.error('Error approving vendor:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve vendor',
        variant: 'destructive',
      });
    }
  };

  const rejectVendor = async (shopId: string, reason?: string) => {
    try {
      const { error } = await supabase
        .from('shops')
        .update({ 
          vendor_status: 'rejected',
          warning_reason: reason || 'Application rejected by admin'
        })
        .eq('id', shopId);

      if (error) throw error;

      toast({ title: 'Vendor application rejected' });
      fetchVendors();
    } catch (error: any) {
      console.error('Error rejecting vendor:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject vendor',
        variant: 'destructive',
      });
    }
  };

  return {
    vendors,
    isLoading,
    filter,
    setFilter,
    approveVendor,
    rejectVendor,
    refetch: fetchVendors,
  };
};
