
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerProjects } from '../../hooks/use-customer-projects';
import { AnimatedAgents } from '@/components/ui/animated-agents';
import { FloatingElements } from '@/components/outreach/FloatingElements';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Home, Search, Filter, Folder } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { preloadProjectsInBackground } from '@/components/leads/lead-error-utils';
import { motion } from 'framer-motion';
import { ProjectsPageHeader } from '@/components/customer/projects/ProjectsPageHeader';
import { ProjectsGrid } from '@/components/customer/projects/ProjectsGrid';

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
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-sm border"
              >
                <Skeleton className="h-6 bg-gray-200 rounded w-1/3 mb-6" />
                <Skeleton className="h-24 bg-gray-100 rounded" />
              </motion.div>
            ))}
          </div>
        );
      }
      
      if (error) {
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
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
          </motion.div>
        );
      }
      
      if (filteredProjects.length === 0) {
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-lg shadow-sm border text-center"
          >
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
          </motion.div>
        );
      }
      
      return <ProjectsGrid projects={filteredProjects} onProjectClick={handleProjectClick} />;
    };
    
    return (
      <div className="space-y-8 relative min-h-screen">
        {/* Enhanced animated background */}
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-full h-full">
            <AnimatedAgents />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-full transform rotate-180">
            <FloatingElements />
          </div>
        </div>
        
        {/* Page content with animations */}
        <div className="relative z-10">
          <ProjectsPageHeader 
            filter={filter} 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onFilterChange={handleFilterChange}
            filterTranslations={filterTranslations}
          />
          
          <motion.div 
            className="relative z-10 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {renderProjectsList()}
          </motion.div>
        </div>
      </div>
    );
  } catch (error) {
    // If there's an error during rendering, show a fallback UI
    console.error('Error rendering CustomerProjects:', error);
    setRenderError(error instanceof Error ? error : new Error(String(error)));
    
    // Fallback UI for render errors
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-8 bg-white rounded-lg shadow border border-red-200"
      >
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
      </motion.div>
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
