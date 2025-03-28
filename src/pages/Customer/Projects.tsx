
import { useState } from 'react';
import { useCustomerProjects } from '../../hooks/use-customer-projects';
import ProjectFilterSearch from '../../components/ui/project/ProjectFilterSearch';
import ProjectsByCompany from '../../components/ui/project/ProjectsByCompany';
import { AnimatedAgents } from '@/components/ui/animated-agents';
import { FloatingElements } from '@/components/outreach/FloatingElements';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from '@/components/ui/button';

const CustomerProjects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  const { 
    projects,
    loading, 
    error,
    fetchProjects
  } = useCustomerProjects();
  
  // Filtere Unternehmen und deren Projekte basierend auf Suchbegriff und Filter
  const filteredCompanies = projects && projects.length > 0 ? [{
    id: 'current-company',
    name: 'Your Company',
    description: '',
    projects: projects.filter(project => 
      (filter === 'all' || 
       (filter === 'active' && project.status !== 'completed' && project.status !== 'canceled') ||
       (filter === 'completed' && project.status === 'completed') ||
       (filter === 'canceled' && project.status === 'canceled')) &&
      (project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       project.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }].filter(company => company.projects.length > 0) : [];
  
  // Deutsche Übersetzungen für Filter
  const filterTranslations = {
    all: 'Alle',
    active: 'Aktiv',
    completed: 'Abgeschlossen',
    canceled: 'Abgebrochen'
  };
  
  // Angepasste Filter für deutsche Sprache
  const handleFilterChange = (value: string) => {
    setFilter(value);
  };
  
  return (
    <div className="space-y-8 relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <AnimatedAgents />
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
      
      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="relative z-10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>Failed to load projects. Please try again.</span>
            <Button variant="outline" onClick={fetchProjects}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Projekte nach Unternehmen */}
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
