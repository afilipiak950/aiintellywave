
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SearchString } from '@/hooks/search-strings/search-string-types';
import { useToast } from '@/hooks/use-toast';

type FetchAllSearchStringsParams = {
  setSearchStrings: (strings: SearchString[]) => void;
  setUserEmails: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setCompanyNames: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setIsLoading: (isLoading: boolean) => void;
  setIsRefreshing: (isRefreshing: boolean) => void;
  setError: (error: string | null) => void;
};

export const useSearchStringFetching = () => {
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [connectionErrorCount, setConnectionErrorCount] = useState(0);
  const { toast } = useToast();
  
  // Function to check database connection with better logging
  const checkDatabaseConnection = useCallback(async () => {
    try {
      const startTime = Date.now();
      console.log('Checking database connection...');
      
      // Use edge function instead of direct database access to bypass RLS issues
      const { data, error } = await supabase.functions.invoke('get-all-search-strings', {
        method: 'GET'
      });
      
      const duration = Date.now() - startTime;
      
      if (error) {
        console.error(`Edge function call failed (${duration}ms):`, error);
        return false;
      }
      
      console.log(`Edge function call successful (${duration}ms)`);
      return true;
    } catch (error) {
      console.error('Unexpected error checking connection:', error);
      return false;
    }
  }, []);

  // Fetch ALL search strings using edge function to bypass RLS issues
  const fetchAllSearchStrings = useCallback(
    async ({
      setSearchStrings,
      setUserEmails,
      setCompanyNames,
      setIsLoading,
      setIsRefreshing,
      setError
    }: FetchAllSearchStringsParams) => {
      try {
        // Start loading
        setIsLoading(true);
        setIsRefreshing(true);
        setError(null);

        // Check database connection first with better error handling
        const isConnected = await checkDatabaseConnection();
        if (!isConnected) {
          setConnectionErrorCount(prev => prev + 1);
          setError('Database connection error: Failed to retrieve search strings. Please try again later or check your network connection.');
          setSearchStrings([]);
          setIsLoading(false);
          setIsRefreshing(false);
          return;
        }

        console.log('Connection confirmed, fetching search strings via edge function...');

        // Use edge function to bypass RLS issues
        const { data: functionData, error: functionError } = await supabase.functions.invoke('get-all-search-strings', {
          method: 'GET'
        });

        if (functionError) {
          console.error('Error in edge function call:', functionError);
          setError(`Failed to load search strings: ${functionError.message}`);
          setIsLoading(false);
          setIsRefreshing(false);
          return;
        }

        const searchStrings = functionData?.data || [];

        console.log(`Successfully fetched ${searchStrings.length} search strings via edge function`);
        
        // Reset connection error count on successful fetch
        if (connectionErrorCount > 0) {
          setConnectionErrorCount(0);
          toast({
            title: "Connection Restored",
            description: "Database connection has been restored successfully."
          });
        }
        
        // Set search strings
        setSearchStrings(searchStrings);

        // If we have search strings, collect all unique user IDs and company IDs
        if (searchStrings.length > 0) {
          // Extract user IDs
          const userIds = [...new Set(searchStrings
            .filter(item => item.user_id)
            .map(item => item.user_id))];
            
          // Extract company IDs
          const companyIds = [...new Set(searchStrings
            .filter(item => item.company_id)
            .map(item => item.company_id))];

          console.log(`Found ${userIds.length} unique users and ${companyIds.length} unique companies`);

          // Fetch user emails via edge function instead of direct query
          if (userIds.length > 0) {
            const { data: usersData } = await supabase.functions.invoke('get-user-emails', {
              body: { userIds }
            }).catch(err => {
              console.error('Error fetching user emails:', err);
              return { data: null };
            });
            
            if (usersData) {
              setUserEmails(usersData);
            }
          }

          // Fetch company names via edge function instead of direct query
          if (companyIds.length > 0) {
            const { data: companiesData } = await supabase.functions.invoke('get-company-names', {
              body: { companyIds }
            }).catch(err => {
              console.error('Error fetching company names:', err);
              return { data: null };
            });
            
            if (companiesData) {
              setCompanyNames(companiesData);
            }
          }
        }

        // Update last fetched time
        setLastFetched(new Date());
      } catch (error: any) {
        console.error('Unexpected error in fetchAllSearchStrings:', error);
        setError(`Unexpected error loading search strings: ${error.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [checkDatabaseConnection, connectionErrorCount, toast]
  );

  return {
    fetchAllSearchStrings: async (
      setSearchStrings: (strings: SearchString[]) => void,
      setUserEmails: React.Dispatch<React.SetStateAction<Record<string, string>>>,
      setCompanyNames: React.Dispatch<React.SetStateAction<Record<string, string>>>,
      setIsLoading: (isLoading: boolean) => void,
      setIsRefreshing: (isRefreshing: boolean) => void,
      setError: (error: string | null) => void
    ) => {
      await fetchAllSearchStrings({
        setSearchStrings,
        setUserEmails,
        setCompanyNames,
        setIsLoading,
        setIsRefreshing,
        setError
      });
    },
    lastFetched,
    connectionErrorCount
  };
};
