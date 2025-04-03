
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getAuthUser } from '@/utils/auth-utils';

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
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [attemptedRepair, setAttemptedRepair] = useState(false);
  const [repairStatus, setRepairStatus] = useState<'idle' | 'repairing' | 'success' | 'failed'>('idle');
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the current authenticated user
        const user = await getAuthUser();
        
        if (!user) {
          throw new Error('Not authenticated');
        }

        console.log('[useCompanyUserKPIs] Fetching KPI data for user ID:', user.id);

        // Check all potential company associations for this user
        const { data: userCompanyData, error: companyError } = await supabase
          .from('company_users')
          .select('company_id, role, is_admin, is_manager_kpi_enabled, companies:company_id(name)')
          .eq('user_id', user.id);
        
        if (companyError) {
          console.error('[useCompanyUserKPIs] Error checking company association:', companyError);
          throw new Error('Failed to check company association');
        }

        // Store detailed diagnostic information
        setDiagnosticInfo({
          userId: user.id,
          userEmail: user.email,
          timestamp: new Date().toISOString(),
          associations: userCompanyData || [],
          companyUserResults: userCompanyData?.length || 0
        });

        if (!userCompanyData || userCompanyData.length === 0) {
          console.warn('[useCompanyUserKPIs] No company_users records found for user:', user.id);
          
          if (attemptedRepair) {
            setRepairStatus('repairing');
            
            // Try to repair by creating an association with the first available company
            const { data: defaultCompany, error: companyError } = await supabase
              .from('companies')
              .select('id, name')
              .order('created_at', { ascending: true })
              .limit(1)
              .single();
            
            if (companyError || !defaultCompany) {
              setRepairStatus('failed');
              throw new Error('No companies available for association');
            }

            // Attempt to create a company user entry
            const { data: newCompanyUser, error: insertError } = await supabase
              .from('company_users')
              .insert({
                user_id: user.id,
                company_id: defaultCompany.id,
                role: 'customer',
                email: user.email,
                is_admin: false,
                is_manager_kpi_enabled: true  // Enable manager KPI for repaired user
              })
              .select();
            
            if (insertError) {
              console.error('[useCompanyUserKPIs] Failed to create company user:', insertError);
              setRepairStatus('failed');
              throw new Error('Could not automatically link user to a company');
            }

            setRepairStatus('success');
            setCompanyId(defaultCompany.id);
            
            toast({
              title: "Company Association Fixed",
              description: `Linked to ${defaultCompany.name}`,
              variant: "default"
            });
            
            // Now fetch KPI data with the newly created association
            await fetchCompanyKPIData(defaultCompany.id);
          } else {
            throw new Error('Your user account is not linked to any company. Please contact your administrator.');
          }
        } else {
          // Get the most appropriate company ID from user's associations
          // Prioritize companies where the user is a manager or has KPI enabled
          const primaryCompany = userCompanyData.find(c => 
            c.is_manager_kpi_enabled === true || c.role === 'manager' || c.role === 'admin'
          ) || userCompanyData[0]; // fallback to the first one if no priority match
          
          const companyIdToUse = primaryCompany.company_id;
          
          console.log(`[useCompanyUserKPIs] User belongs to company: ${companyIdToUse} (${primaryCompany.companies?.name || 'Unknown'})`);
          
          setCompanyId(companyIdToUse);
          
          // Fetch KPI data for the selected company
          await fetchCompanyKPIData(companyIdToUse);
        }
        
      } catch (err: any) {
        console.error('[useCompanyUserKPIs] Error:', err);
        
        setError(err.message || 'Failed to load KPI data');
        
        toast({
          title: "Error loading KPI data",
          description: err.message || "Could not load Manager KPI dashboard data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    // Helper function to fetch company KPI data
    const fetchCompanyKPIData = async (companyId: string) => {
      try {
        console.log(`[useCompanyUserKPIs] Fetching KPI data for company: ${companyId}`);
        
        const { data: kpiData, error: kpiError } = await supabase
          .rpc('get_company_user_kpis', { company_id_param: companyId });

        if (kpiError) {
          console.error('[useCompanyUserKPIs] Error fetching KPI data:', kpiError);
          throw new Error('Failed to load KPI data: ' + kpiError.message);
        }

        console.log('[useCompanyUserKPIs] KPI data fetched:', kpiData ? kpiData.length : 0, 'records');

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
      } catch (error: any) {
        throw error; // Rethrow to be caught by the parent try/catch
      }
    };

    fetchKPIs();
  }, [attemptedRepair]);

  return { 
    kpis, 
    loading, 
    error, 
    companyId, 
    setAttemptedRepair,
    repairStatus,
    diagnosticInfo
  };
};
