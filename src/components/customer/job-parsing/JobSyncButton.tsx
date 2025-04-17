
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
      
      // Make the function call with detailed response logging
      const response = await supabase.functions.invoke('scrape-and-enrich', {
        body: {
          debug: true, // Request extra debug information
          timestamp: new Date().toISOString()
        }
      });
      
      // Log the entire response for debugging
      console.log("Full function response:", response);
      
      // Store debug info for development
      setDebugInfo(response);
      
      if (response.error) {
        console.error("Function error:", response.error);
        console.error("Error details:", response.error.message, response.error.stack);
        
        toast({
          title: 'Synchronisierungsfehler',
          description: `Fehler: ${response.error.message || 'Unbekannter Fehler'}`,
          variant: 'destructive'
        });
        return;
      }

      const data = response.data;
      console.log("Function data response:", data);
      
      // Check for missing API key
      if (data?.status === 'error' && data.message && data.message.includes('API-Schlüssel')) {
        console.error("API key missing or invalid:", data.message);
        toast({
          title: 'API-Schlüssel fehlt',
          description: data.message,
          variant: 'destructive'
        });
        return;
      }
      
      // Check for API errors even when function technically succeeds
      if (data?.status === 'error') {
        // Handle Apollo authentication error specifically
        if (data.message && (data.message.includes('401') || data.errorDetails?.includes('Invalid access credentials'))) {
          console.error("Apollo API authentication error:", data.message, data.errorDetails);
          toast({
            title: 'Apollo API Authentifizierungsfehler',
            description: 'Der API-Schlüssel wurde nicht akzeptiert. Bitte stellen Sie sicher, dass Sie einen gültigen Apollo API-Schlüssel verwenden.',
            variant: 'destructive'
          });
          return;
        }
        
        // Special handling for rate limiting errors
        if (data.message && data.message.includes('429')) {
          console.error("Apollo API rate limit error:", data.message);
          toast({
            title: 'API Rate Limit überschritten',
            description: 'Die Apollo API hat zu viele Anfragen in kurzer Zeit erhalten. Bitte versuchen Sie es später erneut.',
            variant: 'destructive'
          });
          return;
        }
        
        // Special handling for other Apollo API errors
        if (data.message && data.message.includes('Apollo API Fehler')) {
          console.error("Apollo API error:", data.message, data.errorDetails);
          toast({
            title: 'API Fehler',
            description: data.message || 'Es gab ein Problem mit der Apollo API. Bitte versuchen Sie es später erneut.',
            variant: 'destructive'
          });
          return;
        }
        
        // Generic error handling
        console.error("General error from function:", data.message, data.errorDetails);
        toast({
          title: 'Synchronisierungsfehler',
          description: data.message || 'Es ist ein Fehler bei der Synchronisierung aufgetreten',
          variant: 'destructive'
        });
        return;
      }

      // Success case
      if (data?.status === 'success') {
        console.log("Synchronization successful:", data);
        // Success message with data count
        const message = `${data.jobsProcessed || 0} Jobangebote und ${data.contactsFound || 0} HR-Kontakte wurden synchronisiert`;
        
        toast({
          title: 'Synchronisierung erfolgreich',
          description: message,
          variant: 'default'
        });
      } else {
        console.log("Synchronization completed but no status in response");
        // Fallback success message if no status provided
        toast({
          title: 'Synchronisierung abgeschlossen',
          description: 'Die Synchronisierung wurde abgeschlossen, aber keine Details zurückgegeben',
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

  // Include debug info in DOM during development (will not be visible to users)
  const debugDisplay = process.env.NODE_ENV === 'development' && debugInfo ? (
    <div className="mt-2 text-xs text-gray-500 hidden">
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
