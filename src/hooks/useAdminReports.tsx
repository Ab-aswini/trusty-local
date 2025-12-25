import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Report {
  id: string;
  shop_id: string;
  reporter_id: string | null;
  reason: string;
  details: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  shop?: {
    name: string;
    city: string;
    area: string;
  };
}

export const useAdminReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('pending');

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('reports')
        .select(`
          id, 
          shop_id, 
          reporter_id, 
          reason, 
          details, 
          status, 
          admin_notes, 
          created_at, 
          resolved_at, 
          resolved_by,
          shops:shop_id (name, city, area)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform data to flatten shops relationship
      const transformedData = data?.map(report => ({
        ...report,
        shop: Array.isArray(report.shops) ? report.shops[0] : report.shops,
      })) || [];
      
      setReports(transformedData as Report[]);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reports',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const resolveReport = async (reportId: string, adminNotes: string, action: 'warn' | 'suspend' | 'none') => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      // Update report status
      const { error: reportError } = await supabase
        .from('reports')
        .update({
          status: 'resolved',
          admin_notes: adminNotes,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (reportError) throw reportError;

      // Apply action to shop if needed
      if (action === 'warn') {
        await supabase
          .from('shops')
          .update({ 
            warning_level: 'warning',
            warning_reason: adminNotes 
          })
          .eq('id', report.shop_id);
      } else if (action === 'suspend') {
        await supabase
          .from('shops')
          .update({ 
            warning_level: 'suspended',
            warning_reason: adminNotes 
          })
          .eq('id', report.shop_id);
      }

      toast({ title: 'Report resolved successfully' });
      fetchReports();
    } catch (error: any) {
      console.error('Error resolving report:', error);
      toast({
        title: 'Error',
        description: 'Failed to resolve report',
        variant: 'destructive',
      });
    }
  };

  const dismissReport = async (reportId: string, adminNotes?: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status: 'dismissed',
          admin_notes: adminNotes || 'Report dismissed by admin',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({ title: 'Report dismissed' });
      fetchReports();
    } catch (error: any) {
      console.error('Error dismissing report:', error);
      toast({
        title: 'Error',
        description: 'Failed to dismiss report',
        variant: 'destructive',
      });
    }
  };

  return {
    reports,
    isLoading,
    filter,
    setFilter,
    resolveReport,
    dismissReport,
    refetch: fetchReports,
  };
};
