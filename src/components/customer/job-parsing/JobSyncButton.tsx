
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
      
      const { data, error } = await supabase.functions.invoke('scrape-and-enrich');

      if (error) {
        throw error;
      }

      toast({
        title: 'Synchronisierung erfolgreich',
        description: `${data?.jobsProcessed || 0} Jobangebote wurden synchronisiert`,
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
