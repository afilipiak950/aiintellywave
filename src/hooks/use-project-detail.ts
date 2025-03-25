
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
}

export const useProjectDetail = (projectId: string) => {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          companies:company_id(name)
        `)
        .eq('id', projectId)
        .single();
        
      if (projectError) throw projectError;
      
      if (projectData) {
        const formattedProject = {
          id: projectData.id,
          name: projectData.name,
          description: projectData.description || '',
          status: projectData.status,
          company_id: projectData.company_id,
          company_name: projectData.companies?.name || 'Unknown Company',
          start_date: projectData.start_date,
          end_date: projectData.end_date,
          budget: projectData.budget,
          created_at: projectData.created_at,
          updated_at: projectData.updated_at
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
