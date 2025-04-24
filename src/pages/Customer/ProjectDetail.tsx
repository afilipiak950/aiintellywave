
import { useParams, useNavigate } from 'react-router-dom';
import ProjectDetail from '../../components/ui/project/ProjectDetail';
import { useEffect, useState } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useActivityTracking } from '@/hooks/use-activity-tracking';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import PipelineError from '@/components/pipeline/PipelineError';

const CustomerProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logProjectActivity } = useActivityTracking();
  const [retryCount, setRetryCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!id) {
      console.error('Project ID is missing');
      navigate('/customer/projects');
      return;
    }
    
    try {
      // Log that this project was viewed by a customer
      logProjectActivity(
        id,
        'viewed project details',
        'Customer viewed project details',
        { viewed_by: 'customer', retry_count: retryCount }
      );
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }, [id, navigate, logProjectActivity, retryCount]);
  
  const handleRetry = () => {
    setIsRefreshing(true);
    setLocalError(null);
    setRetryCount(prev => prev + 1);
    
    // Use timeout to ensure state updates and component remounts
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };
  
  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] p-6">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <p className="text-red-500 mb-4 text-lg font-medium">Project ID is required</p>
        <Button 
          onClick={() => navigate('/customer/projects')}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Back to Projects
        </Button>
      </div>
    );
  }
  
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 my-4">
            <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error loading project details
            </h2>
            <p className="text-gray-700 mb-4">There was an error loading the project details. Please try again.</p>
            <div className="flex gap-3">
              <Button 
                onClick={handleRetry}
                variant="default"
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button 
                onClick={() => navigate('/customer/projects')}
                variant="outline"
              >
                Back to Projects
              </Button>
            </div>
          </div>
        </div>
      }
      key={`project-detail-${id}-${retryCount}`}
    >
      <div className="p-6">
        {localError ? (
          <PipelineError 
            error={localError}
            onRetry={handleRetry}
            isRefreshing={isRefreshing}
          />
        ) : (
          <ProjectDetail 
            projectId={id} 
            key={`project-${id}-${retryCount}`} 
            onError={setLocalError}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default CustomerProjectDetail;
