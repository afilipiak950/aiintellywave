
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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
      const response = await supabase.functions.invoke('scrape-and-enrich', {
        body: {
          jobId: crypto.randomUUID(), // Generiere eine eindeutige Job-ID
          background: true, // Hintergrundverarbeitung aktivieren
          maxPages: 20,
          maxDepth: 2,
          url: window.location.origin, // Aktuelle Seiten-URL als Referenz
          documents: [] // Leeres Array für Dokumente
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

      // Erfolgsfall
      if (data?.success === true) {
        console.log("Synchronization successful:", data);
        
        // Erfolgsmeldung
        toast({
          title: 'Synchronisierung erfolgreich',
          description: data.message || 'Die Synchronisierung wurde erfolgreich gestartet',
          variant: 'default'
        });
      } else {
        console.log("Synchronization response unclear:", data);
        
        // Fallback-Erfolgsmeldung
        toast({
          title: 'Synchronisierungsanfrage gesendet',
          description: 'Die Anfrage wurde gesendet, aber der Status ist unklar',
          variant: 'default'
        });
      }
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
          'Jobs & HR-Daten synchronisieren'
        )}
      </Button>
      {debugDisplay}
    </>
  );
};

export default JobSyncButton;
