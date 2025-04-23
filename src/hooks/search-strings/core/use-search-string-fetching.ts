
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SearchString } from '../search-string-types';

interface UseSearchStringFetchingProps {
  user: any;
  setSearchStrings: (strings: SearchString[]) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useSearchStringFetching = ({ 
  user, 
  setSearchStrings, 
  setIsLoading 
}: UseSearchStringFetchingProps) => {
  const { toast } = useToast();

  const fetchSearchStrings = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Clear any previous errors
      localStorage.removeItem('searchStrings_error');
      localStorage.removeItem('searchStrings_error_details');
      localStorage.removeItem('auth_policy_error');
      
      if (!user) {
        console.log('No authenticated user, skipping fetch');
        setSearchStrings([]);
        setIsLoading(false);
        return;
      }

      console.log('Fetching search strings for user:', user.id);
      
      // First try direct query with new policies
      try {
        console.log('Using direct query approach with updated RLS policies');
        const { data: directData, error: directError } = await supabase
          .from('search_strings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (directError) {
          console.error('Direct query failed despite new policies:', directError);
        } else if (directData && Array.isArray(directData)) {
          console.log(`Successfully fetched ${directData.length} search strings directly`);
          setSearchStrings(directData as SearchString[]);
          setIsLoading(false);
          return;
        }
      } catch (directQueryError: any) {
        console.error('Direct query approach failed:', directQueryError);
        // Continue to the next approach if this fails
      }
      
      // FALLBACK 1: Try edge function if direct query failed
      try {
        console.log('Trying edge function approach');
        
        // Try the edge function with POST method and proper body
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke(
          'get-user-search-strings',
          {
            body: { userId: user.id }
          }
        );
        
        if (edgeError) {
          console.error('Edge function approach failed:', edgeError);
          throw edgeError;
        }
        
        if (edgeData && Array.isArray(edgeData.searchStrings)) {
          console.log(`Successfully fetched ${edgeData.searchStrings.length} search strings via edge function`);
          setSearchStrings(edgeData.searchStrings as SearchString[]);
          setIsLoading(false);
          return;
        }
      } catch (edgeError: any) {
        console.error('Edge function approach failed completely:', edgeError);
        // Fall through to next approach
      }
      
      // FALLBACK 2: Set empty array but don't show error if we've exhausted all options
      console.log('All fetch approaches failed, returning empty array');
      setSearchStrings([]);
      
      // Store error for debugging
      localStorage.setItem('searchStrings_error', 'Verbindungsproblem: TypeError: Failed to fetch');
      
      // Only display error toast for serious issues
      toast({
        title: "Fehler beim Laden",
        description: "Bitte aktualisieren Sie die Seite oder melden Sie sich erneut an.",
        variant: "destructive",
      });
      
    } catch (error: any) {
      console.error('Unhandled error in fetchSearchStrings:', error);
      
      // Store error for debugging
      const errorMsg = error.message || 'Ein unerwarteter Fehler ist aufgetreten';
      localStorage.setItem('searchStrings_error', errorMsg);
      localStorage.setItem('searchStrings_error_details', JSON.stringify({
        message: error.message,
        code: error.code,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }));
      
      toast({
        title: "Fehler beim Laden der Search Strings",
        description: "Bitte aktualisieren Sie die Seite oder melden Sie sich erneut an.",
        variant: "destructive",
      });
      
      setSearchStrings([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast, user, setSearchStrings, setIsLoading]);

  return { fetchSearchStrings };
};
