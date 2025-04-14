
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '../Header';
import { useAuth } from '@/context/auth';
import { useCompanyFeatures } from '@/hooks/use-company-features';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MainContentProps {
  featuresUpdated: number;
}

const MainContent = ({ featuresUpdated }: MainContentProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { features, loading, error, fetchCompanyFeatures } = useCompanyFeatures();
  
  // Debug function to manually refresh features
  const handleManualRefresh = async () => {
    console.log('[MainContent] Manually refreshing features...');
    toast({
      title: "Refreshing Features",
      description: "Checking your available features..."
    });
    
    try {
      await fetchCompanyFeatures();
      toast({
        title: "Features Refreshed",
        description: "Your features have been refreshed.",
      });
    } catch (err) {
      console.error('[MainContent] Error refreshing features:', err);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh features. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Remove the redirection logic which was causing the issue
  useEffect(() => {
    if (loading) {
      console.log('[MainContent] Still loading features data...');
      return;
    }
    
    if (error) {
      console.error('[MainContent] Error loading features:', error);
      return;
    }
    
    console.log('[MainContent] Features loaded:', features);
    
    // Remove the redirection logic for job-parsing that was causing the issue
    // Instead, just log that we're on the job-parsing page
    if (location.pathname === '/customer/job-parsing') {
      console.log('[MainContent] User is on job-parsing page');
    }
    
    // Check if we're on the manager-kpi page
    if (location.pathname === '/customer/manager-kpi') {
      console.log('[MainContent] User is on manager-kpi page, feature check handled by its component');
    }
    
    console.log('[MainContent] Features updated:', featuresUpdated, 'Current features:', features);
  }, [location.pathname, features, loading, error, navigate, featuresUpdated]);

  return (
    <div className="flex-1 flex flex-col ml-64">
      <Header />
      
      <main className="flex-1 overflow-auto p-6 transition-all duration-300 ease-in-out">
        {/* Debug refresh button - visible only in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh}
              className="text-xs flex items-center gap-1 opacity-70 hover:opacity-100"
            >
              <RefreshCw size={12} />
              Refresh Features
            </Button>
          </div>
        )}
        
        <Outlet />
      </main>
    </div>
  );
};

export default MainContent;
