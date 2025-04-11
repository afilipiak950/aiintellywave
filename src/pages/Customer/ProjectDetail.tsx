
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
  
  useEffect(() => {
    if (!id) {
      console.error('Project ID is missing');
      navigate('/customer/projects');
    } else {
      // Log that this project was viewed by a customer
      logProjectActivity(
        id,
        'viewed project details',
        'Customer viewed project details',
        { viewed_by: 'customer' }
      );
    }
  }, [id, navigate, logProjectActivity, ActivityActions]);
  
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
  
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6">
          <CustomerDetailError 
            error="Fehler beim Laden der Projektdetails" 
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
