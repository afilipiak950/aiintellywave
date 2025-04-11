
import { useParams, useNavigate } from 'react-router-dom';
import ProjectDetail from '../../components/ui/project/ProjectDetail';
import { useEffect } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useActivityTracking } from '@/hooks/use-activity-tracking';
import CustomerDetailError from '@/components/ui/customer/CustomerDetailError';

const CustomerProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logProjectActivity, ActivityActions } = useActivityTracking();
  
  // Validate UUID format before proceeding
  const isValidUUID = id ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) : false;
  
  useEffect(() => {
    if (!id) {
      console.error('Project ID is missing');
      navigate('/customer/projects');
      return;
    }
    
    if (!isValidUUID) {
      console.error(`Invalid UUID format: "${id}"`);
      return;
    }
    
    // Log that this project was viewed by a customer
    logProjectActivity(
      id,
      'viewed project details',
      'Customer viewed project details',
      { viewed_by: 'customer' }
    );
  }, [id, navigate, logProjectActivity, ActivityActions, isValidUUID]);
  
  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <CustomerDetailError 
          error="Projekt-ID fehlt" 
          onRetry={() => navigate('/customer/projects')}
          onBack={() => navigate('/customer/projects')}
        />
      </div>
    );
  }
  
  if (!isValidUUID) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <CustomerDetailError 
          error={`Die Projekt-ID "${id}" ist keine gültige UUID`} 
          onRetry={() => navigate('/customer/projects')}
          onBack={() => navigate('/customer/projects')}
        />
      </div>
    );
  }
  
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6">
          <CustomerDetailError 
            error={`Fehler beim Laden der Projektdetails für ID "${id}"`}
            onRetry={() => window.location.reload()}
            onBack={() => navigate('/customer/projects')}
          />
        </div>
      }
    >
      <div className="p-6">
        <ProjectDetail projectId={id} />
      </div>
    </ErrorBoundary>
  );
};

export default CustomerProjectDetail;
