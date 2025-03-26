
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderPlus } from 'lucide-react';
import ProjectHeader from '../../components/ui/project/ProjectHeader';
import ProjectSearch from '../../components/ui/project/ProjectSearch';
import ProjectCreateModal from '../../components/ui/project/ProjectCreateModal';
import ProjectsByCompany from '../../components/ui/project/ProjectsByCompany';
import { useCompanyProjects } from '../../hooks/use-company-projects';

interface AdminProjectsProps {
  createMode?: boolean;
}

const AdminProjects = ({ createMode = false }: AdminProjectsProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(createMode);
  
  const { 
    companiesWithProjects, 
    loading, 
    error, 
    refreshData 
  } = useCompanyProjects();

  // Filter companies and their projects based on search term and filter
  const filteredCompanies = companiesWithProjects.map(company => ({
    ...company,
    projects: company.projects.filter(project => 
      (filter === 'all' || 
       (filter === 'active' && project.status !== 'completed' && project.status !== 'canceled') ||
       (filter === 'completed' && project.status === 'completed') ||
       (filter === 'canceled' && project.status === 'canceled')) &&
      (project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       company.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(company => company.projects.length > 0);
  
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
        <h1 className="text-2xl font-bold">Projects by Company</h1>
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
      
      {/* Projects by Company */}
      <ProjectsByCompany 
        companies={filteredCompanies}
        loading={loading}
        error={error}
        basePath="/admin/projects"
      />
      
      {/* Create Project Modal */}
      <ProjectCreateModal 
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onProjectCreated={refreshData}
      />
    </div>
  );
};

export default AdminProjects;
