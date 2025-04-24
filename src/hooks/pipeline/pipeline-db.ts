
import { supabase } from '../../integrations/supabase/client';
import { PipelineProject } from '../../types/pipeline';
import { mapProjectStatus, getProgressByStatus } from './project-utils';

export const fetchCompanyProjects = async (companyId: string | null): Promise<PipelineProject[]> => {
  try {
    // Get the user's company ID first - using a more efficient query
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('company_id', companyId)
      .order('updated_at', { ascending: false });
      
    if (projectsError) throw projectsError;
    
    if (projectsData && Array.isArray(projectsData)) {
      return projectsData.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description || '',
        stageId: mapProjectStatus(project.status),
        company: project.company_id || 'Your Company',
        company_id: companyId as string,
        updated_at: project.updated_at,
        status: project.status,
        progress: getProgressByStatus(project.status),
        hasUpdates: false
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const updateProjectStatus = async (projectId: string, status: string) => {
  const { error } = await supabase
    .from('projects')
    .update({ status })
    .eq('id', projectId);
    
  if (error) throw error;
};
