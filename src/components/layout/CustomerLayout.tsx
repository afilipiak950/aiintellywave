
import { useEffect } from 'react';
import { useCompanyAssociation } from '@/hooks/use-company-association';
import Sidebar from './Sidebar';
import MainContent from './customer/MainContent';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

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

  // Force manual refresh function (only in development)
  const handleForceRefresh = () => {
    console.log('[CustomerLayout] Manually forcing refresh');
    checkCompanyAssociation();
    toast({
      title: "Refreshing",
      description: "Manually refreshing features and permissions..."
    });
  };

  // Using key with featuresUpdated to force Sidebar component to re-render when features change
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Debug panel in development mode */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 right-0 z-50 p-2 bg-black/75 text-white text-xs m-2 rounded">
          <div>Features Updated: {featuresUpdated}</div>
          <div>Company ID: {companyId || 'None'}</div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleForceRefresh} 
            className="mt-1 text-[10px] h-6 w-full"
          >
            <RefreshCw className="mr-1 h-3 w-3" /> Force Refresh
          </Button>
        </div>
      )}
      
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
