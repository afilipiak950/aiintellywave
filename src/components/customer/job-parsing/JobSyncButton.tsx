
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, RefreshCw } from 'lucide-react';

const JobSyncButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleSync = async () => {
    try {
      setIsLoading(true);
      setDebugInfo(null);
      
      console.log("Starting job & HR data synchronization process...");
      
      // Add a confirmation toast to show the process is starting
      toast({
        title: 'Synchronisierung gestartet',
        description: 'Die Job- und HR-Daten werden jetzt synchronisiert. Dies kann einen Moment dauern.',
        variant: 'default'
      });
      
      // Verbesserte Fehlerbehandlung und bessere Struktur für den Funktionsaufruf
      const jobId = crypto.randomUUID();
      console.log(`Erzeuge Hintergrundjob mit ID: ${jobId}`);
      
      const response = await supabase.functions.invoke('scrape-and-enrich', {
        body: {
          jobId, // Generiere eine eindeutige Job-ID
          background: true, // Hintergrundverarbeitung aktivieren
          maxPages: 5, // Reduziere auf 5 Seiten für schnellere Verarbeitung
          maxDepth: 1, // Reduziere die Tiefe
          url: window.location.origin, // Aktuelle Seiten-URL als Referenz
          enrichWithApollo: true // Explizit Apollo.io-Integration aktivieren
        }
      });
      
      // Log the entire response for debugging
      console.log("Full function response:", response);
      
      // Store debug info for development
      setDebugInfo(response);
      
      if (response.error) {
        console.error("Function error:", response.error);
        
        // Detaillierte Fehlerbehandlung mit spezifischen Fehlermeldungen
        const errorMessage = response.error.message || 'Unbekannter Fehler';
        
        toast({
          title: 'Synchronisierungsfehler',
          description: `Fehler: ${errorMessage}. Bitte versuchen Sie es später erneut.`,
          variant: 'destructive'
        });
        return;
      }

      const data = response.data;
      console.log("Function data response:", data);
      
      // Prüfe auf spezifische API-Antwortfehler
      if (data?.success === false) {
        const errorMessage = data.error || 'Ein Fehler ist aufgetreten';
        console.error("Function returned error:", errorMessage);
        
        toast({
          title: 'Synchronisierungsfehler',
          description: errorMessage,
          variant: 'destructive'
        });
        return;
      }

      // Erfolgsfall - egal, ob direkt erfolgreich oder Hintergrundjob gestartet
      toast({
        title: 'Synchronisierung gestartet',
        description: 'Die HR-Kontakte werden im Hintergrund synchronisiert. Bitte warten Sie einen Moment und aktualisieren Sie dann die Jobangebote.',
        variant: 'default'
      });
      
      // Nach einer kurzen Verzögerung prüfen, ob HR-Kontakte in der Datenbank sind
      setTimeout(async () => {
        try {
          const { count, error: countError } = await supabase
            .from('hr_contacts')
            .select('*', { count: 'exact', head: true });
            
          if (countError) {
            console.error("Error checking HR contacts count:", countError);
          } else {
            console.log(`Total HR contacts in database: ${count}`);
            
            if (count && count > 0) {
              toast({
                title: 'HR-Kontakte verfügbar',
                description: `${count} HR-Kontakte wurden gefunden. Sie können jetzt auf "HR-Kontakte" klicken, um diese anzuzeigen.`,
                variant: 'default'
              });
            }
          }
        } catch (err) {
          console.error("Error checking HR contacts:", err);
        }
      }, 5000); // 5 Sekunden warten
      
    } catch (err: any) {
      console.error('Job sync error:', err);
      console.error('Error details:', err.message, err.stack);
      
      toast({
        title: 'Synchronisierungsfehler',
        description: err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Debug info for development (will not be visible to users)
  const debugDisplay = process.env.NODE_ENV === 'development' && debugInfo ? (
    <div className="mt-2 text-xs text-gray-500">
      <pre className="overflow-auto max-h-40">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  ) : null;

  return (
    <>
      <Button 
        onClick={handleSync} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Synchronisiere...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Jobs & HR-Daten synchronisieren
          </>
        )}
      </Button>
      {debugDisplay}
    </>
  );
};

export default JobSyncButton;
