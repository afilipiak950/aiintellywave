
import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useCompanyAssociation } from '@/hooks/use-company-association';
import Sidebar from './Sidebar';
import MainContent from './customer/MainContent';

const CustomerLayout = () => {
  const location = useLocation();
  const { featuresUpdated, companyId, checkCompanyAssociation } = useCompanyAssociation();
  const [forceRefresh, setForceRefresh] = useState(0);
  const initialCheckDoneRef = useRef(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const documentVisibilityRef = useRef(document.visibilityState);
  const lastRefreshTimeRef = useRef(Date.now());
  
  // Optimized route blacklist - specify routes that should never trigger automatic refreshes
  const REFRESH_BLACKLIST = [
    '/job-parsing',
    '/lead-database', 
    '/search-strings',
    '/pipeline'  // Add pipeline to prevent excessive refreshes
  ];
  
  const isBlacklistedRoute = useCallback(() => {
    return REFRESH_BLACKLIST.some(route => location.pathname.includes(route));
  }, [location.pathname]);

  // Function that only runs when the document is actually visible with rate limiting
  const checkAssociationIfVisible = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current;
    
    // Only check if visible and at least 1 second has passed since last refresh
    if (document.visibilityState === 'visible' && 
        (!initialCheckDoneRef.current || timeSinceLastRefresh > 1000)) {
      console.log('[CustomerLayout] Initial company association check');
      checkCompanyAssociation();
      initialCheckDoneRef.current = true;
      lastRefreshTimeRef.current = now;
    }
  }, [checkCompanyAssociation]);

  // Execute only once when mounting
  useEffect(() => {
    // Only perform initial check if the document is visible
    checkAssociationIfVisible();
    
    // Visibility change handler to avoid unwanted updates
    const handleVisibilityChange = () => {
      const currentVisibility = document.visibilityState;
      console.log(`[CustomerLayout] Visibility changed: ${documentVisibilityRef.current} -> ${currentVisibility}`);
      
      // Update reference value for later use
      documentVisibilityRef.current = currentVisibility;
    };
    
    // Add event listener for visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Do not set up interval on problematic routes
    const shouldSkipRefresh = isBlacklistedRoute();
    
    if (!shouldSkipRefresh) {
      // Increase refresh interval to 60 minutes (3600000 ms) for better performance
      refreshIntervalRef.current = setInterval(() => {
        // Only update if the document is actually visible
        if (document.visibilityState === 'visible') {
          console.log("[CustomerLayout] Checking for updates to layout");
          setForceRefresh(prev => prev + 1);
        }
      }, 3600000); // 60 minutes
    }
    
    // Clean up interval when unmounting
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkAssociationIfVisible, isBlacklistedRoute]);

  // Track route changes to avoid unnecessary refreshes, with memoization
  useEffect(() => {
    // Clean up any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    
    // Only set up refresh interval for non-problematic routes
    if (!isBlacklistedRoute()) {
      refreshIntervalRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          console.log("[CustomerLayout] Scheduled layout check");
          setForceRefresh(prev => prev + 1);
        }
      }, 3600000); // 60 minutes
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [location.pathname, isBlacklistedRoute]);

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <Sidebar role="customer" />
      <MainContent 
        featuresUpdated={featuresUpdated} 
        key={`content-${location.pathname}`} // Only re-render on route change
      />
    </div>
  );
};

export default CustomerLayout;
