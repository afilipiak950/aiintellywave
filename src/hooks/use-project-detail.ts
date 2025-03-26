
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from "../hooks/use-toast";

export interface ProjectDetails {
  id: string;
  name: string;
  description: string;
  status: string;
  company_id: string;
  company_name: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  created_at: string;
  updated_at: string;
  assigned_to: string | null;
}

export const useProjectDetail = (projectId: string) => {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch the project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
        
      if (projectError) throw projectError;
      
      if (projectData) {
        // Fetch company name separately
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('name')
          .eq('id', projectData.company_id)
          .maybeSingle();
          
        if (companyError) {
          console.error('Error fetching company:', companyError);
        }
        
        const formattedProject = {
          id: projectData.id,
          name: projectData.name,
          description: projectData.description || '',
          status: projectData.status,
          company_id: projectData.company_id,
          company_name: companyData?.name || 'Unknown Company',
          start_date: projectData.start_date,
          end_date: projectData.end_date,
          budget: projectData.budget,
          created_at: projectData.created_at,
          updated_at: projectData.updated_at,
          assigned_to: projectData.assigned_to
        };
        
        setProject(formattedProject);
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast({
        title: "Error",
        description: "Failed to load project details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!projectId) return;
    fetchProjectDetails();
  }, [projectId]);

  return {
    project,
    loading,
    fetchProjectDetails,
    setProject
  };
};
