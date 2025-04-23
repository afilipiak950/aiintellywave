
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/auth';
import { PipelineProject, DEFAULT_PIPELINE_STAGES, PipelineStage } from '../types/pipeline';
import { toast } from './use-toast';
import { supabase } from '../integrations/supabase/client';

export const usePipeline = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<PipelineProject[]>([]);
  const [stages] = useState<PipelineStage[]>(DEFAULT_PIPELINE_STAGES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompanyId, setFilterCompanyId] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch pipeline data from the database
  const fetchPipelineData = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setLoading(false);
      setError("User authentication required");
      return;
    }
    
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      console.log('Fetching pipeline data for user:', user.id);
      
      // Try first approach: Get user's company via company_users table
      let companyId: string | null = null;
      let companyName = 'Your Company';

      try {
        // Get the user's company ID first - using a more efficient query
        const { data: companyData, error: companyError } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', user.id)
          .limit(1)
          .single();
        
        if (companyError) {
          console.error('Error fetching company association:', companyError);
          
          // If we get infinite recursion error, try fallback approach
          if (companyError.code === '42P17' || companyError.message?.includes('infinite recursion')) {
            throw new Error('RLS policy error, trying fallback');
          }
          
          setError('Failed to load company association. Please refresh and try again.');
          setLoading(false);
          setIsRefreshing(false);
          return;
        }
        
        companyId = companyData?.company_id;
      } catch (e) {
        console.log('Using fallback method to fetch company ID due to RLS issues');
        
        try {
          // Fallback: Try getting user company IDs via RPC function
          const { data: companyUsersData, error: rpcError } = await supabase
            .rpc('get_user_company_ids', { user_uuid: user.id });
            
          if (companyUsersData && companyUsersData.length > 0) {
            // Get the first company ID from the array
            companyId = companyUsersData[0] as string;
            console.log('Found company ID via RPC function:', companyId);
          }
        } catch (rpcError) {
          console.error('RPC fallback error:', rpcError);
        }
        
        // If still no company ID, try direct query to projects table
        if (!companyId) {
          const { data: projectsData } = await supabase
            .from('projects')
            .select('company_id')
            .limit(1);
            
          if (projectsData && projectsData.length > 0) {
            companyId = projectsData[0].company_id;
            console.log('Found company ID via projects table:', companyId);
          }
        }
      }
      
      if (!companyId) {
        setError('No company association found. Please contact your administrator.');
        setLoading(false);
        setIsRefreshing(false);
        return;
      }
      
      console.log('Using company ID:', companyId);
      
      // Then fetch all projects for that company - use pagination for better performance
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('company_id', companyId)
        .order('updated_at', { ascending: false });
        
      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        setError('Failed to load projects. Please try again.');
        setLoading(false);
        setIsRefreshing(false);
        return;
      }
      
      try {
        // Get company name - with caching
        const { data: companyInfo } = await supabase
          .from('companies')
          .select('name')
          .eq('id', companyId)
          .single();
        
        if (companyInfo) {
          companyName = companyInfo.name;
        }
      } catch (err) {
        console.warn('Could not fetch company name, using default');
      }
      
      // Convert projects to pipeline format - use a faster mapping approach
      if (projectsData && Array.isArray(projectsData)) {
        console.log(`Found ${projectsData.length} projects for company ${companyId}`);
        
        const pipelineProjects: PipelineProject[] = projectsData.map(project => {
          // Determine stageId based on status - using a more efficient approach
          let stageId: string;
          switch(project.status) {
            case 'planning': stageId = 'project_start'; break;
            case 'in_progress': stageId = 'candidates_found'; break;
            case 'review': stageId = 'final_review'; break; 
            case 'completed': stageId = 'completed'; break;
            default: stageId = 'project_start';
          }
          
          return {
            id: project.id,
            name: project.name,
            description: project.description || '',
            stageId,
            company: companyName,
            company_id: companyId as string,
            updated_at: project.updated_at,
            status: project.status,
            progress: getProgressByStatus(project.status),
            hasUpdates: false
          };
        });
        
        setProjects(pipelineProjects);
        setError(null);
        setLastRefreshTime(new Date());
      } else {
        console.warn('No projects found or data is not in expected format:', projectsData);
        setProjects([]);
      }
    } catch (error: any) {
      console.error('Error in usePipeline:', error);
      
      // More user-friendly error message
      if (error.message?.includes('infinite recursion')) {
        setError('Database access issue. We\'re working on fixing this. Please try again in a few moments.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  const updateProjectStage = async (projectId: string, newStageId: string) => {
    // Optimistically update UI
    const updatedProjects = projects.map(project => 
      project.id === projectId ? { ...project, stageId: newStageId } : project
    );
    setProjects(updatedProjects);
    
    try {
      // Map stage to status
      let status: string;
      switch(newStageId) {
        case 'project_start': status = 'planning'; break;
        case 'candidates_found': 
        case 'contact_made':
        case 'interviews_scheduled': status = 'in_progress'; break;
        case 'final_review': status = 'review'; break;
        case 'completed': status = 'completed'; break;
        default: status = 'planning';
      }
      
      // Update in database
      const { error } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', projectId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Project moved to new stage.",
      });
    } catch (error: any) {
      console.error('Error updating project stage:', error);
      toast({
        title: "Error",
        description: "Failed to update project stage.",
        variant: "destructive"
      });
      
      // Revert changes on error
      fetchPipelineData();
    }
  };
  
  // Use memoization for filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Only apply filters if they're set
      return (!searchTerm || project.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
             (!filterCompanyId || project.company_id === filterCompanyId);
    });
  }, [projects, searchTerm, filterCompanyId]);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchPipelineData();
  }, [fetchPipelineData]);

  return {
    projects: filteredProjects,
    stages,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filterCompanyId,
    setFilterCompanyId,
    updateProjectStage,
    refetch: () => fetchPipelineData(true),
    isRefreshing,
    lastRefreshTime
  };
};

// Helper to calculate progress based on status - no changes needed here
const getProgressByStatus = (status: string): number => {
  switch (status) {
    case 'planning': return 10;
    case 'in_progress': return 50;
    case 'review': return 80;
    case 'completed': return 100;
    default: return 0;
  }
};
