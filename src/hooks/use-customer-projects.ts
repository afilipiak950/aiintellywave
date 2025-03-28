
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/auth';
import { toast } from './use-toast';

export interface CustomerProject {
  id: string;
  name: string;
  description: string;
  status: string;
  company_id: string;
  company_name: string;
  progress: number;
  start_date: string | null;
  end_date: string | null;
  assigned_to: string | null;
}

export const useCustomerProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<CustomerProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setLoading(false); // Set loading to false if there's no user
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching customer projects for user:', user.id);
      
      // First fetch projects assigned to the user
      const { data: assignedProjects, error: assignedError } = await supabase
        .from('projects')
        .select(`
          id, 
          name, 
          description, 
          status, 
          company_id,
          start_date, 
          end_date,
          assigned_to
        `)
        .eq('assigned_to', user.id);
        
      if (assignedError) {
        console.error('Error fetching assigned projects:', assignedError);
        throw assignedError;
      }
      
      console.log('Assigned projects received:', assignedProjects);
      
      // Then fetch projects belonging to the user's company if user has a company ID
      let companyProjects: any[] = [];
      
      if (user.companyId) {
        const { data: companyProjectsData, error: companyError } = await supabase
          .from('projects')
          .select(`
            id, 
            name, 
            description, 
            status, 
            company_id,
            start_date, 
            end_date,
            assigned_to
          `)
          .eq('company_id', user.companyId);
          
        if (companyError) {
          console.error('Error fetching company projects:', companyError);
          // Don't throw here, just log the error and continue with assigned projects
        } else {
          console.log('Company projects received:', companyProjectsData);
          companyProjects = companyProjectsData || [];
        }
      } else {
        console.log('User has no company ID. Skipping company projects fetch.');
      }
      
      // Combine and deduplicate projects
      const combinedProjects = [...(assignedProjects || [])];
      
      // Add company projects that aren't already in the list
      if (companyProjects && companyProjects.length > 0) {
        companyProjects.forEach(project => {
          if (!combinedProjects.some(p => p.id === project.id)) {
            combinedProjects.push(project);
          }
        });
      }
      
      if (combinedProjects.length === 0) {
        setProjects([]);
        setLoading(false);
        return;
      }
      
      // Get company names for the projects
      const companyIds = [...new Set(combinedProjects.map(p => p.company_id))].filter(Boolean);
      
      let companyNameMap: Record<string, string> = {};
      
      if (companyIds.length > 0) {
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('id, name')
          .in('id', companyIds);
          
        if (companiesError) {
          console.error('Error fetching companies:', companiesError);
          // Continue with partial data
        } else if (companiesData) {
          // Create a lookup map for company names
          companyNameMap = companiesData.reduce((acc, company) => {
            acc[company.id] = company.name;
            return acc;
          }, {} as {[key: string]: string});
        }
      }
      
      // Map projects with company names and progress
      const processedProjects = combinedProjects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description || '',
        status: project.status,
        company_id: project.company_id,
        company_name: companyNameMap[project.company_id] || 'Unknown Company',
        progress: getProgressByStatus(project.status),
        start_date: project.start_date,
        end_date: project.end_date,
        assigned_to: project.assigned_to
      }));
      
      // Debug output to verify assigned projects are included
      const assignedProjectsCount = processedProjects.filter(p => p.assigned_to === user.id).length;
      console.log(`Found ${assignedProjectsCount} projects assigned to current user:`, 
        processedProjects.filter(p => p.assigned_to === user.id).map(p => p.name));
        
      setProjects(processedProjects);
      
    } catch (error: any) {
      console.error('Error in useCustomerProjects:', error);
      setError(error.message || 'Failed to load projects');
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
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
    projects,
    loading,
    error,
    fetchProjects
  };
};
