
import { useEffect } from 'react';
import { useCompanyAssociation } from '@/hooks/use-company-association';
import Sidebar from './Sidebar';
import MainContent from './customer/MainContent';
import { toast } from '@/hooks/use-toast';

const CustomerLayout = () => {
  const { featuresUpdated, companyId, checkCompanyAssociation } = useCompanyAssociation();

  console.log('[CustomerLayout] Rendering with featuresUpdated:', featuresUpdated, 'companyId:', companyId);

  // Force check company association and features when this component mounts
  useEffect(() => {
    console.log('[CustomerLayout] Forcing check for company association and features');
    checkCompanyAssociation();
  }, [checkCompanyAssociation]);

  // Notify user when features are updated
  useEffect(() => {
    if (featuresUpdated > 0) {
      console.log('[CustomerLayout] Features were updated, featuresUpdated:', featuresUpdated);
      
      // We don't show this toast notification on initial load (featuresUpdated === 1)
      if (featuresUpdated > 1) {
        toast({
          title: "Features Updated",
          description: "Your available features have been updated",
          variant: "default"
        });
      }
    }
  }, [featuresUpdated]);

  // Using key with featuresUpdated to force Sidebar component to re-render when features change
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar 
        role="customer" 
        forceRefresh={featuresUpdated} 
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
