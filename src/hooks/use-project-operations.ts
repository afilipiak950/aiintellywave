
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { toast } from "./use-toast";
import { ProjectFormData } from './use-project-edit';
import { ProjectDetails } from './use-project-detail';
import { deleteProject } from '../services/project-service';

export function useProjectOperations(
  projectId: string,
  project: ProjectDetails | null,
  setProject: (project: ProjectDetails | null) => void,
  setIsEditing: (value: boolean) => void
) {
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent, formData: ProjectFormData) => {
    e.preventDefault();
    
    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        assigned_to: formData.assigned_to || null,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId);
        
      if (error) throw error;
      
      if (project) {
        setProject({
          ...project,
          ...updateData,
          assigned_to: formData.assigned_to || null,
        });
      }
      
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Project details updated successfully.",
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project? The project will be removed, but all leads will be preserved in the lead database.')) {
      return;
    }
    
    try {
      const success = await deleteProject(projectId);
      
      if (!success) throw new Error('Failed to delete project');
      
      toast({
        title: "Success",
        description: "Project deleted successfully. All leads have been preserved in the lead database.",
      });
      
      // Navigate based on role
      navigate(-1);
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    handleSubmit,
    handleDelete
  };
}
