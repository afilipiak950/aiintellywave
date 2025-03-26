
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderPlus } from 'lucide-react';
import ProjectCard from '../../components/ui/project/ProjectCard';
import ProjectCreateModal from '../../components/ui/project/ProjectCreateModal';
import ProjectSearch from '../../components/ui/project/ProjectSearch';
import ProjectEmptyState from '../../components/ui/project/ProjectEmptyState';
import ProjectLoadingState from '../../components/ui/project/ProjectLoadingState';
import { useProjects } from '../../hooks/use-projects';

interface AdminProjectsProps {
  createMode?: boolean;
}

const AdminProjects = ({ createMode = false }: AdminProjectsProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(createMode);
  
  const { 
    projects, 
    loading, 
    errorMsg, 
    fetchProjects 
  } = useProjects();

  useEffect(() => {
    // If we're in create mode, open the modal automatically
    if (createMode) {
      setIsCreateModalOpen(true);
    }
  }, [createMode]);
  
  // Filter and search projects
  const filteredProjects = projects
    .filter(project => 
      filter === 'all' || 
      (filter === 'active' && project.status !== 'completed' && project.status !== 'canceled') ||
      (filter === 'completed' && project.status === 'completed') ||
      (filter === 'canceled' && project.status === 'canceled')
    )
    .filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.company.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  const handleProjectClick = (projectId: string) => {
    navigate(`/admin/projects/${projectId}`);
  };

  // Close modal and redirect if we're in create mode
  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    if (createMode) {
      navigate('/admin/projects');
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary inline-flex sm:self-end"
        >
          <FolderPlus size={18} className="mr-2" />
          Add Project
        </button>
      </div>
      
      {/* Search and Filters */}
      <ProjectSearch 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filter={filter}
        setFilter={setFilter}
      />
      
      {/* Loading state */}
      {loading && <ProjectLoadingState />}
      
      {/* Project Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onClick={() => handleProjectClick(project.id)} 
            />
          ))}
        </div>
      )}
      
      {/* No Results */}
      {!loading && filteredProjects.length === 0 && (
        <ProjectEmptyState searchTerm={searchTerm} />
      )}
      
      {/* Create Project Modal */}
      <ProjectCreateModal 
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onProjectCreated={fetchProjects}
      />
    </div>
  );
};

export default AdminProjects;
