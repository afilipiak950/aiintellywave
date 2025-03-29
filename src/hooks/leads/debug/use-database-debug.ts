
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useDatabaseDebug = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const debugDatabaseAccess = async () => {
    try {
      console.log('Checking database access...');
      setLoading(true);
      setDebugInfo({ status: 'loading' });
      
      const { data: authSession } = await supabase.auth.getSession();
      
      // Debug data structure
      const debugData: any = {
        auth: {
          isAuthenticated: !!authSession?.session,
          userId: authSession?.session?.user?.id,
          email: authSession?.session?.user?.email,
        }
      };
      
      // Test RLS policies with Edge Function
      try {
        console.log('Testing RLS policies with Edge Function...');
        const { data: rlsCheckData, error: rlsCheckError } = await supabase.functions.invoke('check-rls');
        
        if (rlsCheckError) {
          console.error('Error checking RLS policies:', rlsCheckError);
          debugData.rls_check = { 
            success: false,
            error: rlsCheckError.message
          };
        } else {
          console.log('RLS check results:', rlsCheckData);
          debugData.rls_check = { 
            success: true,
            data: rlsCheckData
          };
        }
      } catch (rlsError) {
        console.error('Exception checking RLS policies:', rlsError);
        debugData.rls_check = { 
          success: false,
          error: rlsError.message
        };
      }
      
      // Test direct leads access - check count first
      const { count: leadsCount, error: countError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });
        
      debugData.leads_count = { 
        success: !countError, 
        count: leadsCount || 0,
        error: countError ? countError.message : null
      };
        
      // Test direct leads access
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .limit(5);
        
      debugData.leads = { 
        success: !leadsError, 
        count: leadsData?.length || 0,
        error: leadsError ? leadsError.message : null,
        data: leadsData
      };
      
      // Test Excel leads access
      const { data: excelLeadsData, error: excelLeadsError, count: excelLeadsCount } = await supabase
        .from('project_excel_data')
        .select('*', { count: 'exact' });
        
      debugData.excel_leads = { 
        success: !excelLeadsError, 
        count: excelLeadsCount || 0,
        error: excelLeadsError ? excelLeadsError.message : null,
        data: excelLeadsData?.slice(0, 5) // Just show first 5 for brevity
      };
      
      // Total leads count (regular + excel)
      debugData.total_leads_count = (leadsCount || 0) + (excelLeadsCount || 0);
      
      console.log('Excel leads query result:', debugData.excel_leads);
      
      // Test projects access
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, company_id, assigned_to')
        .limit(5);
        
      debugData.projects = { 
        success: !projectsError, 
        count: projectsData?.length || 0,
        error: projectsError ? projectsError.message : null,
        data: projectsData
      };
      
      console.log('Projects query result:', debugData.projects);
      
      // Check if the user has any lead filters applied
      debugData.filters = {
        fromLocalStorage: {
          searchTerm: localStorage.getItem('leadSearchTerm'),
          statusFilter: localStorage.getItem('leadStatusFilter'),
          projectFilter: localStorage.getItem('leadProjectFilter')
        }
      };
      
      // Check RLS policies on project_excel_data
      try {
        const { count: excelCount, error: excelCountError } = await supabase
          .from('project_excel_data')
          .select('*', { count: 'exact', head: true });
          
        debugData.excel_count_check = { 
          success: !excelCountError, 
          count: excelCount || 0,
          error: excelCountError ? excelCountError.message : null
        };
      } catch (err) {
        debugData.excel_count_check = { 
          success: false, 
          error: err.message
        };
      }
      
      setDebugInfo(debugData);
      
      toast({
        title: 'Database Check Complete',
        description: `Projects: ${projectsData?.length || 0}, Leads: ${leadsData?.length || 0}, Excel Leads: ${excelLeadsCount || 0}, Total Leads: ${debugData.total_leads_count}`,
      });
      
      return debugData;
    } catch (err) {
      console.error('Exception in database debug:', err);
      setDebugInfo({ status: 'error', error: err.message });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    debugInfo,
    debugDatabaseAccess,
    loading
  };
};
