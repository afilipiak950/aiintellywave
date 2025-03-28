
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from "../hooks/use-toast";

export interface CompanyWithProjects {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  industry: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
  projects: ProjectInCompany[];
}

export interface ProjectInCompany {
  id: string;
  name: string;
  description: string;
  status: string;
  company_id: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  assigned_to: string | null;
  assignee_name: string | null;
  assignee_email: string | null;
  assignee_avatar: string | null;
  progress: number;
}

export const useCompanyProjects = () => {
  const [companiesWithProjects, setCompaniesWithProjects] = useState<CompanyWithProjects[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchCompaniesWithProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching companies and projects...');
      
      // First, fetch all companies
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*');
      
      if (companiesError) {
        throw companiesError;
      }
      
      console.log('Fetched', companies?.length || 0, 'companies');
      
      if (!companies || companies.length === 0) {
        setCompaniesWithProjects([]);
        return;
      }
      
      // Then, for each company, fetch its projects
      const companiesWithProjectsData = await Promise.all(
        companies.map(async (company) => {
          const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('*')
            .eq('company_id', company.id);
          
          if (projectsError) {
            console.error(`Error fetching projects for company ${company.id}:`, projectsError);
            return {
              ...company,
              projects: []
            };
          }
          
          // For each project with an assigned user, fetch the user details
          const projectsWithAssignees = await Promise.all(
            (projects || []).map(async (project) => {
              let assigneeName = null;
              let assigneeEmail = null;
              let assigneeAvatar = null;
              
              if (project.assigned_to) {
                const { data: userData, error: userError } = await supabase
                  .from('company_users')
                  .select('full_name, email, avatar_url')
                  .eq('user_id', project.assigned_to)
                  .maybeSingle();
                
                if (!userError && userData) {
                  assigneeName = userData.full_name || null;
                  assigneeEmail = userData.email || null;
                  assigneeAvatar = userData.avatar_url || null;
                }
              }
              
              // Calculate progress based on status
              const progress = calculateProgress(project.status);
              
              return {
                ...project,
                assignee_name: assigneeName,
                assignee_email: assigneeEmail,
                assignee_avatar: assigneeAvatar,
                progress
              };
            })
          );
          
          return {
            ...company,
            projects: projectsWithAssignees
          };
        })
      );
      
      console.log('Finished fetching companies with projects:', companiesWithProjectsData);
      setCompaniesWithProjects(companiesWithProjectsData);
    } catch (err: any) {
      console.error('Error fetching companies with projects:', err);
      setError(err.message || 'Failed to load companies and projects');
      
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCompaniesWithProjects();
  }, []);
  
  const refreshData = () => {
    fetchCompaniesWithProjects();
  };
  
  return {
    companiesWithProjects,
    loading,
    error,
    refreshData
  };
};

// Helper function to calculate progress based on status
const calculateProgress = (status: string): number => {
  switch (status) {
    case 'planning': return 10;
    case 'in_progress': return 50;
    case 'review': return 80;
    case 'completed': return 100;
    case 'canceled': return 0;
    default: return 0;
  }
};
