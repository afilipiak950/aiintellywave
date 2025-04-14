
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '../Header';
import { useAuth } from '@/context/auth';
import { useCompanyFeatures } from '@/hooks/use-company-features';

interface MainContentProps {
  featuresUpdated: number;
}

const MainContent = ({ featuresUpdated }: MainContentProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { features, loading } = useCompanyFeatures();
  
  // Handle navigation to job-parsing based on feature flag
  useEffect(() => {
    // Check if we're on the job-parsing page but the feature is disabled
    if (location.pathname === '/customer/job-parsing' && 
        !loading && 
        features && 
        features.google_jobs_enabled === false) {
      console.log('[MainContent] Redirecting from job-parsing as feature is disabled');
      navigate('/customer/dashboard');
    }
    
    console.log('[MainContent] Features updated:', featuresUpdated, 'Current features:', features);
  }, [location.pathname, features, loading, navigate, featuresUpdated]);

  return (
    <div className="flex-1 flex flex-col ml-64">
      <Header />
      
      <main className="flex-1 overflow-auto p-6 transition-all duration-300 ease-in-out">
        <Outlet />
      </main>
    </div>
  );
};

export default MainContent;
