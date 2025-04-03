
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

        // First, get the current authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Auth error:', userError);
          throw new Error('Authentication error: ' + userError.message);
        }
        
        if (!user) {
          throw new Error('Not authenticated');
        }

        console.log('Fetching KPI data for user ID:', user.id);

        // Get the company_users records for this user with more detailed logging
        const { data: userCompanies, error: companyUsersError } = await supabase
          .from('company_users')
          .select('company_id, is_manager_kpi_enabled, role, email')
          .eq('user_id', user.id);

        if (companyUsersError) {
          console.error('Error fetching company_users:', companyUsersError);
          throw new Error('Failed to fetch user company data: ' + companyUsersError.message);
        }

        console.log('User companies data:', userCompanies);

        if (!userCompanies || userCompanies.length === 0) {
          console.error('No company records found for user:', user.id);
          throw new Error('User company data not found');
        }

        // Check for KPI enabled records
        const companiesWithKpiEnabled = userCompanies.filter(record => record.is_manager_kpi_enabled === true);
        console.log('Companies with KPI enabled:', companiesWithKpiEnabled);

        if (companiesWithKpiEnabled.length === 0) {
          // If no companies have KPI explicitly enabled, check if user is admin or manager
          // which might implicitly grant access
          const isAdminOrManager = userCompanies.some(record => 
            record.role === 'admin' || record.role === 'manager'
          );
          
          if (isAdminOrManager) {
            console.log('User is admin/manager but no companies have KPI explicitly enabled. Using first company.');
            // Use the first company_id for admin/manager users even if KPI not explicitly enabled
          } else {
            throw new Error('Manager KPI dashboard is not enabled for this user');
          }
        }
        
        // Use the first available company (either with KPI enabled, or first if admin/manager)
        const companyIdToUse = companiesWithKpiEnabled.length > 0 
          ? companiesWithKpiEnabled[0].company_id 
          : userCompanies[0].company_id;
          
        console.log('Using company ID for KPI data:', companyIdToUse);
        
        // Fetch KPI data for the selected company
        const { data: kpiData, error: kpiError } = await supabase
          .rpc('get_company_user_kpis', { company_id_param: companyIdToUse });

        if (kpiError) {
          console.error('Error fetching KPI data:', kpiError);
          throw new Error('Failed to load KPI data: ' + kpiError.message);
        }

        console.log('KPI data fetched:', kpiData ? kpiData.length : 0, 'records');

        // Transform data to ensure correct number formatting
        const formattedData = (kpiData || []).map((kpi: any) => ({
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
        console.error('Error in useCompanyUserKPIs:', err);
        
        // Set more user-friendly error message based on the error
        if (err.message.includes('User company data not found')) {
          setError('Your user account is not linked to any company. Please contact your administrator.');
        } else if (err.message.includes('not enabled for this user')) {
          setError('You do not have access to the Manager KPI dashboard. Please contact your administrator.');
        } else {
          setError(err.message || 'Failed to load KPI data');
        }
        
        toast({
          title: "Error loading KPI data",
          description: err.message || "Could not load Manager KPI dashboard data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, []);

  return { kpis, loading, error };
};
