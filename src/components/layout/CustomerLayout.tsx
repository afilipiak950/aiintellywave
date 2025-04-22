
import { useEffect, useState, useRef } from 'react';
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
  
  // Define routes that are problematic and should avoid auto-refresh completely
  const isJobParsingRoute = location.pathname.includes('/job-parsing');
  const isLeadDatabaseRoute = location.pathname.includes('/lead-database');
  const isSearchStringsRoute = location.pathname.includes('/search-strings');
  const prevPathRef = useRef(location.pathname);

  // Function that only runs when the document is actually visible
  const checkAssociationIfVisible = () => {
    if (document.visibilityState === 'visible' && !initialCheckDoneRef.current) {
      console.log('[CustomerLayout] Initial company association check');
      checkCompanyAssociation();
      initialCheckDoneRef.current = true;
    }
  };

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
    const shouldSkipRefresh = isJobParsingRoute || isLeadDatabaseRoute || isSearchStringsRoute;
    
    if (!shouldSkipRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        // Only update if the document is actually visible
        if (document.visibilityState === 'visible') {
          console.log("[CustomerLayout] Checking for updates to layout");
          setForceRefresh(prev => prev + 1);
        }
      }, 1800000); // 30 minutes instead of 10 minutes
    }
    
    // Clean up interval when unmounting
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkCompanyAssociation, isJobParsingRoute, isLeadDatabaseRoute, isSearchStringsRoute]);

  // Track route changes to avoid unnecessary refreshes
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Only do initial check when the route changes
    if (prevPathRef.current !== currentPath) {
      console.log(`[CustomerLayout] Route changed: ${prevPathRef.current} -> ${currentPath}`);
      prevPathRef.current = currentPath;
      
      // Set up route-specific behavior
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      
      // Only set up refresh interval for non-problematic routes
      const shouldSkipRefresh = currentPath.includes('/job-parsing') || 
                                currentPath.includes('/lead-database') || 
                                currentPath.includes('/search-strings');
      
      if (!shouldSkipRefresh) {
        refreshIntervalRef.current = setInterval(() => {
          if (document.visibilityState === 'visible') {
            console.log("[CustomerLayout] Scheduled layout check");
            setForceRefresh(prev => prev + 1);
          }
        }, 1800000); // 30 minutes
      }
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <Sidebar role="customer" />
      <MainContent 
        featuresUpdated={featuresUpdated} 
        key={`content-${location.pathname}`} // Only re-render on route change, not on featuresUpdated
      />
    </div>
  );
};

export default CustomerLayout;
