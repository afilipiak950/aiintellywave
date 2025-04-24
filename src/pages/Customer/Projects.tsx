
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerProjects } from '../../hooks/use-customer-projects';
import { AnimatedAgents } from '@/components/ui/animated-agents';
import { FloatingElements } from '@/components/outreach/FloatingElements';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { preloadProjectsInBackground } from '@/components/leads/lead-error-utils';

const CustomerProjects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [renderError, setRenderError] = useState<Error | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);
  
  // Preload projects in background on initial load
  useEffect(() => {
    preloadProjectsInBackground();
  }, []);
  
  // Wrap component in error boundary
  useEffect(() => {
    // Reset any previous render errors when component mounts
    setRenderError(null);
  }, []);
  
  // Use try-catch to prevent white screen on render errors
  try {
    const { 
      projects,
      loading, 
      error,
      fetchProjects,
      retryFetchProjects
    } = useCustomerProjects();
    
    console.log('CustomerProjects rendering with:', { 
      projectsCount: projects?.length, 
      loading, 
      error,
      searchTerm,
      filter
    });
    
    // Projekte basierend auf Filter und Suchbegriff filtern
    const filteredProjects = projects?.filter(project => 
      (filter === 'all' || 
      (filter === 'active' && project.status !== 'completed' && project.status !== 'canceled') ||
      (filter === 'completed' && project.status === 'completed') ||
      (filter === 'canceled' && project.status === 'canceled')) &&
      (project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];
    
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
    
    const handleRetry = async () => {
      setIsRefetching(true);
      toast({
        title: "Aktualisierung",
        description: "Projekte werden neu geladen...",
      });
      
      try {
        await fetchProjects();
      } catch (e) {
        console.error("Error during manual refresh:", e);
        retryFetchProjects();
      } finally {
        setIsRefetching(false);
      }
    };
    
    const renderProjectsList = () => {
      if (loading || isRefetching) {
        return (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
                <Skeleton className="h-6 bg-gray-200 rounded w-1/3 mb-6" />
                <Skeleton className="h-24 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        );
      }
      
      if (error) {
        return (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fehler</AlertTitle>
            <AlertDescription className="flex flex-col gap-4">
              <span>{error}</span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRetry}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Erneut versuchen
                </Button>
                <Button variant="outline" onClick={() => navigate('/customer')}>
                  <Home className="h-4 w-4 mr-2" />
                  Zum Dashboard
                </Button>
              </div>
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
            {searchTerm && (
              <Button
                variant="default"
                onClick={() => setSearchTerm('')}
                className="bg-indigo-500 hover:bg-indigo-600"
              >
                Filter zurücksetzen
              </Button>
            )}
          </div>
        );
      }
      
      return (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Ihre Projekte</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="text-xs"
                disabled={isRefetching}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
                Aktualisieren
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <div 
                  key={project.id}
                  className="border rounded-lg p-4 hover:border-indigo-300 transition-colors cursor-pointer shadow-sm hover:shadow"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <div className="flex justify-between">
                    <h4 className="font-medium truncate">{project.name}</h4>
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
          
          {/* Add troubleshooting info for users */}
          {projects.length > 0 && filteredProjects.length > 0 && (
            <div className="text-xs text-gray-500 text-center">
              <p>Projekte erfolgreich geladen: {projects.length}</p>
            </div>
          )}
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
  } catch (error) {
    // If there's an error during rendering, show a fallback UI
    console.error('Error rendering CustomerProjects:', error);
    setRenderError(error instanceof Error ? error : new Error(String(error)));
    
    // Fallback UI for render errors
    return (
      <div className="p-8 bg-white rounded-lg shadow border border-red-200">
        <div className="flex items-center gap-2 mb-4 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Rendering-Fehler</h2>
        </div>
        <p className="mb-4 text-gray-700">Beim Anzeigen der Projektseite ist ein Fehler aufgetreten.</p>
        
        <div className="p-3 bg-gray-50 rounded border border-gray-200 mb-4 overflow-auto max-h-40">
          <code className="text-xs text-red-500 whitespace-pre-wrap">
            {renderError ? renderError.message : 'Unbekannter Fehler'}
          </code>
        </div>
        
        <div className="flex gap-3">
          <Button variant="default" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Seite neu laden
          </Button>
          <Button variant="outline" onClick={() => navigate('/customer')}>
            <Home className="h-4 w-4 mr-2" />
            Zum Dashboard
          </Button>
        </div>
      </div>
    );
  }
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
