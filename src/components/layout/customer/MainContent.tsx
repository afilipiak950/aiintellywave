
import { Outlet } from 'react-router-dom';
import Header from '../Header';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useCompanyFeatures } from '@/hooks/use-company-features';

const MainContent = () => {
  const { fetchCompanyFeatures } = useCompanyFeatures();
  
  // Debug function to manually refresh features
  const handleManualRefresh = async () => {
    console.log('[MainContent] Manually refreshing features...');
    toast({
      title: "Refreshing Features",
      description: "Checking your available features..."
    });
    
    try {
      await fetchCompanyFeatures();
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

  return (
    <div className="flex-1 flex flex-col ml-64">
      <Header />
      
      <main className="flex-1 overflow-auto p-6 transition-all duration-300 ease-in-out">
        {/* Debug refresh button - visible only in development */}
        {process.env.NODE_ENV === 'development' && (
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
