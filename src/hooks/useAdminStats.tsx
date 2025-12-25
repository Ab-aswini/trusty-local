import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  pendingVendors: number;
  approvedVendors: number;
  reportsThisWeek: number;
  pendingReports: number;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    pendingVendors: 0,
    approvedVendors: 0,
    reportsThisWeek: 0,
    pendingReports: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Fetch vendor counts
      const [pendingVendorsResult, approvedVendorsResult, reportsResult] = await Promise.all([
        supabase
          .from('shops')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_status', 'pending'),
        supabase
          .from('shops')
          .select('id', { count: 'exact', head: true })
          .eq('vendor_status', 'approved'),
        supabase
          .from('reports')
          .select('id, status, created_at'),
      ]);

      // Calculate reports this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const reportsData = reportsResult.data || [];
      const reportsThisWeek = reportsData.filter(
        r => new Date(r.created_at) >= oneWeekAgo
      ).length;
      const pendingReports = reportsData.filter(r => r.status === 'pending').length;

      setStats({
        pendingVendors: pendingVendorsResult.count || 0,
        approvedVendors: approvedVendorsResult.count || 0,
        reportsThisWeek,
        pendingReports,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    refetch: fetchStats,
  };
};
