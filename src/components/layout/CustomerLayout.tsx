
import { useEffect, useState, useRef } from 'react';
import { useCompanyAssociation } from '@/hooks/use-company-association';
import Sidebar from './Sidebar';
import MainContent from './customer/MainContent';

const CustomerLayout = () => {
  const { featuresUpdated, companyId, checkCompanyAssociation } = useCompanyAssociation();
  const [forceRefresh, setForceRefresh] = useState(0);
  const initialCheckDoneRef = useRef(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only check company association once on mount
    if (!initialCheckDoneRef.current) {
      checkCompanyAssociation();
      initialCheckDoneRef.current = true;
      
      // Reduce refresh frequency to once every 5 minutes instead of 30 seconds
      refreshIntervalRef.current = setInterval(() => {
        setForceRefresh(prev => prev + 1);
        console.log("[CustomerLayout] Checking for updates to layout");
      }, 300000); // 5 minutes
    }
    
    // Clean up interval on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [checkCompanyAssociation]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar 
        role="customer" 
        forceRefresh={featuresUpdated + forceRefresh} 
        key={`sidebar-${featuresUpdated}`} 
      />
      <MainContent 
        featuresUpdated={featuresUpdated} 
        key={`content-${featuresUpdated}`}
      />
    </div>
  );
};

export default CustomerLayout;
