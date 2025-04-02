
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserKPI {
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
  const [kpis, setKpis] = useState<UserKPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, get the current user to check if they have access
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Not authenticated');
        }

        console.log('Fetching KPI data for user:', user.id);

        // Check if the user has KPI access enabled - handle multiple rows case
        const { data: userData, error: userError } = await supabase
          .from('company_users')
          .select('company_id, is_manager_kpi_enabled')
          .eq('user_id', user.id);

        if (userError) {
          throw userError;
        }

        console.log('User company data:', userData);

        if (!userData || userData.length === 0) {
          throw new Error('User company data not found');
        }

        // Check if any record has KPI enabled
        const hasKpiEnabled = userData.some(record => record.is_manager_kpi_enabled === true);
        console.log('Has KPI enabled:', hasKpiEnabled);
        
        if (!hasKpiEnabled) {
          throw new Error('Manager KPI dashboard is not enabled for this user');
        }

        // Use the first company_id with KPI enabled for fetching KPI data
        const companyIdObj = userData.find(record => record.is_manager_kpi_enabled === true);
        const companyId = companyIdObj?.company_id || userData[0].company_id;
        console.log('Using company ID for KPI data:', companyId);
        
        // Fetch KPI data for the user's company
        const { data: kpiData, error: kpiError } = await supabase
          .rpc('get_company_user_kpis', { company_id_param: companyId });

        if (kpiError) {
          throw kpiError;
        }

        console.log('KPI data fetched:', kpiData);

        // Transform data to ensure numbers
        const formattedData = kpiData.map((kpi: any) => ({
          user_id: kpi.user_id,
          full_name: kpi.full_name || 'Unnamed User',
          email: kpi.email || 'No Email',
          role: kpi.role || 'Unknown',
          projects_count: Number(kpi.projects_count) || 0,
          projects_planning: Number(kpi.projects_planning) || 0,
          projects_active: Number(kpi.projects_active) || 0,
          projects_completed: Number(kpi.projects_completed) || 0,
          campaigns_count: Number(kpi.campaigns_count) || 0,
          leads_count: Number(kpi.leads_count) || 0,
          appointments_count: Number(kpi.appointments_count) || 0
        }));

        setKpis(formattedData);
      } catch (err: any) {
        console.error('Error fetching KPIs:', err);
        setError(err.message || 'Failed to load KPI data');
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, []);

  return { kpis, loading, error };
};
