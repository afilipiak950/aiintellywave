import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';
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

// Error status for better error handling and display
type ErrorStatus = 'no_company' | 'not_manager' | 'kpi_disabled' | 'other';

export const useCompanyUserKPIs = () => {
  const [kpis, setKpis] = useState<UserKPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<ErrorStatus | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [attemptedRepair, setAttemptedRepair] = useState(false);
  const [repairStatus, setRepairStatus] = useState<'idle' | 'repairing' | 'success' | 'failed'>('idle');
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);

  // Enhanced fetch function with better diagnostic info and error handling
  const fetchKPIs = useCallback(async () => {
    try {
      console.log('[useCompanyUserKPIs] Starting to fetch KPI data...');
      setLoading(true);
      setError(null);
      setErrorStatus(null);

      // Get the current authenticated user
      const user = await getAuthUser();
      
      if (!user) {
        console.error('[useCompanyUserKPIs] Not authenticated');
        throw new Error('Not authenticated');
      }

      console.log('[useCompanyUserKPIs] Fetching KPI data for user ID:', user.id);

      // Check all potential company associations for this user with detailed logging
      console.log('[useCompanyUserKPIs] Querying company_users table for user:', user.id);
      
      // Important: Use the company_users table directly with cache-busting headers
      const { data: userCompanyData, error: companyError } = await supabase
        .from('company_users')
        .select('company_id, role, is_admin, is_manager_kpi_enabled, companies:company_id(name)')
        .eq('user_id', user.id)
        .headers({
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        });
      
      if (companyError) {
        console.error('[useCompanyUserKPIs] Error checking company association:', companyError);
        throw new Error('Failed to check company association: ' + companyError.message);
      }

      console.log('[useCompanyUserKPIs] Company associations found:', userCompanyData?.length || 0);
      console.log('[useCompanyUserKPIs] Company data:', userCompanyData);

      // Store detailed diagnostic information
      setDiagnosticInfo({
        userId: user.id,
        userEmail: user.email,
        timestamp: new Date().toISOString(),
        associations: userCompanyData || [],
        companyUserResults: userCompanyData?.length || 0,
        queryDetails: {
          table: 'company_users',
          condition: `user_id = '${user.id}'`,
          resultCount: userCompanyData?.length || 0
        }
      });

      // Handle case where no company associations exist
      if (!userCompanyData || userCompanyData.length === 0) {
        console.warn('[useCompanyUserKPIs] No company_users records found for user:', user.id);
        setErrorStatus('no_company');
        
        if (attemptedRepair) {
          await attemptCompanyRepair(user.id, user.email);
        } else {
          throw new Error('Your user account is not linked to any company. Please contact your administrator or click "Auto-Repair Association" to fix this issue.');
        }
      } else {
        // Get the most appropriate company ID from user's associations using enhanced prioritization
        let primaryCompany = findBestCompanyMatch(userCompanyData);
        
        if (!primaryCompany) {
          console.warn('[useCompanyUserKPIs] Could not determine primary company');
          setErrorStatus('no_company');
          throw new Error('Could not determine your primary company. Please contact your administrator.');
        }
        
        const companyIdToUse = primaryCompany.company_id;
        const companyRole = primaryCompany.role;
        const kpiEnabled = primaryCompany.is_manager_kpi_enabled;
        const companyName = primaryCompany.companies?.name || 'Unknown Company';
        
        console.log(`[useCompanyUserKPIs] Selected company: ${companyIdToUse} (${companyName})`);
        console.log(`[useCompanyUserKPIs] User role: ${companyRole}, KPI Enabled: ${kpiEnabled}`);
        
        setCompanyId(companyIdToUse);
        
        // Check if user is actually a manager or has KPI enabled
        if (companyRole !== 'manager' && companyRole !== 'admin' && !kpiEnabled) {
          console.warn(`[useCompanyUserKPIs] User is not a manager (role: ${companyRole}) and KPI is not enabled`);
          setErrorStatus('not_manager');
          throw new Error(`You do not have manager permissions in ${companyName}. Please contact your administrator.`);
        }
        
        if (!kpiEnabled) {
          console.warn(`[useCompanyUserKPIs] Manager KPI is not enabled for this user`);
          setErrorStatus('kpi_disabled');
          throw new Error(`The Manager KPI dashboard has been disabled for your account in ${companyName}. Please contact your administrator.`);
        }
        
        // Fetch KPI data for the selected company
        await fetchCompanyKPIData(companyIdToUse);
      }
      
    } catch (err: any) {
      console.error('[useCompanyUserKPIs] Error:', err);
      
      setError(err.message || 'Failed to load KPI data');
      if (!errorStatus) {
        setErrorStatus('other');
      }
      
      toast({
        title: "Error loading KPI data",
        description: err.message || "Could not load Manager KPI dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [attemptedRepair]);

  // Function to find best company match from user's associations
  const findBestCompanyMatch = (userCompanyData: any[]) => {
    // First try to find explicitly marked primary company
    let primaryCompany = userCompanyData.find(c => 
      c.role === 'manager' && c.is_manager_kpi_enabled === true
    );
    
    if (!primaryCompany) {
      primaryCompany = userCompanyData.find(c => c.is_manager_kpi_enabled === true);
    }
    
    if (!primaryCompany) {
      primaryCompany = userCompanyData.find(c => c.role === 'manager');
    }
    
    if (!primaryCompany) {
      primaryCompany = userCompanyData.find(c => c.role === 'admin' || c.is_admin === true);
    }
    
    if (!primaryCompany) {
      primaryCompany = userCompanyData[0]; // fallback to the first one if no priority match
    }
    
    return primaryCompany;
  };

  // Function to attempt to repair company association
  const attemptCompanyRepair = async (userId: string, userEmail: string | undefined) => {
    setRepairStatus('repairing');
    console.log('[useCompanyUserKPIs] Attempting to repair company association...');
    
    try {
      // Try to repair by creating an association with the first available company
      const { data: defaultCompany, error: companyError } = await supabase
        .from('companies')
        .select('id, name')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
      
      if (companyError || !defaultCompany) {
        console.error('[useCompanyUserKPIs] No companies available for repair:', companyError);
        setRepairStatus('failed');
        throw new Error('No companies available for association. Please create a company first.');
      }

      console.log('[useCompanyUserKPIs] Found company for repair:', defaultCompany);

      // Attempt to create a company user entry
      const { data: newCompanyUser, error: insertError } = await supabase
        .from('company_users')
        .insert({
          user_id: userId,
          company_id: defaultCompany.id,
          role: 'manager', // Set as manager since they're accessing the manager dashboard
          email: userEmail,
          is_admin: false,
          is_manager_kpi_enabled: true,  // Enable manager KPI for repaired user
          is_primary_company: true       // Mark as primary company
        })
        .select();
      
      if (insertError) {
        console.error('[useCompanyUserKPIs] Failed to create company user:', insertError);
        setRepairStatus('failed');
        throw new Error('Could not automatically link user to a company: ' + insertError.message);
      }

      console.log('[useCompanyUserKPIs] Successfully created company association:', newCompanyUser);
      setRepairStatus('success');
      setCompanyId(defaultCompany.id);
      
      toast({
        title: "Company Association Fixed",
        description: `Linked to ${defaultCompany.name}`,
        variant: "default"
      });
      
      // Now fetch KPI data with the newly created association
      await fetchCompanyKPIData(defaultCompany.id);
    } catch (error: any) {
      console.error('[useCompanyUserKPIs] Repair failed:', error);
      setRepairStatus('failed');
      throw error; // Rethrow to be caught by the parent try/catch
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

      if (!kpiData || kpiData.length === 0) {
        console.warn('[useCompanyUserKPIs] No KPI data returned for this company');
        toast({
          title: "No KPI Data",
          description: "No KPI data available for your company. This is normal for new accounts.",
          variant: "default" 
        });
        
        // Return empty array with zero values instead of showing fake data
        setKpis([]);
        return;
      }

      // Transform data to ensure correct number formatting
      const formattedData = (kpiData || []).map((kpi: any) => ({
        user_id: kpi.user_id,
        full_name: kpi.full_name || 'Unnamed User',
        email: kpi.email || 'No Email',
        role: kpi.role || 'Unknown',
        projects_count: Number(kpi.projects_count || 0),
        projects_planning: Number(kpi.projects_planning || 0),
        projects_active: Number(kpi.projects_active || 0),
        projects_completed: Number(kpi.projects_completed || 0),
        campaigns_count: Number(kpi.campaigns_count || 0),
        leads_count: Number(kpi.leads_count || 0),
        appointments_count: Number(kpi.appointments_count || 0)
      }));

      setKpis(formattedData);
    } catch (error: any) {
      throw error; // Rethrow to be caught by the parent try/catch
    }
  };

  // Fetch KPIs on component mount or when repair is attempted
  useEffect(() => {
    fetchKPIs();
  }, [fetchKPIs, attemptedRepair]);

  return { 
    kpis, 
    loading, 
    error, 
    errorStatus,
    companyId, 
    setAttemptedRepair,
    repairStatus,
    diagnosticInfo,
    refreshData: fetchKPIs
  };
};
