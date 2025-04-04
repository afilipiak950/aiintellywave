
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { toast } from '@/hooks/use-toast';

export interface CustomerDashboardKPIs {
  totalLeads: number;
  activeProjects: number;
  completedProjects: number;
  approvedCandidates: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
}

export const useCustomerDashboard = () => {
  const { user } = useAuth();
  const [kpis, setKPIs] = useState<CustomerDashboardKPIs>({
    totalLeads: 0,
    activeProjects: 0,
    completedProjects: 0,
    approvedCandidates: 0,
    loading: true,
    error: null,
    lastUpdated: new Date()
  });

  const fetchDashboardData = async () => {
    try {
      setKPIs(prev => ({ ...prev, loading: true, error: null }));
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      console.log('Fetching dashboard data for user:', user.id);
      
      // Check if the user is an admin (they might not need a specific company)
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (roleError) {
        console.error('Error checking user role:', roleError);
      }
      
      const isAdmin = userRole?.role === 'admin';
      console.log('User is admin:', isAdmin);
      
      // Get the current user's company ID
      const { data: userCompany, error: companyError } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (companyError) {
        console.error('Error fetching user company:', companyError);
        
        // If admin, we'll load general data instead of throwing an error
        if (isAdmin) {
          console.log('Admin user without company association - loading all data');
          await loadGeneralDataForAdmin();
          return;
        }
        
        throw new Error("Could not fetch user's company");
      }
      
      if (!userCompany?.company_id) {
        // For admins, load general data instead of showing an error
        if (isAdmin) {
          console.log('Admin user without company association - loading all data');
          await loadGeneralDataForAdmin();
          return;
        }
        
        throw new Error("User is not associated with a company");
      }
      
      const companyId = userCompany.company_id;
      console.log('Fetching dashboard data for company:', companyId);
      
      // Get projects for this company
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, status')
        .eq('company_id', companyId);
      
      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        throw new Error("Could not fetch company projects");
      }
      
      // Extract project IDs for lead filtering
      const projectIds = projects ? projects.map(p => p.id) : [];
      
      // Count active and completed projects
      const activeProjects = projects ? projects.filter(p => p.status === 'active').length : 0;
      const completedProjects = projects ? projects.filter(p => p.status === 'completed').length : 0;
      
      // No need to fetch leads if there are no projects
      let totalLeads = 0;
      let approvedCandidates = 0;
      
      if (projectIds.length > 0) {
        // Get total leads count
        const { count: leadsCount, error: leadsCountError } = await supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .in('project_id', projectIds);
        
        if (leadsCountError) {
          console.error('Error counting leads:', leadsCountError);
          throw new Error("Could not count leads");
        }
        
        totalLeads = leadsCount || 0;
        
        // Get approved candidates count
        const { count: approvedCount, error: approvedCountError } = await supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .in('project_id', projectIds)
          .eq('status', 'qualified'); // Using 'qualified' as the closest match to 'approved'
        
        if (approvedCountError) {
          console.error('Error counting approved candidates:', approvedCountError);
          throw new Error("Could not count approved candidates");
        }
        
        approvedCandidates = approvedCount || 0;
      }
      
      // Update state with all fetched data
      setKPIs({
        totalLeads,
        activeProjects,
        completedProjects,
        approvedCandidates,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
      
      console.log('Dashboard data loaded:', { totalLeads, activeProjects, completedProjects, approvedCandidates });
      
    } catch (error: any) {
      console.error('Error in fetchDashboardData:', error);
      
      setKPIs(prev => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to load dashboard data"
      }));
      
      toast({
        title: "Dashboard Error",
        description: error.message || "Failed to load dashboard data",
        variant: "destructive"
      });
    }
  };
  
  // For admin users that don't have a company association
  const loadGeneralDataForAdmin = async () => {
    try {
      // Get overall counts for all projects
      const { data: allProjects, error: allProjectsError } = await supabase
        .from('projects')
        .select('id, status');
      
      if (allProjectsError) {
        throw allProjectsError;
      }
      
      // Count active and completed projects
      const activeProjects = allProjects ? allProjects.filter(p => p.status === 'active').length : 0;
      const completedProjects = allProjects ? allProjects.filter(p => p.status === 'completed').length : 0;
      
      // Count total leads
      const { count: totalLeadsCount, error: leadsError } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true });
      
      if (leadsError) {
        throw leadsError;
      }
      
      // Count approved candidates
      const { count: approvedCount, error: approvedError } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'qualified');
      
      if (approvedError) {
        throw approvedError;
      }
      
      setKPIs({
        totalLeads: totalLeadsCount || 0,
        activeProjects,
        completedProjects,
        approvedCandidates: approvedCount || 0,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
      
      console.log('Admin dashboard data loaded');
      
    } catch (error: any) {
      console.error('Error loading admin data:', error);
      throw error; // Re-throw to be handled by the parent function
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  return {
    ...kpis,
    refresh: fetchDashboardData
  };
};
