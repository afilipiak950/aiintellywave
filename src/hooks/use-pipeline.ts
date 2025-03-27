import { useState, useEffect } from 'react';
import { useAuth } from '../context/auth';
import { PipelineProject, DEFAULT_PIPELINE_STAGES, PipelineStage } from '../types/pipeline';
import { toast } from './use-toast';
import { supabase } from '../integrations/supabase/client';

export const usePipeline = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<PipelineProject[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>(DEFAULT_PIPELINE_STAGES);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompanyId, setFilterCompanyId] = useState<string | null>(null);

  const fetchPipelineData = async () => {
    setLoading(true);
    try {
      // Fetch all projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, description, status, company_id, start_date, end_date, updated_at');
        
      if (projectsError) throw projectsError;
      
      if (projectsData && projectsData.length > 0) {
        // Get unique company IDs
        const companyIds = [...new Set(projectsData.map(project => project.company_id))];
        
        // Fetch company names
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('id, name')
          .in('id', companyIds);
          
        if (companiesError) throw companiesError;
        
        // Create a map of company ID to company name
        const companyMap = companiesData?.reduce((acc, company) => {
          acc[company.id] = company.name;
          return acc;
        }, {} as Record<string, string>) || {};
        
        // Distribute projects across pipeline stages for demo purposes
        // In a real app, you'd have a stageId field in your projects table
        const pipelineProjects: PipelineProject[] = projectsData.map((project, index) => {
          // For demo, distribute projects across stages based on status or randomly if needed
          let stageId;
          if (project.status === 'planning') stageId = 'project_start';
          else if (project.status === 'in_progress') stageId = ['candidates_found', 'contact_made', 'interviews_scheduled'][index % 3];
          else if (project.status === 'review') stageId = 'final_review';
          else if (project.status === 'completed') stageId = 'completed';
          else stageId = DEFAULT_PIPELINE_STAGES[index % DEFAULT_PIPELINE_STAGES.length].id;
          
          return {
            id: project.id,
            name: project.name,
            description: project.description || '',
            stageId,
            company: companyMap[project.company_id] || 'Unknown Company',
            company_id: project.company_id,
            status: project.status,
            updated_at: project.updated_at,
            progress: getProgressByStatus(project.status),
            hasUpdates: isRecentlyUpdated(project.updated_at)
          };
        });
        
        setProjects(pipelineProjects);
      }
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
      toast({
        title: "Error",
        description: "Failed to load pipeline data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProjectStage = async (projectId: string, newStageId: string) => {
    // Find project and update its stage
    const updatedProjects = projects.map(project => 
      project.id === projectId ? { ...project, stageId: newStageId } : project
    );
    
    // Optimistically update UI
    setProjects(updatedProjects);
    
    try {
      // In a real app, you would update the database with the new stage
      // For demo purposes, we're just keeping it in state
      // await supabase.from('projects').update({ stage_id: newStageId }).eq('id', projectId);
      
      toast({
        title: "Success",
        description: "Project moved to new stage.",
      });
    } catch (error) {
      console.error('Error updating project stage:', error);
      toast({
        title: "Error",
        description: "Failed to update project stage.",
        variant: "destructive"
      });
      
      // Revert changes on error
      setProjects(projects);
    }
  };
  
  // Filter projects based on search term and company filter
  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchTerm || 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.company.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCompany = !filterCompanyId || project.company_id === filterCompanyId;
    
    return matchesSearch && matchesCompany;
  });

  // Helper to check if a project was updated recently (within the last 24 hours)
  const isRecentlyUpdated = (updatedAt: string) => {
    const updatedDate = new Date(updatedAt);
    const now = new Date();
    const diffInHours = (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60);
    return diffInHours < 24;
  };

  useEffect(() => {
    fetchPipelineData();
  }, [user]);

  return {
    projects: filteredProjects,
    stages,
    loading,
    searchTerm,
    setSearchTerm,
    filterCompanyId,
    setFilterCompanyId,
    updateProjectStage,
    fetchPipelineData
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
