
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
import { useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ProjectDetailProps {
  projectId: string;
  onError?: (error: string) => void;
}

const ProjectDetail = ({ projectId, onError }: ProjectDetailProps) => {
  const navigate = useNavigate();
  const { user, isAdmin, isManager } = useAuth();
  const { project, loading, error, fetchProjectDetails, setProject } = useProjectDetail(projectId);
  const { 
    isEditing, setIsEditing, 
    formData, availableUsers, handleInputChange 
  } = useProjectEdit(project, isAdmin, user);
  const { handleSubmit, handleDelete } = useProjectOperations(
    projectId, project, setProject, setIsEditing
  );
  
  // Report errors up to parent component if needed
  useEffect(() => {
    if (error && onError) {
      console.error('Project detail error:', error);
      onError(error);
    }
  }, [error, onError]);

  const canEdit = isAdmin || (isManager && project?.company_id === user?.companyId);
  const StatusIcon = project?.status ? getStatusIcon(project.status) : getStatusIcon('planning');
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          <p className="mt-4 text-sm text-muted-foreground">Projekt wird geladen...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-800"
      >
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 text-red-500 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium mb-2">Fehler beim Laden des Projekts</h3>
            <p className="mb-4">{error}</p>
            <div className="flex space-x-3">
              <Button onClick={fetchProjectDetails} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                Erneut versuchen
              </Button>
              <Button onClick={() => navigate('/customer/projects')} variant="ghost">
                Zurück zur Projektliste
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  
  if (!project) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700">Projekt nicht gefunden</h2>
        <p className="text-gray-500 mt-2">Das angeforderte Projekt konnte nicht gefunden werden.</p>
        <Button 
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 transition-all duration-300"
          onClick={() => navigate('/customer/projects')}
        >
          Zurück zur Projektliste
        </Button>
      </motion.div>
    );
  }
  
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
