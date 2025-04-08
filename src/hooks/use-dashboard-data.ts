
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/auth';
import { useLeads } from '../hooks/leads/use-leads';
import { useProjects } from '../hooks/use-projects';

export interface DashboardData {
  leadsCount: number;
  totalLeadsCount: number; 
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
  const [totalLeadsCount, setTotalLeadsCount] = useState(0);
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
      
      // Set total leads count for reference only (all leads in the system)
      // This will be shown separately in the UI
      if (allLeads && Array.isArray(allLeads)) {
        console.log('Dashboard data: Total leads in system:', allLeads.length);
        setTotalLeadsCount(allLeads.length);
      }
      
      // Then filter leads by company projects - THIS IS THE PRIMARY COUNTER
      if (projects && Array.isArray(projects) && allLeads && Array.isArray(allLeads)) {
        console.log('Dashboard data: Filtering leads by user company projects');
        
        if (!companyId) {
          console.warn('No company ID available for filtering leads by company');
          setLeadsCount(0);
          setApprovedLeadsCount(0);
          return;
        }
        
        // Get project IDs for the company
        const companyProjectIds = projects
          .filter(project => project.company_id === companyId)
          .map(project => project.id);
        
        console.log(`Found ${companyProjectIds.length} projects for company ID ${companyId}`);
        
        // Filter leads that belong to the company's projects
        const companyLeads = allLeads.filter(lead => 
          lead.project_id && companyProjectIds.includes(lead.project_id)
        );
        
        console.log(`Dashboard data: Found ${companyLeads.length} leads for company projects out of ${allLeads.length} total leads`);
        
        // Set counts based on filtered leads
        setLeadsCount(companyLeads.length);
        
        const approvedCount = companyLeads.filter(lead => 
          lead.extra_data && 
          lead.extra_data.approved === true
        ).length;
        
        setApprovedLeadsCount(approvedCount);
        
        if (projects && projects.length > 0) {
          const companyProjects = projects.filter(p => p.company_id === companyId);
          setActiveProjects(companyProjects.filter(p => p.status === 'in_progress').length);
          setCompletedProjects(companyProjects.filter(p => p.status === 'completed').length);
        }
        
        setLastUpdated(new Date());
        return;
      }

      // Only perform database queries if allLeads is not available
      if (!companyId) {
        console.log('No company ID available, setting zero values');
        setLeadsCount(0);
        setApprovedLeadsCount(0);
        setActiveProjects(0);
        setCompletedProjects(0);
        setLastUpdated(new Date());
        return;
      }

      // This code will only execute if allLeads or projects are not available
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
        // Count leads for the company's projects
        const { count: leadsCountResult, error: leadsError } = await supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .in('project_id', projectIds);
        
        if (leadsError) {
          throw leadsError;
        }
        
        setLeadsCount(leadsCountResult || 0);
        console.log('Database lead count for company projects:', leadsCountResult);
        
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
      
      // Still get the total leads count for reference
      const { count: totalLeadsResult, error: totalLeadsError } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true });
        
      if (totalLeadsError) {
        console.error('Error counting total leads:', totalLeadsError);
      } else {
        setTotalLeadsCount(totalLeadsResult || 0);
        console.log('Total leads in system from database:', totalLeadsResult);
      }
      
      setLastUpdated(new Date());
      
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setError('Es gab ein Problem beim Laden der Dashboard-Daten. Bitte aktualisieren Sie die Seite oder versuchen Sie es später erneut.');
      
      // Fallback - show zeros if data fetch fails
      setLeadsCount(0);
      setTotalLeadsCount(0);
      setApprovedLeadsCount(0);
      setActiveProjects(0);
      setCompletedProjects(0);
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
      totalLeadsCount,
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
