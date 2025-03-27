
import { useState } from 'react';
import { useCompanyProjects } from '../../hooks/use-company-projects';
import ProjectHeader from '../../components/ui/project/ProjectHeader';
import ProjectSearch from '../../components/ui/project/ProjectSearch';
import ProjectCreateModal from '../../components/ui/project/ProjectCreateModal';
import ProjectsByCompany from '../../components/ui/project/ProjectsByCompany';
import { AnimatedAgents } from '@/components/ui/animated-agents';
import { FloatingElements } from '@/components/outreach/FloatingElements';

const ManagerProjects = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
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
  
  return (
    <div className="space-y-8 relative">
      {/* Add animated agents */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <AnimatedAgents />
      </div>
      
      {/* Add floating elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <FloatingElements />
      </div>
      
      <div className="relative z-10">
        <ProjectHeader onCreateClick={() => setIsCreateModalOpen(true)} />
      </div>
      
      {/* Search and Filters */}
      <div className="relative z-10">
        <ProjectSearch 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filter={filter}
          setFilter={setFilter}
        />
      </div>
      
      {/* Projects by Company */}
      <div className="relative z-10">
        <ProjectsByCompany 
          companies={filteredCompanies}
          loading={loading}
          error={error}
          basePath="/manager/projects"
        />
      </div>
      
      {/* Create Project Modal */}
      <ProjectCreateModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={refreshData}
      />
    </div>
  );
};

export default ManagerProjects;
