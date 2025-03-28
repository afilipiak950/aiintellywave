
import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import ProjectCreateForm from './ProjectCreateForm';
import { useProjectForm } from '../../../hooks/use-project-form';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

const ProjectCreateModal = ({ isOpen, onClose, onProjectCreated }: ProjectCreateModalProps) => {
  const { user } = useAuth();
  const {
    companies,
    users,
    loading,
    formData,
    fetchCompanies,
    fetchCompanyUsers,
    handleInputChange,
    handleSelectChange,
    handleSubmit
  } = useProjectForm(onProjectCreated, onClose);

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);

  // Create a wrapper function that properly passes the form values from the form component
  const onSubmit = async (values: any) => {
    try {
      const projectData = {
        name: values.name,
        description: values.description || null,
        status: values.status,
        company_id: values.company_id,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        budget: values.budget ? parseFloat(values.budget) : null,
        assigned_to: values.assigned_to || null,
        created_by: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('projects')
        .insert(projectData);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Project created successfully.",
      });
      
      onProjectCreated();
      onClose();
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create project. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new project.
          </DialogDescription>
        </DialogHeader>
        
        <ProjectCreateForm 
          onSubmit={onSubmit}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProjectCreateModal;
