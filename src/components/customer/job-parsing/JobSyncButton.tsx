
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
        throw new Error(error.message || 'Fehler bei der Synchronisierung');
      }

      console.log("Function response:", data);
      
      // Check if there's a mock response due to missing API key
      if (data.message && data.message.includes('Testdaten')) {
        toast({
          title: 'Demo-Modus',
          description: data.message,
          variant: 'default'
        });
        return;
      }
      
      // Check for API errors even when function technically succeeds
      if (data.status === 'error') {
        // Special handling for Apify API errors
        if (data.message && data.message.includes('Apify API error')) {
          toast({
            title: 'API Fehler',
            description: 'Der Apify-Dienst ist temporär nicht verfügbar. Bitte versuchen Sie es später erneut.',
            variant: 'destructive'
          });
          return;
        }
        throw new Error(data.message || 'Fehler bei der Synchronisierung');
      }

      const message = data.message || `${data.jobsProcessed || 0} Jobangebote wurden synchronisiert`;
      
      toast({
        title: 'Synchronisierung erfolgreich',
        description: message,
        variant: 'default'
      });
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
