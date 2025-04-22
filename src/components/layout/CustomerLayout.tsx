
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
  const isJobParsingRoute = location.pathname.includes('/job-parsing');

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
      
      // DO NOT perform any actions on tab switching - this prevents refresh
    };
    
    // Add event listener for visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Only set up an interval if we're not in the job-parsing route
    if (!isJobParsingRoute) {
      refreshIntervalRef.current = setInterval(() => {
        // Only update if the document is actually visible
        if (document.visibilityState === 'visible') {
          console.log("[CustomerLayout] Checking for updates to layout");
          setForceRefresh(prev => prev + 1);
        }
      }, 300000); // 5 minutes
    }
    
    // Clean up interval when unmounting
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkCompanyAssociation, location.pathname]);

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <Sidebar role="customer" />
      <MainContent 
        featuresUpdated={featuresUpdated} 
        key={`content-${featuresUpdated}`}
      />
    </div>
  );
};

export default CustomerLayout;
