
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
