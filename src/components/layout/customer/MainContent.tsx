
import { useEffect, useCallback, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../Header';
import { useAuth } from '@/context/auth';
import { useCompanyFeatures } from '@/hooks/use-company-features';
import { toast } from '@/hooks/use-toast';

interface MainContentProps {
  featuresUpdated: number;
}

const MainContent = ({ featuresUpdated }: MainContentProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const { features, loading, error, fetchCompanyFeatures } = useCompanyFeatures();
  const featuresLoadedRef = useRef(false);
  const isJobParsingRoute = location.pathname.includes('/job-parsing');
  const visibilityRef = useRef(document.visibilityState);
  
  // Load features once when mounting and when featuresUpdated changes
  const loadFeaturesOnce = useCallback(() => {
    // Skip loading for job-parsing route to prevent reloads
    if (isJobParsingRoute) {
      console.log('[MainContent] Skipping features load for job-parsing route');
      return;
    }
    
    // Only load if the document is visible and features haven't been loaded yet
    if (user && !featuresLoadedRef.current && document.visibilityState === 'visible') {
      console.log('[MainContent] Loading features data...');
      featuresLoadedRef.current = true;
      fetchCompanyFeatures().catch(err => {
        console.error('[MainContent] Failed to load features:', err);
      });
    }
  }, [user, fetchCompanyFeatures, isJobParsingRoute]);
  
  // Effect for handling visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const prevVisibility = visibilityRef.current;
      const currentVisibility = document.visibilityState;
      visibilityRef.current = currentVisibility;
      
      console.log(`[MainContent] Visibility changed: ${prevVisibility} -> ${currentVisibility}`);
      
      // DO NOT perform any actions on tab switching - this prevents additional refreshes
    };
    
    // Add visibility change event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Add a small delay before loading features to ensure authentication is complete
    const timer = setTimeout(() => {
      if (document.visibilityState === 'visible') {
        loadFeaturesOnce();
      }
    }, 500);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadFeaturesOnce, featuresUpdated]);

  return (
    <div className="flex-1 flex flex-col ml-64">
      <Header />
      
      <main className="flex-1 overflow-auto p-6 transition-all duration-300 ease-in-out">
        {/* Debug-Refresh-Button has been completely removed */}
        <Outlet />
      </main>
    </div>
  );
};

export default MainContent;
