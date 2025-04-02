
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface UserKPIMetrics {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  projects_count: number;
  projects_planning: number;
  projects_active: number;
  projects_completed: number;
  campaigns_count: number;
  leads_count: number;
  appointments_count: number;
}

export const useCompanyUserKPIs = () => {
  const [kpis, setKPIs] = useState<UserKPIMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyUserKPIs = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // First, get the user's company
      const { data: companyData, error: companyError } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (companyError) throw companyError;

      console.log('Fetching KPIs for company:', companyData.company_id);

      // Then fetch KPIs for that company using the RPC function
      // The response is typed as any because the Supabase client doesn't provide proper typing for RPC functions
      const { data, error } = await supabase.rpc(
        'get_company_user_kpis',
        { company_id_param: companyData.company_id }
      );

      if (error) throw error;

      console.log('KPI data received:', data);

      if (Array.isArray(data)) {
        setKPIs(data as UserKPIMetrics[]);
      } else {
        console.error('Unexpected data format:', data);
        setKPIs([]);
      }
    } catch (err: any) {
      console.error('Error fetching company user KPIs:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyUserKPIs();
  }, []);

  return { kpis, loading, error, refetch: fetchCompanyUserKPIs };
};
