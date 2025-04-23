
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
      
      if (!user) {
        console.log('No authenticated user, skipping fetch');
        setSearchStrings([]);
        setIsLoading(false);
        return;
      }

      console.log('Fetching search strings for user:', user.id);
      
      // Check if auth policy error was detected during login
      const hasPolicyError = localStorage.getItem('auth_policy_error');
      
      if (hasPolicyError) {
        console.log('Using edge function approach due to detected policy error');
        try {
          // Use edge function to bypass RLS completely
          const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-user-search-strings', {
            body: { userId: user.id }
          });
          
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
          console.error('Edge function approach failed, will try direct query:', edgeError);
        }
      }
      
      // FALLBACK 1: Try direct query without relying on any user_roles checks
      try {
        console.log('Using direct query approach without joins');
        const { data: directData, error: directError } = await supabase
          .from('search_strings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (directError) {
          console.error('Direct query failed:', directError);
          
          // Check if it's the infinite recursion error specifically
          if (directError.message?.includes('infinite recursion')) {
            throw {
              message: 'Datenbankrichtlinienfehler: Infinite recursion detected in policy for relation "user_roles"',
              code: 'PGRST116',
              details: directError.details
            };
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
      
      // FALLBACK 2: Try using an RPC call with an explicit auth.uid() in the function
      try {
        console.log('Trying RPC approach with custom function');
        // Use 'as any' to bypass TypeScript checking for custom RPC function
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_user_search_strings' as any, { user_id_param: user.id });
          
        if (rpcError) {
          console.error('RPC approach failed:', rpcError);
          
          // Check if it's the infinite recursion error
          if (rpcError.message?.includes('infinite recursion')) {
            throw {
              message: 'Datenbankrichtlinienfehler: Infinite recursion detected in policy for relation "user_roles"',
              code: 'PGRST116',
              details: rpcError.details
            };
          }
          
          throw rpcError;
        }
        
        if (rpcData && Array.isArray(rpcData)) {
          console.log(`Successfully fetched ${rpcData.length} search strings via RPC`);
          // Use type assertion to handle the type mismatch
          setSearchStrings(rpcData as unknown as SearchString[]);
          setIsLoading(false);
          return;
        }
      } catch (rpcError: any) {
        console.error('RPC approach also failed:', rpcError);
        // Continue to the edge function fallback
      }
      
      // FALLBACK 3: Try using an edge function that bypasses RLS entirely
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
          setSearchStrings(edgeData.searchStrings as SearchString[]);
          setIsLoading(false);
          return;
        }
      } catch (edgeError: any) {
        console.error('Edge function fallback also failed:', edgeError);
        
        // At this point, all approaches have failed
        const errorMsg = 'Datenbankrichtlinienfehler: Bitte melden Sie sich ab und wieder an, um dieses Problem zu beheben.';
        localStorage.setItem('searchStrings_error', errorMsg);
        localStorage.setItem('auth_policy_error', 'true');
        
        toast({
          title: "Datenbankrichtlinienfehler",
          description: "Bitte melden Sie sich ab und wieder an, um dieses Problem zu beheben.",
          variant: "destructive",
        });
        
        setSearchStrings([]);
      }
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
      if (error.message?.includes('infinite recursion') || error.code === 'PGRST116') {
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
