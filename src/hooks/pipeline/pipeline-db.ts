
import { supabase } from '../../integrations/supabase/client';
import { PipelineProject } from '../../types/pipeline';
import { mapProjectStatus, getProgressByStatus } from './project-utils';

export const fetchCompanyProjects = async (companyId: string | null): Promise<PipelineProject[]> => {
  try {
    if (!companyId) {
      console.warn('No company ID provided to fetchCompanyProjects');
      return [];
    }

    // Get projects for the company
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('company_id', companyId)
      .order('updated_at', { ascending: false });
      
    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      throw projectsError;
    }
    
    // Get company name in a separate query
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('name')
      .eq('id', companyId)
      .single();
    
    const companyName = companyError ? 'Unknown Company' : (companyData?.name || 'Unknown Company');
    
    if (projectsData && Array.isArray(projectsData)) {
      return projectsData.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description || '',
        stageId: mapProjectStatus(project.status),
        company: companyName, // Use the company name we fetched
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
  try {
    const { error } = await supabase
      .from('projects')
      .update({ status })
      .eq('id', projectId);
      
    if (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateProjectStatus:', error);
    throw error;
  }
};
