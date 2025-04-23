
import { supabase } from '@/integrations/supabase/client';
import { SearchString } from '../search-string-types';
import { useCallback } from 'react';

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
  const fetchSearchStrings = useCallback(async () => {
    if (!user) {
      console.warn('No authenticated user for fetching search strings');
      return;
    }

    setIsLoading(true);
    setError(null); // Reset error when starting a new fetch

    try {
      // Immer den Edge Function-Ansatz verwenden, der RLS umgeht
      console.info('Using edge function to bypass RLS issues');
      
      try {
        const { data, error } = await supabase.functions.invoke('get-user-search-strings', {
          body: { userId: user.id }
        });
        
        if (error) {
          console.error('Edge function error:', error);
          throw new Error(`Edge function error: ${error.message}`);
        }
        
        if (data && data.searchStrings) {
          console.info(`Successfully fetched ${data.searchStrings.length} search strings via edge function`);
          setSearchStrings(data.searchStrings as SearchString[]);
          setIsLoading(false);
          return;
        } else {
          // Wenn keine Daten zurückkommen, leeren Array setzen
          setSearchStrings([]);
          setIsLoading(false);
          return;
        }
      } catch (edgeFunctionError: any) {
        // Direkte Abfrage als Fallback versuchen
        console.warn('Edge function approach failed, trying direct query:', edgeFunctionError);
        
        const { data: stringData, error: directError } = await supabase
          .from('search_strings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (directError) {
          if (directError.message.includes('policy')) {
            // Bei RLS-Problemen leeren Array zurückgeben, um UI nicht zu blockieren
            console.warn('RLS policy error, returning empty array');
            setSearchStrings([]);
            setIsLoading(false);
            throw directError;
          }
          throw directError;
        }
        
        if (stringData) {
          console.info(`Successfully fetched ${stringData.length} search strings via direct query`);
          setSearchStrings(stringData);
        } else {
          setSearchStrings([]);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch search strings:', error);
      setError(error);
      // Leere Liste zurückgeben, damit UI nicht blockiert wird
      setSearchStrings([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, setIsLoading, setSearchStrings, setError]);

  return { fetchSearchStrings };
};
