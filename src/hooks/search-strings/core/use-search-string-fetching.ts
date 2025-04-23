import { supabase } from '@/integrations/supabase/client';
import { SearchString } from '../search-string-types';
import { useCallback } from 'react';

interface UseSearchStringFetchingProps {
  user: any;
  setSearchStrings: (searchStrings: SearchString[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void; // Add setError as a prop
}

export const useSearchStringFetching = ({ 
  user, 
  setSearchStrings, 
  setIsLoading,
  setError // Add setError parameter
}: UseSearchStringFetchingProps) => {
  const fetchSearchStrings = useCallback(async () => {
    if (!user) {
      console.warn('No authenticated user for fetching search strings');
      return;
    }

    setIsLoading(true);
    setError(null); // Reset error when starting a new fetch

    try {
      console.info(`Fetching search strings for user: ${user.id}`);
      
      // Try direct query approach first
      console.info('Using direct query approach with updated RLS policies');
      
      let { data: stringData, error: fetchError } = await supabase
        .from('search_strings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        console.error('Direct query failed despite new policies:', fetchError);
        
        // Mark failed direct RLS access in local storage for future debugging
        if (fetchError.message.includes('infinite recursion') || 
            fetchError.message.includes('recursive')) {
          localStorage.setItem('auth_policy_error', 'true');
          localStorage.setItem('searchStrings_error', fetchError.message);
          localStorage.setItem('searchStrings_error_details', JSON.stringify(fetchError));
        }
        
        // Try edge function approach
        console.info('Trying edge function approach');
        try {
          const { data, error } = await supabase.functions.invoke('get-user-search-strings', {
            body: { userId: user.id }
          });
          
          if (error) {
            throw new Error(`Edge function error: ${error.message}`);
          }
          
          if (data && data.searchStrings) {
            console.info(`Successfully fetched ${data.searchStrings.length} search strings via edge function`);
            setSearchStrings(data.searchStrings as SearchString[]);
            setIsLoading(false);
            return;
          }
          
          throw new Error('No search strings returned from edge function');
        } catch (edgeFunctionError: any) {
          console.error('Edge function approach failed:', edgeFunctionError);
          setIsLoading(false);
          setError(new Error(edgeFunctionError.message || 'Failed to fetch search strings')); // Set error using the prop
          return;
        }
      }
      
      if (stringData) {
        console.info(`Successfully fetched ${stringData.length} search strings`);
        setSearchStrings(stringData as SearchString[]);
      }
    } catch (error: any) {
      console.error('Failed to fetch search strings:', error);
      setError(error); // Set error using the prop
    } finally {
      setIsLoading(false);
    }
  }, [user, setIsLoading, setSearchStrings, setError]);

  return { fetchSearchStrings };
};
