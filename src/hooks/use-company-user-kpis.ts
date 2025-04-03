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

        // Diagnostic step: Check user company associations using new RPC function
        const { data: userAssociations, error: associationsError } = await supabase
          .rpc('check_user_company_associations', { user_id_param: user.id });
        
        // Store detailed diagnostic information
        setDiagnosticInfo({
          userId: user.id,
          userEmail: user.email,
          timestamp: new Date().toISOString(),
          associations: userAssociations,
          associationsError
        });

        if (associationsError) {
          console.error('[useCompanyUserKPIs] Error checking associations:', associationsError);
          throw new Error('Failed to check company associations');
        }

        // If no associations found and repair is attempted
        if (!userAssociations || userAssociations.length === 0) {
          if (attemptedRepair) {
            console.warn('[useCompanyUserKPIs] No company associations found after repair attempt');
            
            // Try to repair by creating an association with the first available company
            const { data: defaultCompany, error: companyError } = await supabase
              .from('companies')
              .select('id, name')
              .order('created_at', { ascending: true })
              .limit(1)
              .single();
            
            if (companyError || !defaultCompany) {
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
                is_manager_kpi_enabled: false
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
          } else {
            throw new Error('Your user account is not linked to any company. Please contact your administrator.');
          }
        } else {
          // Prefer companies with manager KPI enabled
          const kpiEnabledCompanies = userAssociations.filter(assoc => assoc.is_manager_kpi_enabled);
          const companyToUse = kpiEnabledCompanies.length > 0 
            ? kpiEnabledCompanies[0] 
            : userAssociations[0];
          
          setCompanyId(companyToUse.company_id);
          
          // Fetch KPI data for the selected company
          await fetchCompanyKPIData(companyToUse.company_id);
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
  
  // Helper function to attempt repair of company_users relationship
  const attemptCompanyUserRepair = async (
    userId: string, 
    companyId: string, 
    email?: string | null, 
    role: string = 'manager', 
    isAdmin: boolean = false
  ) => {
    try {
      console.log('[useCompanyUserKPIs] Attempting to repair company_user relationship...');
      
      // Get user profile information if available
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', userId)
        .maybeSingle();
        
      // Create an entry in company_users table
      const { data: newCompanyUser, error: insertError } = await supabase
        .from('company_users')
        .insert({
          user_id: userId,
          company_id: companyId,
          role: role,
          is_admin: isAdmin,
          email: email || null,
          is_manager_kpi_enabled: true,
          first_name: profileData?.first_name || null,
          last_name: profileData?.last_name || null,
          full_name: profileData ? 
            `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : 
            null,
          avatar_url: profileData?.avatar_url || null
        })
        .select();
      
      if (insertError) {
        console.error('[useCompanyUserKPIs] Failed to repair company_user relationship:', insertError);
        return false;
      }
      
      console.log('[useCompanyUserKPIs] Successfully created company_user relationship:', newCompanyUser);
      
      // Also ensure user has appropriate role in user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert(
          { user_id: userId, role: role },
          { onConflict: 'user_id, role' }
        );
        
      if (roleError) {
        console.error('[useCompanyUserKPIs] Failed to update user_roles:', roleError);
      } else {
        console.log('[useCompanyUserKPIs] User role updated successfully');
      }

      toast({
        title: "Company association fixed",
        description: "Your user account has been successfully linked to a company.",
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error('[useCompanyUserKPIs] Error in attemptCompanyUserRepair:', error);
      return false;
    }
  };

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
