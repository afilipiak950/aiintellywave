
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/auth';
import { useLeads } from '../hooks/leads/use-leads';
import { useProjects } from '../hooks/use-projects';

export interface DashboardData {
  leadsCount: number;
  approvedLeadsCount: number;
  activeProjects: number;
  completedProjects: number;
  lastUpdated: Date;
  loading: boolean;
  error: string | null;
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leadsCount, setLeadsCount] = useState(0);
  const [approvedLeadsCount, setApprovedLeadsCount] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [completedProjects, setCompletedProjects] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { allLeads } = useLeads();
  const { projects } = useProjects();
  const retryCount = useRef(0);
  
  useEffect(() => {
    const fetchCompanyId = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching company ID from company_users:', error);
          const { data: projectsData, error: projectsError } = await supabase
            .from('projects')
            .select('company_id')
            .eq('assigned_to', user.id)
            .limit(1);
          
          if (projectsError) {
            console.error('Error fetching company ID from projects:', projectsError);
            return;
          }
          
          if (projectsData && projectsData.length > 0) {
            setCompanyId(projectsData[0].company_id);
            console.log('Retrieved company ID from projects:', projectsData[0].company_id);
            return;
          }
        }
        
        if (data && data.company_id) {
          setCompanyId(data.company_id);
          console.log('Retrieved company ID from company_users:', data.company_id);
        } else {
          if (retryCount.current >= 3) {
            console.warn('Could not retrieve company ID after multiple attempts, using fallback data');
          } else {
            retryCount.current += 1;
            setTimeout(fetchCompanyId, 2000);
          }
        }
      } catch (error) {
        console.error('Error in fetchCompanyId:', error);
      }
    };
    
    fetchCompanyId();
  }, [user]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Log the available data for debugging
      console.log('Dashboard data: allLeads length =', allLeads?.length);
      console.log('Dashboard data: projects =', projects);
      
      // Filter leads that actually belong to this company's projects
      if (allLeads && Array.isArray(allLeads) && projects && Array.isArray(projects)) {
        const projectIds = projects.map(project => project.id);
        const filteredLeads = allLeads.filter(lead => 
          lead.project_id && projectIds.includes(lead.project_id)
        );
        
        console.log(`Dashboard data: filtered leads count = ${filteredLeads.length} (from ${allLeads.length} total)`);
        
        // Use the filtered leads count
        setLeadsCount(filteredLeads.length);
        
        const approvedCount = filteredLeads.filter(lead => 
          lead.extra_data && 
          lead.extra_data.approved === true
        ).length;
        
        setApprovedLeadsCount(approvedCount);
        
        if (projects && projects.length > 0) {
          setActiveProjects(projects.filter(p => p.status === 'in_progress').length);
          setCompletedProjects(projects.filter(p => p.status === 'completed').length);
        }
        
        setLastUpdated(new Date());
        return;
      }

      // Only perform database queries if allLeads or projects are not available
      if (!companyId) {
        console.log('No company ID available, setting zero values');
        setLeadsCount(0);
        setApprovedLeadsCount(0);
        setActiveProjects(projects?.length || 0);
        setCompletedProjects(0);
        setLastUpdated(new Date());
        return;
      }

      // This code will only execute if allLeads is not available
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, status')
        .eq('company_id', companyId);
      
      if (projectsError) {
        throw projectsError;
      }
      
      const projectIds = projectsData?.map(p => p.id) || [];
      setActiveProjects(projectsData?.filter(p => p.status === 'in_progress').length || 0);
      setCompletedProjects(projectsData?.filter(p => p.status === 'completed').length || 0);
      
      if (projectIds.length > 0) {
        // Only count the leads that are actually associated with this company's projects
        const { count: leadsCountResult, error: leadsError } = await supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .in('project_id', projectIds);
        
        if (leadsError) {
          throw leadsError;
        }
        
        setLeadsCount(leadsCountResult || 0);
        console.log('Database lead count:', leadsCountResult);
        
        // Count approved leads
        const { count: approvedLeadsCountResult, error: approvedLeadsError } = await supabase
          .from('project_excel_data')
          .select('id', { count: 'exact', head: true })
          .in('project_id', projectIds)
          .eq('approval_status', 'approved');
        
        if (approvedLeadsError) {
          throw approvedLeadsError;
        }
        
        const { count: approvedLeadsExtraData, error: approvedExtraError } = await supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .in('project_id', projectIds)
          .containedBy('extra_data', { approved: true });
          
        if (approvedExtraError) {
          console.error('Error counting approved leads:', approvedExtraError);
        }
        
        setApprovedLeadsCount((approvedLeadsCountResult || 0) + (approvedLeadsExtraData || 0));
      } else {
        setLeadsCount(0);
        setApprovedLeadsCount(0);
      }
      
      setLastUpdated(new Date());
      
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setError('Es gab ein Problem beim Laden der Dashboard-Daten. Bitte aktualisieren Sie die Seite oder versuchen Sie es später erneut.');
      
      // Fallback to allLeads if available
      if (allLeads && Array.isArray(allLeads) && projects && Array.isArray(projects)) {
        const projectIds = projects.map(project => project.id);
        const filteredLeads = allLeads.filter(lead => 
          lead.project_id && projectIds.includes(lead.project_id)
        );
        
        setLeadsCount(filteredLeads.length);
        setApprovedLeadsCount(filteredLeads.filter(lead => lead.extra_data?.approved === true).length || 0);
      } else {
        setLeadsCount(0);
        setApprovedLeadsCount(0);
      }
      
      setActiveProjects(projects?.filter(p => p.status === 'in_progress').length || 0);
      setCompletedProjects(projects?.filter(p => p.status === 'completed').length || 0);
    } finally {
      setLoading(false);
    }
  }, [companyId, allLeads, projects, retryCount]);
  
  // Load dashboard data when dependencies change
  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time subscriptions
    const leadsChannel = supabase.channel('customer-dashboard-leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        console.log('Leads data changed, refreshing dashboard');
        loadDashboardData();
      })
      .subscribe();
      
    const projectsChannel = supabase.channel('customer-dashboard-projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        console.log('Projects data changed, refreshing dashboard');
        loadDashboardData();
      })
      .subscribe();
      
    const excelDataChannel = supabase.channel('customer-dashboard-excel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_excel_data' }, () => {
        console.log('Excel data changed, refreshing dashboard');
        loadDashboardData();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(leadsChannel);
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(excelDataChannel);
    };
  }, [companyId, loadDashboardData]);
  
  const handleRefresh = () => {
    loadDashboardData();
    setRefreshTrigger(prev => prev + 1);
  };
  
  return {
    dashboardData: {
      leadsCount,
      approvedLeadsCount,
      activeProjects,
      completedProjects,
      lastUpdated,
      loading,
      error
    },
    handleRefresh,
    refreshTrigger
  };
};
