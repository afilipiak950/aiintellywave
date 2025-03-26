
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/AuthContext';
import { toast } from "./use-toast";
import { CompanyData } from '@/services/types/customerTypes';

export interface ProjectWithAssignee {
  id: string;
  name: string;
  description: string;
  status: string;
  company_id: string;
  start_date: string | null;
  end_date: string | null;
  progress: number;
  created_at: string;
  updated_at: string;
  assigned_to: string | null;
  assignee_name: string | null;
  assignee_email: string | null;
  assignee_avatar: string | null;
}

export interface CompanyWithProjects extends CompanyData {
  projects: ProjectWithAssignee[];
}

export const useCompanyProjects = () => {
  const { user, isAdmin, isManager } = useAuth();
  const [companiesWithProjects, setCompaniesWithProjects] = useState<CompanyWithProjects[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompaniesWithProjects();
  }, [user]);

  const fetchCompaniesWithProjects = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching companies and projects...');
      
      // 1. First fetch the companies
      let companiesQuery = supabase.from('companies').select('*');
      
      // If user is not an admin, only fetch companies they are associated with
      if (!isAdmin) {
        companiesQuery = companiesQuery.eq('id', user.companyId);
      }
      
      const { data: companies, error: companiesError } = await companiesQuery;
      
      if (companiesError) {
        throw companiesError;
      }
      
      if (!companies || companies.length === 0) {
        setCompaniesWithProjects([]);
        return;
      }
      
      console.log(`Fetched ${companies.length} companies`);
      
      // 2. For each company, fetch projects
      const companiesWithProjectsData: CompanyWithProjects[] = [];
      
      for (const company of companies) {
        // Fetch projects for this company
        let projectsQuery = supabase
          .from('projects')
          .select(`
            *,
            company_users!projects_assigned_to_fkey (
              email,
              full_name,
              avatar_url
            )
          `);
        
        // Apply different filters based on user role
        if (isAdmin) {
          // Admins can see all projects
          projectsQuery = projectsQuery.eq('company_id', company.id);
        } else if (isManager && user.companyId === company.id) {
          // Managers can see all projects for their company
          projectsQuery = projectsQuery.eq('company_id', company.id);
        } else {
          // Regular users can only see projects assigned to them in their company
          projectsQuery = projectsQuery
            .eq('company_id', company.id)
            .eq('assigned_to', user.id);
        }
        
        const { data: projects, error: projectsError } = await projectsQuery;
        
        if (projectsError) {
          console.error(`Error fetching projects for company ${company.id}:`, projectsError);
          continue; // Skip this company but continue with others
        }
        
        // Format projects with assignee info
        const formattedProjects: ProjectWithAssignee[] = (projects || []).map(project => {
          const assigneeData = project.company_users || null;
          
          return {
            ...project,
            assignee_name: assigneeData?.full_name || null,
            assignee_email: assigneeData?.email || null,
            assignee_avatar: assigneeData?.avatar_url || null,
            progress: getProgressByStatus(project.status)
          };
        });
        
        companiesWithProjectsData.push({
          ...company,
          projects: formattedProjects
        });
      }
      
      setCompaniesWithProjects(companiesWithProjectsData);
      console.log('Finished fetching companies with projects:', companiesWithProjectsData);
      
    } catch (error: any) {
      console.error('Error fetching companies with projects:', error);
      setError(error.message || 'Failed to load data');
      
      toast({
        title: "Error",
        description: "Failed to load companies and projects. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper for calculating progress based on status
  const getProgressByStatus = (status: string): number => {
    switch (status) {
      case 'planning': return 10;
      case 'in_progress': return 50;
      case 'review': return 80;
      case 'completed': return 100;
      case 'canceled': return 0;
      default: return 0;
    }
  };

  return {
    companiesWithProjects,
    loading,
    error,
    refreshData: fetchCompaniesWithProjects
  };
};
