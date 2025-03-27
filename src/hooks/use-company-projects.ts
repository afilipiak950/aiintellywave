import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/auth';
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
          .select('*')
          .eq('company_id', company.id);
        
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

        if (!projects || projects.length === 0) {
          // Add company with empty projects array
          companiesWithProjectsData.push({
            ...company,
            projects: []
          });
          continue;
        }
        
        // Fetch assigned user information in a separate query for each project
        const formattedProjects: ProjectWithAssignee[] = [];
        
        for (const project of projects) {
          let assigneeName = null;
          let assigneeEmail = null;
          let assigneeAvatar = null;
          
          if (project.assigned_to) {
            // Get assignee information from company_users table
            const { data: assigneeData, error: assigneeError } = await supabase
              .from('company_users')
              .select('full_name, email, avatar_url')
              .eq('user_id', project.assigned_to)
              .maybeSingle();
            
            if (!assigneeError && assigneeData) {
              assigneeName = assigneeData.full_name;
              assigneeEmail = assigneeData.email;
              assigneeAvatar = assigneeData.avatar_url;
            } else {
              console.error('Error fetching assignee data:', assigneeError);
            }
          }
          
          formattedProjects.push({
            ...project,
            assignee_name: assigneeName,
            assignee_email: assigneeEmail,
            assignee_avatar: assigneeAvatar,
            progress: getProgressByStatus(project.status)
          });
        }
        
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
