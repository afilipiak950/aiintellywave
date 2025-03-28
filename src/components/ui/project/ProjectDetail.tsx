
import { useAuth } from '../../../context/auth';
import { useProjectDetail } from '../../../hooks/use-project-detail';
import { useProjectEdit } from '../../../hooks/use-project-edit';
import { useProjectOperations } from '../../../hooks/use-project-operations';
import { getStatusIcon, statusColors } from './ProjectStatusConfig';
import ProjectHeader from './ProjectHeader';
import ProjectInfoCard from './ProjectInfoCard';
import ProjectTabs from './ProjectTabs';
import { Button } from "../../ui/button";
import { useNavigate } from 'react-router-dom';

interface ProjectDetailProps {
  projectId: string;
}

const ProjectDetail = ({ projectId }: ProjectDetailProps) => {
  const navigate = useNavigate();
  const { user, isAdmin, isManager } = useAuth();
  const { project, loading, setProject } = useProjectDetail(projectId);
  const { 
    isEditing, setIsEditing, 
    formData, availableUsers, handleInputChange 
  } = useProjectEdit(project, isAdmin, user);
  const { handleSubmit, handleDelete } = useProjectOperations(
    projectId, project, setProject, setIsEditing
  );
  
  const canEdit = isAdmin || (isManager && project?.company_id === user?.companyId);
  const StatusIcon = project?.status ? getStatusIcon(project.status) : getStatusIcon('planning');
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">Project not found</h2>
        <p className="text-gray-500 mt-2">The requested project could not be found.</p>
        <Button 
          className="mt-4"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </div>
    );
  }
  
  const onFormSubmit = (e: React.FormEvent) => {
    handleSubmit(e, formData);
  };
  
  return (
    <div className="space-y-6">
      <ProjectHeader 
        project={project}
        canEdit={canEdit}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        handleDelete={handleDelete}
        handleSubmit={onFormSubmit}
        formData={formData}
        handleInputChange={handleInputChange}
        availableUsers={availableUsers}
      />
      
      <ProjectInfoCard 
        project={project}
        isEditing={isEditing}
        formData={formData}
        handleInputChange={handleInputChange}
        statusColors={statusColors}
        StatusIcon={StatusIcon}
        availableUsers={availableUsers}
      />
      
      <ProjectTabs projectId={project.id} canEdit={canEdit} />
    </div>
  );
};

export default ProjectDetail;
