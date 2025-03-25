
import { useState } from 'react';
import { useManagerProjects } from '../../hooks/use-manager-projects';
import ProjectHeader from '../../components/ui/project/ProjectHeader';
import ProjectSearch from '../../components/ui/project/ProjectSearch';
import ProjectList from '../../components/ui/project/ProjectList';
import ProjectCreateModal from '../../components/ui/project/ProjectCreateModal';

const ManagerProjects = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { 
    projects, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    filter, 
    setFilter, 
    fetchProjects 
  } = useManagerProjects();
  
  return (
    <div className="space-y-8">
      <ProjectHeader onCreateClick={() => setIsCreateModalOpen(true)} />
      
      {/* Search and Filters */}
      <ProjectSearch 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filter={filter}
        setFilter={setFilter}
      />
      
      {/* Project List */}
      <ProjectList 
        projects={projects}
        loading={loading}
        searchTerm={searchTerm}
        basePath="/manager/projects"
      />
      
      {/* Create Project Modal */}
      <ProjectCreateModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={fetchProjects}
      />
    </div>
  );
};

export default ManagerProjects;
