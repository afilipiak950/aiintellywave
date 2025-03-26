
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

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

const ProjectCreateModal = ({ isOpen, onClose, onProjectCreated }: ProjectCreateModalProps) => {
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

  // Create a wrapper function that properly passes the form values to handleSubmit
  const onSubmit = (values: any) => {
    // Pass the values directly to handleSubmit
    return handleSubmit(values);
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
