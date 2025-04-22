
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

      console.log('Fetching search strings for user:', user.id);
      
      // Step 1: Try the simplest possible approach first - direct query with no joins
      try {
        console.log('Using direct query approach (no joins)');
        const { data: directData, error: directError } = await supabase
          .from('search_strings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (directError) {
          console.error('Direct query failed:', directError);
          throw directError;
        }
        
        console.log(`Successfully fetched ${directData.length} search strings`);
        localStorage.removeItem('searchStrings_error');
        setSearchStrings(directData as SearchString[]);
        setIsLoading(false);
        return;
      } catch (directQueryError: any) {
        console.error('Direct query approach failed:', directQueryError);
        
        // Check if it's the infinite recursion error
        if (directQueryError.message?.includes('infinite recursion')) {
          const errorMsg = 'infinite recursion detected in policy for relation "user_roles"';
          localStorage.setItem('searchStrings_error', errorMsg);
          
          toast({
            title: "Datenbankrichtlinienfehler",
            description: "Bitte melden Sie sich ab und wieder an, um dieses Problem zu beheben",
            variant: "destructive",
          });
          
          setSearchStrings([]);
          setIsLoading(false);
          return;
        }
      }
      
      // Step 2: Try a different approach - Use a custom function call
      try {
        console.log('Trying alternative approach with custom function');
        // Using the .rpc() method with a type assertion to avoid TypeScript errors
        const { data: altData, error: altError } = await supabase
          .rpc('get_my_search_strings' as any);
          
        if (altError) {
          console.error('Alternative approach failed:', altError);
          throw altError;
        }
        
        if (altData && Array.isArray(altData)) {
          console.log(`Successfully fetched ${altData.length} search strings via RPC`);
          localStorage.removeItem('searchStrings_error');
          // Use type assertion to handle the type mismatch
          setSearchStrings(altData as unknown as SearchString[]);
          setIsLoading(false);
          return;
        }
      } catch (altError: any) {
        console.error('Alternative approach also failed:', altError);
        // Continue to the fallback
      }
      
      // Step 3: Final fallback - Use the edge function if available
      try {
        console.log('Trying edge function fallback');
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-user-search-strings', {
          body: { userId: user.id }
        });
        
        if (edgeError) {
          console.error('Edge function fallback failed:', edgeError);
          throw edgeError;
        }
        
        if (edgeData && Array.isArray(edgeData.searchStrings)) {
          console.log(`Successfully fetched ${edgeData.searchStrings.length} search strings via edge function`);
          localStorage.removeItem('searchStrings_error');
          setSearchStrings(edgeData.searchStrings as SearchString[]);
          setIsLoading(false);
          return;
        }
      } catch (edgeError: any) {
        console.error('Edge function fallback also failed:', edgeError);
        
        // Set a more specific error message to guide the user
        const errorMsg = edgeError.message || 'Ein unerwarteter Fehler ist aufgetreten';
        localStorage.setItem('searchStrings_error', errorMsg);
        
        toast({
          title: "Datenbankzugriffsfehler",
          description: "Es gibt ein Problem mit Ihrer Benutzerberechtigung. Bitte melden Sie sich ab und wieder an.",
          variant: "destructive",
        });
        
        setSearchStrings([]);
      }
    } catch (error: any) {
      console.error('Unhandled error in fetchSearchStrings:', error);
      
      // Store detailed error for debugging
      localStorage.setItem('searchStrings_error', error.message || 'Ein unerwarteter Fehler ist aufgetreten');
      localStorage.setItem('searchStrings_error_details', JSON.stringify({
        message: error.message,
        code: error.code,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }));
      
      toast({
        title: "Fehler beim Laden der Search Strings",
        description: "Bitte melden Sie sich ab und wieder an, um dieses Problem zu beheben.",
        variant: "destructive",
      });
      
      setSearchStrings([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast, user, setSearchStrings, setIsLoading]);

  return { fetchSearchStrings };
};
