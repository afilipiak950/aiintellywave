
import { useNavigate } from 'react-router-dom';
import { useCustomerProjects } from '../../hooks/use-customer-projects';
import ProjectFilterSearch from '../../components/ui/project/ProjectFilterSearch';
import ProjectList from '../../components/ui/project/ProjectList';
import ProjectLoadingState from '../../components/ui/project/ProjectLoadingState';
import ProjectEmptyState from '../../components/ui/project/ProjectEmptyState';

const CustomerProjects = () => {
  const navigate = useNavigate();
  const { 
    projects, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    filter, 
    setFilter 
  } = useCustomerProjects();
  
  const handleProjectClick = (projectId: string) => {
    navigate(`/customer/projects/${projectId}`);
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Your Projects</h1>
      </div>
      
      <ProjectFilterSearch 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filter={filter}
        setFilter={setFilter}
      />
      
      {/* Loading state */}
      {loading && <ProjectLoadingState />}
      
      {/* Project List */}
      {!loading && projects.length > 0 && (
        <ProjectList 
          projects={projects} 
          loading={loading} 
          searchTerm={searchTerm}
          basePath="/customer/projects"
        />
      )}
      
      {/* No Results */}
      {!loading && projects.length === 0 && (
        <ProjectEmptyState searchTerm={searchTerm} />
      )}
    </div>
  );
};

export default CustomerProjects;
