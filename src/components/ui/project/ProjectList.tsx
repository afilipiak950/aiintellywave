
import { useNavigate } from 'react-router-dom';
import ProjectCard from './ProjectCard';
import ProjectEmptyState from './ProjectEmptyState';
import ProjectLoadingState from './ProjectLoadingState';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  company: string;
  start_date: string | null;
  end_date: string | null;
  progress: number;
}

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
  searchTerm: string;
  basePath: string;
}

const ProjectList = ({ projects, loading, searchTerm, basePath }: ProjectListProps) => {
  const navigate = useNavigate();
  
  const handleProjectClick = (projectId: string) => {
    navigate(`${basePath}/${projectId}`);
  };
  
  if (loading) {
    return <ProjectLoadingState />;
  }
  
  if (projects.length === 0) {
    return <ProjectEmptyState searchTerm={searchTerm} />;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project} 
          onClick={() => handleProjectClick(project.id)} 
        />
      ))}
    </div>
  );
};

export default ProjectList;
