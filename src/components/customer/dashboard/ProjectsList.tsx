
import { useNavigate } from 'react-router-dom';
import { useCustomerProjects } from '../../../hooks/use-customer-projects';
import { Skeleton } from '../../../components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home, InfoIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

const ProjectsList = () => {
  const navigate = useNavigate();
  const { projects, loading, error, retryFetchProjects, isFallbackData } = useCustomerProjects();
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [hasCachedData, setHasCachedData] = useState(false);
  const [renderError, setRenderError] = useState<Error | null>(null);
  
  // Reset any render errors when component mounts
  useEffect(() => {
    setRenderError(null);
  }, []);
  
  // Set initial load state for better UX
  useEffect(() => {
    if (!loading) {
      setInitialLoadDone(true);
    }
  }, [loading]);
  
  // Check if there's cached data
  useEffect(() => {
    try {
      const cachedProjects = localStorage.getItem('dashboard_projects');
      if (cachedProjects) {
        setHasCachedData(true);
      }
    } catch (err) {
      console.warn('Failed to check cached projects:', err);
    }
  }, []);
  
  // Log project status for debugging
  useEffect(() => {
    console.log('ProjectsList rendered with:', { 
      projectsCount: projects?.length, 
      loading, 
      error,
      initialLoadDone,
      hasCachedData,
      isFallbackData,
      projectNames: projects?.map(p => p.name)
    });
  }, [projects, loading, error, initialLoadDone, hasCachedData, isFallbackData]);

  // Catch rendering errors
  try {
    if (loading && !initialLoadDone && !hasCachedData) {
      return <ProjectsLoading />;
    }

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
              onClick={() => {
                retryFetchProjects();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Erneut versuchen
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4 mr-2" />
              Startseite
            </Button>
          </div>
        </div>
      );
    }
    
    if (!projects || projects.length === 0) {
      return <EmptyProjects navigate={navigate} />;
    }
    
    return (
      <div className="space-y-4">
        {isFallbackData && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 flex items-start">
            <InfoIcon className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-amber-800">
                Zwischengespeicherte Daten werden angezeigt. 
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm text-amber-800 underline ml-1"
                  onClick={() => retryFetchProjects()}
                >
                  Neu laden
                </Button>
              </p>
            </div>
          </div>
        )}
        
        {projects.map((project) => (
          <ProjectItem 
            key={project.id} 
            project={project} 
            onClick={() => navigate(`/customer/projects/${project.id}`)} 
          />
        ))}
        
        <div className="text-center pt-2">
          <button 
            className="px-4 py-2 text-indigo-600 hover:text-indigo-800 transition-colors flex items-center justify-center mx-auto"
            onClick={() => navigate('/customer/projects')}
          >
            Alle Projekte anzeigen →
          </button>
        </div>
      </div>
    );
  } catch (error) {
    // If there's an error during rendering, log it and show a fallback UI
    console.error('Error rendering ProjectsList:', error);
    setRenderError(error instanceof Error ? error : new Error(String(error)));
    
    // Simple fallback UI for render errors
    return (
      <div className="rounded-md bg-red-50 border border-red-200 p-4">
        <div className="flex items-center gap-2 mb-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <h3 className="font-medium">Anzeigeprobleme</h3>
        </div>
        <p className="text-sm text-gray-700 mb-3">Bei der Anzeige der Projekte ist ein Fehler aufgetreten.</p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => retryFetchProjects()}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Neu laden
          </Button>
        </div>
      </div>
    );
  }
};

// Helper component for loading state
const ProjectsLoading = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="border rounded-lg p-4">
        <Skeleton className="h-5 w-1/4 mb-4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-3">
          <Skeleton className="w-full h-1.5 mt-4" />
        </div>
      </div>
    ))}
  </div>
);

// Helper component for empty state
interface EmptyProjectsProps {
  navigate: (path: string) => void;
}

const EmptyProjects = ({ navigate }: EmptyProjectsProps) => (
  <div className="text-center py-8">
    <p className="text-gray-500 mb-4">Sie haben derzeit keine aktiven oder zugewiesenen Projekte.</p>
    <Button 
      variant="default"
      className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
      onClick={() => navigate('/customer/projects')}
    >
      Zur Projektübersicht
    </Button>
  </div>
);

// Helper component for project item
interface ProjectItemProps {
  project: {
    id: string;
    name: string;
    status: string;
    progress: number;
  };
  onClick: () => void;
}

const ProjectItem = ({ project, onClick }: ProjectItemProps) => (
  <div 
    className="border rounded-lg p-4 hover:border-indigo-300 transition-colors cursor-pointer"
    onClick={onClick}
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
);

// Helper function to translate status
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

export default ProjectsList;
