
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerProjects } from '../../hooks/use-customer-projects';
import { AnimatedAgents } from '@/components/ui/animated-agents';
import { FloatingElements } from '@/components/outreach/FloatingElements';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth';

const CustomerProjects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  const { 
    projects,
    loading, 
    error,
    fetchProjects
  } = useCustomerProjects();
  
  const filteredProjects = projects.filter(project => 
    (filter === 'all' || 
     (filter === 'active' && project.status !== 'completed' && project.status !== 'canceled') ||
     (filter === 'completed' && project.status === 'completed') ||
     (filter === 'canceled' && project.status === 'canceled')) &&
    (project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     project.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const filterTranslations = {
    all: 'Alle',
    active: 'Aktiv',
    completed: 'Abgeschlossen',
    canceled: 'Abgebrochen'
  };
  
  const handleFilterChange = (value: string) => {
    setFilter(value);
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/customer/projects/${projectId}`);
  };
  
  const renderProjectsList = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                {[1, 2].map((j) => (
                  <div key={j} className="h-24 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (error) {
      return (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>Failed to load projects. Please try again.</span>
            <Button variant="outline" onClick={fetchProjects}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      );
    }
    
    if (filteredProjects.length === 0) {
      return (
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <h3 className="text-lg font-medium mb-2">Keine Projekte gefunden</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 
              `Keine Projekte für "${searchTerm}" gefunden.` : 
              'Sie haben derzeit keine Projekte.'
            }
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Ihre Projekte</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <div 
                key={project.id}
                className="border rounded-lg p-4 hover:border-indigo-300 transition-colors cursor-pointer"
                onClick={() => handleProjectClick(project.id)}
              >
                <div className="flex justify-between">
                  <h4 className="font-medium">{project.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    project.status === 'completed' ? 'bg-green-100 text-green-700' :
                    project.status === 'canceled' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {getStatusInGerman(project.status)}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                  {project.description || 'Keine Beschreibung'}
                </p>
                
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Fortschritt</span>
                    <span className="text-xs font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-indigo-600 h-1.5 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-8 relative">
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
      
      <div className="relative z-10">
        {renderProjectsList()}
      </div>
    </div>
  );
};

const getStatusInGerman = (status: string): string => {
  const statusMap: Record<string, string> = {
    'planning': 'Planung',
    'in_progress': 'In Bearbeitung',
    'review': 'Überprüfung',
    'completed': 'Abgeschlossen',
    'canceled': 'Abgebrochen',
    'on_hold': 'Pausiert'
  };
  
  return statusMap[status] || status;
};

export default CustomerProjects;
