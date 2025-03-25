
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
    loading,
    formData,
    fetchCompanies,
    handleInputChange,
    handleSelectChange,
    handleSubmit
  } = useProjectForm(onProjectCreated, onClose);

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);

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
          formData={formData}
          companies={companies}
          loading={loading}
          onInputChange={handleInputChange}
          onSelectChange={handleSelectChange}
          onSubmit={handleSubmit}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProjectCreateModal;
