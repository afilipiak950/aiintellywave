
import { useEffect, useCallback, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../Header';
import { useAuth } from '@/context/auth';
import { useCompanyFeatures } from '@/hooks/use-company-features';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
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
  
  // Debug-Funktion zum manuellen Aktualisieren von Features
  const handleManualRefresh = async () => {
    console.log('[MainContent] Manually refreshing features...');
    toast({
      title: "Refreshing Features",
      description: "Checking your available features..."
    });
    
    try {
      await fetchCompanyFeatures();
      featuresLoadedRef.current = true; // Als geladen markieren nach erfolgreicher Aktualisierung
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
  
  // Features einmal beim Mounten und bei Änderung von featuresUpdated laden
  const loadFeaturesOnce = useCallback(() => {
    // Skip loading for job-parsing route to prevent reloads
    if (isJobParsingRoute) {
      console.log('[MainContent] Skipping features load for job-parsing route');
      return;
    }
    
    // Nur laden, wenn das Dokument sichtbar ist und die Features noch nicht geladen wurden
    if (user && !featuresLoadedRef.current && document.visibilityState === 'visible') {
      console.log('[MainContent] Loading features data...');
      featuresLoadedRef.current = true;
      fetchCompanyFeatures().catch(err => {
        console.error('[MainContent] Failed to load features:', err);
      });
    }
  }, [user, fetchCompanyFeatures, isJobParsingRoute]);
  
  // Effekt für die Verarbeitung von Sichtbarkeitsänderungen
  useEffect(() => {
    const handleVisibilityChange = () => {
      const prevVisibility = visibilityRef.current;
      const currentVisibility = document.visibilityState;
      visibilityRef.current = currentVisibility;
      
      console.log(`[MainContent] Visibility changed: ${prevVisibility} -> ${currentVisibility}`);
      
      // KEINE Aktionen beim Tab-Wechsel ausführen - dies verhindert zusätzliche Refreshes
    };
    
    // Visibility-Change-Event-Listener hinzufügen
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Eine kleine Verzögerung vor dem Laden von Features hinzufügen, um sicherzustellen, dass die Authentifizierung abgeschlossen ist
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
        {/* Debug-Refresh-Button - nur in der Entwicklung sichtbar und nicht auf der Job-Parsing-Seite */}
        {process.env.NODE_ENV === 'development' && !isJobParsingRoute && (
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
