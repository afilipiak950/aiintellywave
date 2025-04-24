
import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerProjects } from '../../hooks/use-customer-projects';
import { FloatingElements } from '@/components/outreach/FloatingElements';
import { AlertCircle } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useProjectFilters } from '@/hooks/use-project-filters';
import { ProjectFilters } from '@/components/customer/ProjectFilters';
import { ProjectList } from '@/components/customer/ProjectList';
import CustomerProjectsContainer from '@/components/customer/CustomerProjectsContainer';

const AnimatedAgents = lazy(() => import('@/components/ui/animated-agents').then(mod => ({ default: mod.AnimatedAgents })));

const CustomerProjects = () => {
  const navigate = useNavigate();
  const [renderError, setRenderError] = useState<Error | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);
  
  useEffect(() => {
    setRenderError(null);
  }, []);
  
  try {
    const { 
      projects,
      error,
      retryFetchProjects,
      isFallbackData 
    } = useCustomerProjects();

    const {
      searchTerm,
      setSearchTerm,
      filter,
      setFilter,
      filteredProjects
    } = useProjectFilters(projects);

    const handleRetry = async () => {
      setIsRefetching(true);
      try {
        await retryFetchProjects();
      } finally {
        setIsRefetching(false);
      }
    };

    if (error) {
      return (
        <div className="rounded-md bg-destructive/15 p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <AlertCircle className="h-5 w-5 text-destructive mr-2" />
            <p className="text-destructive font-medium">Fehler</p>
          </div>
          <p className="text-destructive/80 mb-4">
            {error.includes('infinite recursion') 
              ? "Datenbankberechtigungsfehler: Bitte versuchen Sie es erneut oder kontaktieren Sie den Support."
              : error}
          </p>
          <div className="flex justify-center gap-2">
            <Button 
              variant="outline"
              className="border-destructive/50 hover:bg-destructive/10 text-destructive"
              onClick={handleRetry}
            >
              Erneut versuchen
            </Button>
          </div>
        </div>
      );
    }

    return (
      <CustomerProjectsContainer
        title="Ihre Projekte"
        subtitle="Verwalten und überwachen Sie Ihre aktuellen Projekte"
      >
        <ProjectFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filter={filter}
          onFilterChange={setFilter}
        />
        
        <div className="relative z-10">
          <ProjectList
            projects={filteredProjects}
            isFallbackData={isFallbackData}
            onRetry={handleRetry}
            isRefetching={isRefetching}
            onProjectClick={(id) => navigate(`/customer/projects/${id}`)}
          />
        </div>
        
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          <Suspense fallback={null}>
            <AnimatedAgents />
          </Suspense>
          <FloatingElements />
        </div>
      </CustomerProjectsContainer>
    );
  } catch (error) {
    console.error('Error rendering CustomerProjects:', error);
    setRenderError(error instanceof Error ? error : new Error(String(error)));
    
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
            Seite neu laden
          </Button>
          <Button variant="outline" onClick={() => navigate('/customer')}>
            Zum Dashboard
          </Button>
        </div>
      </div>
    );
  }
};

export default CustomerProjects;
