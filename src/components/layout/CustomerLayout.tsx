
import { useEffect, useState } from 'react';
import { useCompanyAssociation } from '@/hooks/use-company-association';
import Sidebar from './Sidebar';
import MainContent from './customer/MainContent';

const CustomerLayout = () => {
  const { featuresUpdated, companyId, checkCompanyAssociation } = useCompanyAssociation();
  const [forceRefresh, setForceRefresh] = useState(0);

  useEffect(() => {
    checkCompanyAssociation();
    
    // Force a layout refresh every 30 seconds to ensure new features appear
    const refreshInterval = setInterval(() => {
      setForceRefresh(prev => prev + 1);
      console.log("[CustomerLayout] Forcing refresh of layout");
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [checkCompanyAssociation]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar 
        role="customer" 
        forceRefresh={featuresUpdated + forceRefresh} 
        key={`sidebar-${featuresUpdated}-${forceRefresh}`} 
      />
      <MainContent 
        featuresUpdated={featuresUpdated} 
        key={`content-${featuresUpdated}-${forceRefresh}`}
      />
    </div>
  );
};

export default CustomerLayout;
