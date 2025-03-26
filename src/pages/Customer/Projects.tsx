
import { useState } from 'react';
import { useCompanyProjects } from '../../hooks/use-company-projects';
import ProjectFilterSearch from '../../components/ui/project/ProjectFilterSearch';
import ProjectsByCompany from '../../components/ui/project/ProjectsByCompany';

const CustomerProjects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  const { 
    companiesWithProjects, 
    loading, 
    error 
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
      
      {/* Projects by Company */}
      <ProjectsByCompany 
        companies={filteredCompanies}
        loading={loading}
        error={error}
        basePath="/customer/projects"
      />
    </div>
  );
};

export default CustomerProjects;
