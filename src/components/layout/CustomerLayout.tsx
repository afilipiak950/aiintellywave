
import { useEffect } from 'react';
import { useCompanyAssociation } from '@/hooks/use-company-association';
import Sidebar from './Sidebar';
import MainContent from './customer/MainContent';
import { toast } from '@/hooks/use-toast';

const CustomerLayout = () => {
  const { featuresUpdated, companyId, checkCompanyAssociation } = useCompanyAssociation();

  useEffect(() => {
    checkCompanyAssociation();
  }, [checkCompanyAssociation]);

  useEffect(() => {
    if (featuresUpdated > 0 && featuresUpdated > 1) {
      toast({
        title: "Features Updated",
        description: "Your available features have been updated",
        variant: "default"
      });
    }
  }, [featuresUpdated]);

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
