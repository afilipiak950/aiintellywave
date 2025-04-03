
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

        // Get the company_users records for this user with more detailed logging
        const { data: userCompanies, error: companyUsersError } = await supabase
          .from('company_users')
          .select('company_id, is_manager_kpi_enabled, role, email, is_admin')
          .eq('user_id', user.id);

        if (companyUsersError) {
          console.error('[useCompanyUserKPIs] Error fetching company_users:', companyUsersError);
          throw new Error('Failed to fetch user company data: ' + companyUsersError.message);
        }

        console.log('[useCompanyUserKPIs] User companies data:', userCompanies);

        // Multiple fallback strategies if no company_users record found
        if (!userCompanies || userCompanies.length === 0) {
          console.warn('[useCompanyUserKPIs] No company records found for user:', user.id);
          
          // FALLBACK 1: Try to get user email and find by email
          const { data: authUserData } = await supabase.auth.getUser();
          const userEmail = authUserData?.user?.email;
          console.log('[useCompanyUserKPIs] Current auth user email:', userEmail);
          
          if (userEmail) {
            // Try to find company_users record by email
            const { data: emailLookupData, error: emailLookupError } = await supabase
              .from('company_users')
              .select('company_id, role, is_admin')
              .eq('email', userEmail)
              .maybeSingle();
              
            if (!emailLookupError && emailLookupData) {
              console.log('[useCompanyUserKPIs] Found company_user record by email lookup:', emailLookupData);
              const companyToUse = emailLookupData.company_id;
              setCompanyId(companyToUse);
              
              // Attempt repair: create company_users entry linking this user to this company
              if (attemptedRepair) {
                setRepairStatus('repairing');
                const repaired = await attemptCompanyUserRepair(user.id, companyToUse, userEmail, emailLookupData.role, emailLookupData.is_admin);
                if (repaired) {
                  setRepairStatus('success');
                } else {
                  setRepairStatus('failed');
                }
              }
              
              // Fetch KPI data for this company
              await fetchCompanyKPIData(companyToUse);
              return;
            }
            
            // FALLBACK 2: Try to find the first available company
            const { data: companiesData, error: companiesError } = await supabase
              .from('companies')
              .select('id')
              .order('created_at', { ascending: true })
              .limit(1);
              
            if (!companiesError && companiesData && companiesData.length > 0) {
              console.log('[useCompanyUserKPIs] Found first available company as fallback:', companiesData[0].id);
              
              // Auto-repair for user - create company_users link
              if (attemptedRepair) {
                setRepairStatus('repairing');
                const repaired = await attemptCompanyUserRepair(
                  user.id, 
                  companiesData[0].id, 
                  userEmail, 
                  userEmail?.includes('admin') ? 'admin' : 'manager', 
                  userEmail?.includes('admin')
                );
                if (repaired) {
                  setRepairStatus('success');
                  // If repair succeeded, we can use this company
                  setCompanyId(companiesData[0].id);
                  await fetchCompanyKPIData(companiesData[0].id);
                  return;
                } else {
                  setRepairStatus('failed');
                }
              }
            }
          }
          
          // If we get here, all fallbacks failed
          throw new Error('Your user account is not linked to any company. Please contact your administrator.');
        }

        // Check for KPI enabled records and preferred role
        // First prefer company where user is specifically a manager
        let managerCompanies = userCompanies.filter(record => record.role === 'manager');
        
        // Then look for admin role
        let adminCompanies = userCompanies.filter(record => record.role === 'admin' || record.is_admin === true);
        
        // Then look for is_manager_kpi_enabled flag
        let companiesWithKpiEnabled = userCompanies.filter(record => record.is_manager_kpi_enabled === true);
        
        let companyIdToUse: string;
        
        if (managerCompanies.length > 0) {
          // Prefer companies where user has explicit manager role
          companyIdToUse = managerCompanies[0].company_id;
          console.log('[useCompanyUserKPIs] Using company where user is manager:', companyIdToUse);
        } else if (adminCompanies.length > 0) {
          // Next preference: user is admin
          companyIdToUse = adminCompanies[0].company_id;
          console.log('[useCompanyUserKPIs] Using company where user is admin:', companyIdToUse);
        } else if (companiesWithKpiEnabled.length > 0) {
          // Next preference: KPI explicitly enabled
          companyIdToUse = companiesWithKpiEnabled[0].company_id;
          console.log('[useCompanyUserKPIs] Using company with KPI enabled:', companyIdToUse);
        } else {
          // Fall back to first company as last resort
          companyIdToUse = userCompanies[0].company_id;
          console.log('[useCompanyUserKPIs] Using first available company as fallback:', companyIdToUse);
          
          // Check if the user has appropriate role
          const userHasManagerOrAdminRole = userCompanies.some(record => 
            record.role === 'admin' || record.role === 'manager' || record.is_admin === true
          );
          
          if (!userHasManagerOrAdminRole) {
            throw new Error('Manager KPI dashboard is not enabled for your account. Please contact your administrator.');
          }
        }
        
        setCompanyId(companyIdToUse);
        console.log('[useCompanyUserKPIs] Using company ID for KPI data:', companyIdToUse);
        
        // Fetch KPI data for the selected company
        await fetchCompanyKPIData(companyIdToUse);
        
      } catch (err: any) {
        console.error('[useCompanyUserKPIs] Error:', err);
        
        // Set more user-friendly error message based on the error
        if (err.message.includes('not linked to any company')) {
          setError(err.message);
        } else if (err.message.includes('not enabled for your account')) {
          setError(err.message);
        } else if (err.message.includes('not authenticated')) {
          setError('Please log in to access the Manager KPI dashboard.');
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

  return { 
    kpis, 
    loading, 
    error, 
    companyId, 
    setAttemptedRepair,
    repairStatus
  };
};
