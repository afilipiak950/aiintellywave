
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDatabaseDebug = () => {
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  const debugDatabaseAccess = useCallback(async () => {
    setLoading(true);
    
    try {
      // Get auth info
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setDebugInfo({
          status: 'error',
          error: 'Not authenticated'
        });
        return;
      }
      
      // Initialize debug results
      const results: any = {
        auth: {
          userId: user.id,
          email: user.email,
          lastSignIn: user.last_sign_in_at
        },
        status: 'success',
        timestamp: new Date().toISOString()
      };
      
      // 1. Check company association
      const { data: companyData, error: companyError } = await supabase
        .from('company_users')
        .select('company_id, company:company_id(id, name), role, is_admin')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (companyError) {
        results.company = { 
          error: companyError.message,
          code: companyError.code,
          details: companyError.details
        };
        
        // Try direct database query using functions to bypass RLS
        try {
          const { data: directData, error: directError } = await supabase
            .rpc('check_user_company_associations', { user_id_param: user.id });
            
          if (directError) {
            results.company_direct_query = { error: directError.message };
          } else {
            results.company_direct_query = directData;
          }
        } catch (err) {
          results.company_direct_query = { error: 'Direct query failed' };
        }
      } else {
        results.company = companyData;
      }
      
      const companyId = companyData?.company_id;
      results.current_route = window.location.pathname;
      
      // Try to extract project ID from current route
      const projectIdMatch = window.location.pathname.match(/\/projects\/([^\/]+)/);
      const currentProjectId = projectIdMatch ? projectIdMatch[1] : null;
      
      if (currentProjectId) {
        results.current_project_id = currentProjectId;
        
        // Check if we have access to this specific project
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('id, name, company_id, status')
          .eq('id', currentProjectId)
          .maybeSingle();
          
        if (projectError) {
          results.current_project = { error: projectError.message };
        } else {
          results.current_project = projectData;
          
          // Check leads specifically for this project
          const { data: projectLeads, error: projectLeadsError } = await supabase
            .from('leads')
            .select('id, name')
            .eq('project_id', currentProjectId)
            .limit(10);
            
          if (projectLeadsError) {
            results.current_project_leads = { error: projectLeadsError.message };
          } else {
            results.current_project_leads = {
              count: projectLeads.length,
              sample: projectLeads.slice(0, 5)
            };
          }
        }
      }
      
      // 2. Get projects for this company
      if (companyId) {
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('id, name, status, created_at, company_id')
          .eq('company_id', companyId);
        
        if (projectsError) {
          results.projects = { error: projectsError.message };
        } else {
          results.projects = {
            count: projects.length,
            items: projects.map(p => ({ id: p.id, name: p.name, status: p.status, company_id: p.company_id }))
          };
          
          // 3. Check leads for each project
          const projectLeadCounts = [];
          let totalLeads = 0;
          let successfulProjectQueries = 0;
          
          for (const project of projects) {
            try {
              const { data: leads, error: leadsError } = await supabase
                .from('leads')
                .select('id, name, email, status')
                .eq('project_id', project.id)
                .limit(5);
                
              if (leadsError) {
                projectLeadCounts.push({ 
                  projectId: project.id, 
                  projectName: project.name,
                  error: leadsError.message,
                  errorCode: leadsError.code,
                  errorDetails: leadsError.details 
                });
              } else {
                projectLeadCounts.push({ 
                  projectId: project.id, 
                  projectName: project.name,
                  leadCount: leads.length,
                  leadSample: leads.length > 0 ? leads.slice(0, 2) : [] 
                });
                totalLeads += leads.length;
                successfulProjectQueries++;
              }
            } catch (err) {
              projectLeadCounts.push({ 
                projectId: project.id, 
                projectName: project.name,
                error: err instanceof Error ? err.message : String(err)
              });
            }
          }
          
          results.leads = {
            count: totalLeads,
            successfulProjectQueries,
            failedProjectQueries: projects.length - successfulProjectQueries,
            byProject: projectLeadCounts
          };
        }
      }
      
      // 4. Check RLS policies by trying a direct query
      try {
        // Try to query the RLS-protected project_id column directly
        const { data: projectIdData, error: projectIdError } = await supabase
          .from('projects')
          .select('id')
          .limit(1);
          
        results.rls_test = {
          projects_table: {
            success: !projectIdError,
            error: projectIdError ? projectIdError.message : null
          }
        };
        
        // Try to query leads
        const { data: leadsRlsData, error: leadsRlsError } = await supabase
          .from('leads')
          .select('id')
          .limit(1);
          
        results.rls_test.leads_table = {
          success: !leadsRlsError,
          error: leadsRlsError ? leadsRlsError.message : null
        };
      } catch (e) {
        results.rls_test = { 
          error: "RLS testing failed",
          details: e instanceof Error ? e.message : String(e)
        };
      }
      
      // 5. Direct database query test
      try {
        // Try a direct query to the database using RPC function
        const { data: directData, error: directError } = await supabase
          .rpc('get_user_company_ids_for_auth_user');
          
        if (directError) {
          results.direct_db_query = { error: directError.message };
        } else {
          results.direct_db_query = { 
            result: directData,
            company_ids: directData 
          };
        }
      } catch (e) {
        results.direct_db_query = { 
          error: "Direct DB query failed",
          details: e instanceof Error ? e.message : String(e)
        };
      }
      
      // 6. Check filter settings from localStorage
      try {
        results.filters = {
          projectFilter: localStorage.getItem('leadProjectFilter'),
          statusFilter: localStorage.getItem('leadStatusFilter'),
          searchTerm: localStorage.getItem('leadSearchTerm')
        };
      } catch (e) {
        results.filters = { error: 'Could not access localStorage' };
      }

      // 7. Check browser details (for debugging)
      results.browser = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        localStorage: typeof localStorage !== 'undefined',
        indexedDB: typeof indexedDB !== 'undefined'
      };

      // 8. Report database version and connection info
      try {
        // Use a lightweight query to check connection
        const startTime = Date.now();
        const { data, error } = await supabase.from('system_health').select('health_percentage').limit(1);
        const endTime = Date.now();
        
        results.database_connection = {
          connected: !error,
          error: error ? error.message : null,
          responseTime: endTime - startTime,
          data: data
        };
      } catch (e) {
        results.database_connection = { 
          connected: false,
          error: e instanceof Error ? e.message : String(e)
        };
      }
      
      setDebugInfo(results);
    } catch (error) {
      console.error('Debug error:', error);
      setDebugInfo({
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Add helper for testing direct project access
  const testDirectProjectAccess = useCallback(async (projectId: string) => {
    setLoading(true);
    
    try {
      const results: any = {
        status: 'testing',
        projectId,
        timestamp: new Date().toISOString()
      };
      
      // Test project data access
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();
        
      results.project = {
        success: !projectError,
        error: projectError ? projectError.message : null,
        data: projectData
      };
      
      // Test leads access for this project
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('id, name, email, status')
        .eq('project_id', projectId)
        .limit(10);
        
      results.leads = {
        success: !leadsError,
        error: leadsError ? leadsError.message : null,
        count: leadsData?.length || 0,
        data: leadsData?.slice(0, 3) || []
      };
      
      // Test RLS bypass
      try {
        const { data: rlsData, error: rlsError } = await supabase
          .functions.invoke('check-rls', {
            body: { projectId }
          });
          
        results.rls_bypass = {
          success: !rlsError,
          error: rlsError ? rlsError.message : null,
          data: rlsData
        };
      } catch (e) {
        results.rls_bypass = {
          success: false,
          error: e instanceof Error ? e.message : String(e)
        };
      }
      
      setDebugInfo(results);
    } catch (error) {
      console.error('Project access test error:', error);
      setDebugInfo({
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    debugDatabaseAccess,
    testDirectProjectAccess,
    debugInfo,
    loading
  };
};
