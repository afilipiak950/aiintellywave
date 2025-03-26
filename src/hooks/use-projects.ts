
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from "../hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  company: string;
  company_id: string;
  start_date: string | null;
  end_date: string | null;
  progress: number;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  useEffect(() => {
    fetchProjects();
  }, []);
  
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      console.log('Fetching projects data...');
      
      // Simplified query to avoid RLS issues
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, description, status, company_id, start_date, end_date');
        
      if (projectsError) {
        console.error('Error details:', projectsError);
        throw projectsError;
      }
      
      console.log('Projects data received:', projectsData);
      
      if (projectsData) {
        // Now get company names in a separate query
        const companyIds = projectsData
          .map(project => project.company_id)
          .filter((id): id is string => !!id);
        
        let companyNames: {[key: string]: string} = {};
        
        if (companyIds.length > 0) {
          try {
            const { data: companiesData, error: companiesError } = await supabase
              .from('companies')
              .select('id, name')
              .in('id', companyIds);
            
            if (companiesError) {
              console.error('Error fetching company names:', companiesError);
            } else if (companiesData) {
              // Create a map of company ID to company name
              companyNames = companiesData.reduce((acc, company) => {
                acc[company.id] = company.name;
                return acc;
              }, {} as {[key: string]: string});
            }
          } catch (companyError) {
            console.warn('Error fetching company names:', companyError);
            // Continue with partial data
          }
        }
        
        const formattedProjects = projectsData.map(project => ({
          id: project.id,
          name: project.name,
          description: project.description || '',
          status: project.status,
          company: companyNames[project.company_id] || 'Unknown Company',
          company_id: project.company_id,
          start_date: project.start_date,
          end_date: project.end_date,
          progress: getProgressByStatus(project.status),
        }));
        
        setProjects(formattedProjects);
      }
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      
      // Set a detailed error message based on the error type
      if (error.code === '42P17') {
        setErrorMsg('Database policy recursion error. Please check your RLS policies.');
      } else if (error.code === '42P01') {
        setErrorMsg('Table not found. Check database configuration.');
      } else if (error.code === '42703') {
        setErrorMsg('Column not found. Check database schema.');
      } else if (error.message) {
        setErrorMsg(`Error: ${error.message}`);
      } else {
        setErrorMsg('Failed to load projects. Please try again.');
      }
      
      toast({
        title: "Error",
        description: errorMsg || "Failed to load projects. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    projects,
    loading,
    errorMsg,
    fetchProjects
  };
};

// Helper to calculate progress based on status
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
