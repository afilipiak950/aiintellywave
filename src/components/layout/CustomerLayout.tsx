
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

  // Funktion, die nur dann ausgeführt wird, wenn das Dokument wirklich sichtbar ist
  const checkAssociationIfVisible = () => {
    if (document.visibilityState === 'visible' && !initialCheckDoneRef.current) {
      console.log('[CustomerLayout] Initial company association check');
      checkCompanyAssociation();
      initialCheckDoneRef.current = true;
    }
  };

  // Ausführen nur einmal beim Mounten
  useEffect(() => {
    // Initiale Prüfung nur durchführen, wenn das Dokument sichtbar ist
    checkAssociationIfVisible();
    
    // Visibility change handler, um unerwünschte Aktualisierungen zu vermeiden
    const handleVisibilityChange = () => {
      const currentVisibility = document.visibilityState;
      console.log(`[CustomerLayout] Visibility changed: ${documentVisibilityRef.current} -> ${currentVisibility}`);
      
      // Aktualisieren des Referenzwerts für die spätere Verwendung
      documentVisibilityRef.current = currentVisibility;
      
      // KEINE Aktionen beim Tab-Wechsel ausführen - dies verhindert den Refresh
    };
    
    // Event-Listener für Visibility-Change hinzufügen
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Nur ein Intervall einrichten, wenn wir nicht in der job-parsing-Route sind
    if (!location.pathname.includes('/job-parsing')) {
      refreshIntervalRef.current = setInterval(() => {
        // Nur aktualisieren, wenn das Dokument tatsächlich sichtbar ist
        if (document.visibilityState === 'visible') {
          console.log("[CustomerLayout] Checking for updates to layout");
          setForceRefresh(prev => prev + 1);
        }
      }, 300000); // 5 Minuten
    }
    
    // Intervall beim Unmounten aufräumen
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkCompanyAssociation, location.pathname]);

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
