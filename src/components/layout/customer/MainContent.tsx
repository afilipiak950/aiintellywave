
import { useEffect, useCallback, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
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
  const { user } = useAuth();
  const { features, loading, error, fetchCompanyFeatures } = useCompanyFeatures();
  const featuresLoadedRef = useRef(false);
  
  // Debug function to manually refresh features
  const handleManualRefresh = async () => {
    console.log('[MainContent] Manually refreshing features...');
    toast({
      title: "Refreshing Features",
      description: "Checking your available features..."
    });
    
    try {
      await fetchCompanyFeatures();
      featuresLoadedRef.current = true; // Mark as loaded after successful refresh
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
  
  // Load features once on mount and when featuresUpdated changes
  const loadFeaturesOnce = useCallback(() => {
    // Skip loading for job-parsing route to prevent reloads
    if (location.pathname.includes('/job-parsing')) {
      return;
    }
    
    if (user && !featuresLoadedRef.current) {
      console.log('[MainContent] Loading features data...');
      featuresLoadedRef.current = true;
      fetchCompanyFeatures().catch(err => {
        console.error('[MainContent] Failed to load features:', err);
        // Don't reset featuresLoadedRef here to prevent repeated fetches on error
      });
    }
  }, [user, fetchCompanyFeatures, location.pathname]);
  
  useEffect(() => {
    // Don't reload features if we're on the job parsing page
    if (!location.pathname.includes('/job-parsing')) {
      loadFeaturesOnce();
    }
  }, [loadFeaturesOnce, featuresUpdated, location.pathname]);
  
  // Separate useEffect for logging only - prevents unnecessary re-renders
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
    
    // Only log the current path - no redirections here
    if (location.pathname) {
      console.log(`[MainContent] User is on ${location.pathname} page`);
    }
  }, [location.pathname, features, loading, error]);

  return (
    <div className="flex-1 flex flex-col ml-64">
      <Header />
      
      <main className="flex-1 overflow-auto p-6 transition-all duration-300 ease-in-out">
        {/* Debug refresh button - visible only in development */}
        {process.env.NODE_ENV === 'development' && !location.pathname.includes('/job-parsing') && (
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
