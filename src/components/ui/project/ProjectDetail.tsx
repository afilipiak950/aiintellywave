
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
import { motion } from "framer-motion";

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
        <motion.div 
          className="h-12 w-12 rounded-full border-t-2 border-b-2 border-indigo-500"
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1.2, 
            repeat: Infinity, 
            ease: "linear"
          }}
        />
      </div>
    );
  }
  
  if (!project) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <h2 className="text-2xl font-bold text-gray-700">Project not found</h2>
        <p className="text-gray-500 mt-2">The requested project could not be found.</p>
        <Button 
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 transition-all duration-300"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </motion.div>
    );
  }
  
  const onFormSubmit = (e: React.FormEvent) => {
    handleSubmit(e, formData);
  };
  
  return (
    <div className="space-y-6 pb-10">
      {/* Project header with gradient background */}
      <ProjectHeader 
        project={project}
        canEdit={canEdit}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        handleDelete={handleDelete}
        handleSubmit={handleSubmit}
        formData={formData}
        handleInputChange={handleInputChange}
        availableUsers={availableUsers}
      />
      
      {/* Project info card with animations */}
      <ProjectInfoCard 
        project={project}
        isEditing={isEditing}
        formData={formData}
        handleInputChange={handleInputChange}
        statusColors={statusColors}
        StatusIcon={StatusIcon}
        availableUsers={availableUsers}
      />
      
      {/* Project tabs with enhanced visuals */}
      <ProjectTabs projectId={project.id} canEdit={canEdit} />
    </div>
  );
};

export default ProjectDetail;
