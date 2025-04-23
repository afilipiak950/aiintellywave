
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
      
      // APPROACH 1: Try edge function first - most reliable approach
      try {
        console.log('Trying edge function approach');
        
        // First try the GET version with URL parameters
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke(
          'get-user-search-strings',
          {
            method: 'GET',
            headers: { userId: user.id }
          }
        );
        
        if (edgeError) {
          console.error('Edge function GET approach failed:', edgeError);
          throw edgeError;
        }
        
        if (edgeData && Array.isArray(edgeData.searchStrings)) {
          console.log(`Successfully fetched ${edgeData.searchStrings.length} search strings via edge function (GET)`);
          setSearchStrings(edgeData.searchStrings as SearchString[]);
          setIsLoading(false);
          return;
        }
        
        // If GET failed, try POST
        const { data: postData, error: postError } = await supabase.functions.invoke(
          'get-user-search-strings',
          {
            body: { userId: user.id }
          }
        );
        
        if (postError) {
          console.error('Edge function POST approach failed:', postError);
          throw postError;
        }
        
        if (postData && Array.isArray(postData.searchStrings)) {
          console.log(`Successfully fetched ${postData.searchStrings.length} search strings via edge function (POST)`);
          setSearchStrings(postData.searchStrings as SearchString[]);
          setIsLoading(false);
          return;
        }
      } catch (edgeError: any) {
        console.error('Edge function approach failed completely, will try direct query:', edgeError);
      }
      
      // APPROACH 2: Try direct query without relying on any user_roles checks
      try {
        console.log('Using direct query approach without joins');
        const { data: directData, error: directError } = await supabase
          .from('search_strings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (directError) {
          console.error('Direct query failed:', directError);
          
          // Check for specific RLS error
          if (directError.message?.includes('infinite recursion') || directError.code === '42P17') {
            localStorage.setItem('auth_policy_error', 'true');
          }
          
          throw directError;
        }
        
        console.log(`Successfully fetched ${directData.length} search strings directly`);
        setSearchStrings(directData as SearchString[]);
        setIsLoading(false);
        return;
      } catch (directQueryError: any) {
        console.error('Direct query approach failed:', directQueryError);
        // Continue to the next approach if this fails
      }
      
      // APPROACH 3: RPC Call - removed as it's causing a type error
      // We'll rely on the edge function and direct queries instead
      
      // FALLBACK: Set empty array and show error
      setSearchStrings([]);
      const errorMsg = 'Datenbankrichtlinienfehler: Bitte melden Sie sich ab und wieder an, um dieses Problem zu beheben.';
      localStorage.setItem('searchStrings_error', errorMsg);
      localStorage.setItem('auth_policy_error', 'true');
      
      toast({
        title: "Datenbankrichtlinienfehler",
        description: "Bitte melden Sie sich ab und wieder an, um dieses Problem zu beheben.",
        variant: "destructive",
      });
      
    } catch (error: any) {
      console.error('Unhandled error in fetchSearchStrings:', error);
      
      // Store detailed error for debugging
      const errorMsg = error.message?.includes('infinite recursion') 
        ? 'Datenbankrichtlinienfehler: Bitte melden Sie sich ab und wieder an, um dieses Problem zu beheben.'
        : error.message || 'Ein unerwarteter Fehler ist aufgetreten';
        
      localStorage.setItem('searchStrings_error', errorMsg);
      localStorage.setItem('searchStrings_error_details', JSON.stringify({
        message: error.message,
        code: error.code,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }));
      
      // Set auth policy error flag if it's a recursion error
      if (error.message?.includes('infinite recursion') || error.code === '42P17' || error.code === 'PGRST116') {
        localStorage.setItem('auth_policy_error', 'true');
      }
      
      toast({
        title: error.message?.includes('infinite recursion')
          ? "Datenbankrichtlinienfehler"
          : "Fehler beim Laden der Search Strings",
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
