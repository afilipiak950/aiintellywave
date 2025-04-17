
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const JobSyncButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    try {
      setIsLoading(true);
      
      console.log("Calling scrape-and-enrich function...");
      const { data, error } = await supabase.functions.invoke('scrape-and-enrich');

      if (error) {
        console.error("Function error:", error);
        toast({
          title: 'Synchronisierungsfehler',
          description: error.message || 'Es ist ein Fehler bei der Synchronisierung aufgetreten',
          variant: 'destructive'
        });
        return;
      }

      console.log("Function response:", data);
      
      // Check if there's a mock response due to missing API key
      if (data.status === 'error' && data.message && data.message.includes('API-Schlüssel')) {
        toast({
          title: 'API-Schlüssel fehlt',
          description: data.message,
          variant: 'destructive'
        });
        return;
      }
      
      // Check for API errors even when function technically succeeds
      if (data.status === 'error') {
        // Handle Apollo authentication error specifically
        if (data.message && (data.message.includes('401') || data.errorDetails?.includes('Invalid access credentials'))) {
          toast({
            title: 'Apollo API Authentifizierungsfehler',
            description: 'Der API-Schlüssel wurde nicht akzeptiert. Bitte stellen Sie sicher, dass Sie einen gültigen Apollo API-Schlüssel verwenden.',
            variant: 'destructive'
          });
          return;
        }
        
        // Special handling for other Apollo API errors
        if (data.message && data.message.includes('Apollo API Fehler')) {
          toast({
            title: 'API Fehler',
            description: data.message || 'Es gab ein Problem mit der Apollo API. Bitte versuchen Sie es später erneut.',
            variant: 'destructive'
          });
          return;
        }
        
        toast({
          title: 'Synchronisierungsfehler',
          description: data.message || 'Es ist ein Fehler bei der Synchronisierung aufgetreten',
          variant: 'destructive'
        });
        return;
      }

      if (data.status === 'success') {
        // Success message with data count
        const message = `${data.jobsProcessed || 0} Jobangebote und ${data.contactsFound || 0} HR-Kontakte wurden synchronisiert`;
        
        toast({
          title: 'Synchronisierung erfolgreich',
          description: message,
          variant: 'default'
        });
      } else {
        // Fallback success message if no status provided
        toast({
          title: 'Synchronisierung abgeschlossen',
          description: 'Die Synchronisierung wurde abgeschlossen',
          variant: 'default'
        });
      }
    } catch (err) {
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

  return (
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
  );
};

export default JobSyncButton;
