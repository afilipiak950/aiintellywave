import { useState } from 'react';
import { useCompanyProjects } from '../../hooks/use-company-projects';
import ProjectFilterSearch from '../../components/ui/project/ProjectFilterSearch';
import ProjectsByCompany from '../../components/ui/project/ProjectsByCompany';
import { AnimatedAgents } from '@/components/ui/animated-agents';
import { FloatingElements } from '@/components/outreach/FloatingElements';

const CustomerProjects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  const { 
    companiesWithProjects, 
    loading, 
    error 
  } = useCompanyProjects();
  
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
  
  const filterTranslations = {
    all: 'Alle',
    active: 'Aktiv',
    completed: 'Abgeschlossen',
    canceled: 'Abgebrochen'
  };
  
  const handleFilterChange = (value: string) => {
    setFilter(value);
  };
  
  return (
    <div className="space-y-8 relative">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <AnimatedAgents />
      </div>
      
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <FloatingElements />
      </div>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 relative z-10">
        <h1 className="text-2xl font-bold">Ihre Projekte</h1>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center relative z-10">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Projekte suchen..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="flex space-x-2 w-full sm:w-auto overflow-x-auto py-1">
          {Object.entries(filterTranslations).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${
                filter === key 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="relative z-10">
        <ProjectsByCompany 
          companies={filteredCompanies}
          loading={loading}
          error={error}
          basePath="/customer/projects"
        />
      </div>
    </div>
  );
};

export default CustomerProjects;
