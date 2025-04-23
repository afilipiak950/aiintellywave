
import { supabase } from '@/integrations/supabase/client';
import { SearchString } from '../search-string-types';
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseSearchStringFetchingProps {
  user: any;
  setSearchStrings: (searchStrings: SearchString[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useSearchStringFetching = ({ 
  user, 
  setSearchStrings, 
  setIsLoading,
  setError
}: UseSearchStringFetchingProps) => {
  const { toast } = useToast();

  const fetchSearchStrings = useCallback(async () => {
    if (!user) {
      console.warn('No authenticated user for fetching search strings');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Immer den Edge Function-Ansatz verwenden
      console.log('Using edge function to fetch search strings');
      
      const { data, error } = await supabase.functions.invoke('get-user-search-strings', {
        body: { userId: user.id }
      });
      
      if (error) {
        console.error('Edge function error:', error);
        setError(new Error(`Fehler beim Abrufen der Daten: ${error.message}`));
        setSearchStrings([]);
      } else if (data && data.searchStrings) {
        console.info(`Successfully fetched ${data.searchStrings.length} search strings`);
        setSearchStrings(data.searchStrings as SearchString[]);
      } else {
        // Wenn keine Daten zurückkommen, leeren Array setzen
        setSearchStrings([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch search strings:', error);
      toast({
        title: "Fehler",
        description: "Suchstrings konnten nicht geladen werden. Versuchen Sie es später erneut.",
        variant: "destructive"
      });
      setError(error);
      setSearchStrings([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, setIsLoading, setSearchStrings, setError, toast]);

  return { fetchSearchStrings };
};
