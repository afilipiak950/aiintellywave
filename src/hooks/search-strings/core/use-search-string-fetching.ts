
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
      
      if (!user) {
        console.log('No authenticated user, skipping fetch');
        setSearchStrings([]);
        setIsLoading(false);
        return;
      }
      
      // Try to use a simpler query approach to avoid recursive policy issues
      try {
        console.log('Attempting to fetch search strings with direct query');
        
        // Use a direct query that doesn't join with user_roles to avoid recursion
        const { data, error } = await supabase
          .from('search_strings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          // If direct query fails, throw to catch block
          throw error;
        }
        
        console.log('Successfully fetched search strings:', data.length);
        // Clear any previous errors
        localStorage.removeItem('searchStrings_error');
        // Cast the data to SearchString type
        setSearchStrings(data as unknown as SearchString[]);
        setIsLoading(false);
        return;
      } catch (directQueryError: any) {
        console.error('Direct query failed, trying fallback approach:', directQueryError);
        
        // If the direct query fails with a recursion error, try an edge function approach
        if (directQueryError.message?.includes('infinite recursion')) {
          console.log('Detected infinite recursion error, storing error');
          localStorage.setItem('searchStrings_error', 'infinite recursion detected in policy for relation "user_roles"');
          
          toast({
            title: 'Datenbankrichtlinienfehler',
            description: 'Bitte melden Sie sich ab und wieder an, um dieses Problem zu beheben',
            variant: 'destructive',
          });
          
          setSearchStrings([]);
          setIsLoading(false);
          return;
        }
      }
      
      // If we get here, try the original approach as a last resort
      let query = supabase
        .from('search_strings')
        .select('*')
        .order('created_at', { ascending: false });
      
      query = query.eq('user_id', user.id);
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching search strings:', error);
        setSearchStrings([]);
        
        // Store the error in localStorage for components to access it
        if (error.message.includes('infinite recursion')) {
          localStorage.setItem('searchStrings_error', 'infinite recursion detected in policy for relation "user_roles"');
        } else {
          localStorage.setItem('searchStrings_error', error.message || 'Ein unerwarteter Fehler ist aufgetreten');
        }
        
        toast({
          title: 'Fehler beim Laden der Search Strings',
          description: error.message || 'Bitte versuchen Sie es später erneut',
          variant: 'destructive',
        });
      } else {
        console.log('Fetched search strings:', data.length);
        // Clear any previous errors
        localStorage.removeItem('searchStrings_error');
        // Cast the data to SearchString type
        setSearchStrings(data as unknown as SearchString[]);
      }
    } catch (error: any) {
      console.error('Error in fetchSearchStrings:', error);
      setSearchStrings([]);
      
      // Store the error message
      localStorage.setItem('searchStrings_error', error.message || 'Ein unerwarteter Fehler ist aufgetreten');
      
      toast({
        title: 'Fehler beim Laden der Search Strings',
        description: error.message || 'Ein unerwarteter Fehler ist aufgetreten',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, user, setSearchStrings, setIsLoading]);

  return { fetchSearchStrings };
};
