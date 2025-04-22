
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
        status: 'success'
      };
      
      // 1. Check company association
      const { data: companyData, error: companyError } = await supabase
        .from('company_users')
        .select('company_id, company:company_id(id, name), role, is_admin')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (companyError) {
        results.company = { error: companyError.message };
      } else {
        results.company = companyData;
      }
      
      const companyId = companyData?.company_id;
      
      // 2. Get projects for this company
      if (companyId) {
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('id, name, status, created_at')
          .eq('company_id', companyId);
        
        if (projectsError) {
          results.projects = { error: projectsError.message };
        } else {
          results.projects = {
            count: projects.length,
            items: projects.map(p => ({ id: p.id, name: p.name, status: p.status }))
          };
          
          // 3. Check leads for each project
          const projectLeadCounts = [];
          let totalLeads = 0;
          
          for (const project of projects) {
            const { data: leads, error: leadsError } = await supabase
              .from('leads')
              .select('id')
              .eq('project_id', project.id);
              
            if (leadsError) {
              projectLeadCounts.push({ 
                projectId: project.id, 
                projectName: project.name,
                error: leadsError.message 
              });
            } else {
              projectLeadCounts.push({ 
                projectId: project.id, 
                projectName: project.name,
                leadCount: leads.length 
              });
              totalLeads += leads.length;
            }
          }
          
          results.leads = {
            count: totalLeads,
            byProject: projectLeadCounts
          };
        }
      }
      
      // 4. Check excel leads
      const { data: excelData, error: excelError } = await supabase
        .from('project_excel_data')
        .select('id, project_id, project:project_id(name)')
        .limit(10);
        
      if (excelError) {
        results.excel_leads = { error: excelError.message };
      } else {
        results.excel_leads = {
          count: excelData.length,
          sample: excelData.slice(0, 5).map(row => ({
            id: row.id,
            projectId: row.project_id,
            projectName: row.project?.name
          }))
        };
      }
      
      // 5. Check excel count by project if we have projects
      if (results.projects?.items?.length > 0) {
        results.excel_count_check = [];
        
        for (const project of results.projects.items) {
          const { data: excelCount, error: excelCountError } = await supabase
            .from('project_excel_data')
            .select('id', { count: 'exact' })
            .eq('project_id', project.id);
            
          if (excelCountError) {
            results.excel_count_check.push({
              projectId: project.id,
              projectName: project.name,
              error: excelCountError.message
            });
          } else {
            results.excel_count_check.push({
              projectId: project.id,
              projectName: project.name,
              excelRowCount: excelCount.length
            });
          }
        }
      }
      
      // 6. Get RLS policies info (for debugging)
      try {
        const { data: rlsData, error: rlsError } = await supabase
          .rpc('get_rls_policies_info', { 
            table_name: 'leads'
          });
          
        if (rlsError) {
          results.rls = { error: rlsError.message };
        } else {
          results.rls = rlsData;
        }
      } catch (e) {
        results.rls = { 
          error: "RPC function not available",
          info: "This is an advanced debugging feature that requires a special function on the server."
        };
      }
      
      // 7. Check filter settings from localStorage
      try {
        results.filters = {
          projectFilter: localStorage.getItem('leadProjectFilter'),
          statusFilter: localStorage.getItem('leadStatusFilter'),
          searchTerm: localStorage.getItem('leadSearchTerm')
        };
      } catch (e) {
        results.filters = { error: 'Could not access localStorage' };
      }
      
      // Finally, calculate total leads count
      results.total_leads_count = (results.leads?.count || 0) + (results.excel_leads?.count || 0);
      
      setDebugInfo(results);
    } catch (error) {
      console.error('Debug error:', error);
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
    debugInfo,
    loading
  };
};
