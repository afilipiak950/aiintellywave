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
      
      toast({
        title: 'Synchronisierung gestartet',
        description: 'Die Job- und HR-Kontakte werden jetzt synchronisiert. Dies kann einen Moment dauern.',
        variant: 'default'
      });
      
      const jobId = crypto.randomUUID();
      console.log(`Erzeuge Hintergrundjob mit ID: ${jobId}`);
      
      const response = await supabase.functions.invoke('scrape-and-enrich', {
        body: {
          jobId,
          background: true,
          maxPages: 5,
          maxDepth: 1,
          url: window.location.origin,
          enrichWithApollo: true // Explizit Apollo.io-Integration aktivieren
        }
      });
      
      console.log("Full function response:", response);
      setDebugInfo(response);
      
      if (response.error) {
        console.error("Function error:", response.error);
        toast({
          title: 'Synchronisierungsfehler',
          description: `Fehler: ${response.error.message}. Bitte versuchen Sie es später erneut.`,
          variant: 'destructive'
        });
        return;
      }

      const data = response.data;
      console.log("Function data response:", data);
      
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

      toast({
        title: 'Synchronisierung erfolgreich',
        description: 'Die HR-Kontakte werden im Hintergrund synchronisiert. Aktualisieren Sie die Seite in einigen Sekunden.',
        variant: 'default'
      });
      
    } catch (err: any) {
      console.error('Job sync error:', err);
      toast({
        title: 'Synchronisierungsfehler',
        description: err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

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
