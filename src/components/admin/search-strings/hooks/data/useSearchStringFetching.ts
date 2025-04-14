
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
  
  // Function to check database connection
  const checkDatabaseConnection = useCallback(async () => {
    try {
      const startTime = Date.now();
      console.log('Checking database connection...');
      
      const { data, error } = await supabase
        .from('search_strings')
        .select('id')
        .limit(1);
      
      const duration = Date.now() - startTime;
      
      if (error) {
        console.error(`Database connection check failed (${duration}ms):`, error);
        return false;
      }
      
      console.log(`Database connection successful (${duration}ms)`);
      return true;
    } catch (error) {
      console.error('Unexpected error checking database connection:', error);
      return false;
    }
  }, []);

  // Function to fetch all search strings
  const fetchAllSearchStrings = useCallback(
    async (
      setSearchStrings: (strings: SearchString[]) => void,
      setUserEmails: React.Dispatch<React.SetStateAction<Record<string, string>>>,
      setCompanyNames: React.Dispatch<React.SetStateAction<Record<string, string>>>,
      setIsLoading: (isLoading: boolean) => void,
      setIsRefreshing: (isRefreshing: boolean) => void,
      setError: (error: string | null) => void
    ) => {
      try {
        // Start loading
        setIsLoading(true);
        setIsRefreshing(true);
        setError(null);

        // Check database connection first
        const isConnected = await checkDatabaseConnection();
        if (!isConnected) {
          setConnectionErrorCount(prev => prev + 1);
          setError('Database connection error: Failed to establish connection to Supabase. Please try again later or check your network connection.');
          setSearchStrings([]);
          setIsLoading(false);
          setIsRefreshing(false);
          return;
        }

        console.log('Database connection confirmed, fetching search strings...');

        // First check if search_strings table exists by fetching just a schema
        const { data: tablesCheck, error: schemaError } = await supabase
          .from('search_strings')
          .select('id')
          .limit(1);

        if (schemaError) {
          if (schemaError.code === '42P01') { // Table doesn't exist error
            console.error('The search_strings table does not exist:', schemaError);
            setError(`The search_strings table does not exist in the database: ${schemaError.message}`);
            setSearchStrings([]);
            setIsLoading(false);
            setIsRefreshing(false);
            return;
          } else {
            console.error('Error accessing search_strings table:', schemaError);
            setError(`Error accessing search_strings table: ${schemaError.message}`);
            setSearchStrings([]);
            setIsLoading(false);
            setIsRefreshing(false);
            return;
          }
        }

        // Fetch search strings - make sure we get ALL strings regardless of user
        console.log('Fetching ALL search strings from database...');
        const { data: searchStrings, error: searchStringsError } = await supabase
          .from('search_strings')
          .select('*')
          .order('created_at', { ascending: false });

        if (searchStringsError) {
          console.error('Error fetching search strings:', searchStringsError);
          setError(`Failed to load search strings: ${searchStringsError.message}`);
          setIsLoading(false);
          setIsRefreshing(false);
          return;
        }

        if (!searchStrings) {
          console.log('No search strings returned from query (null result)');
          setSearchStrings([]);
          setIsLoading(false);
          setIsRefreshing(false);
          return;
        }

        console.log(`Admin: Fetched ${searchStrings.length} search strings total`);
        
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
          const userIds = [...new Set(searchStrings.map(item => item.user_id))].filter(Boolean);
          const companyIds = [...new Set(searchStrings.map(item => item.company_id))].filter(Boolean);

          console.log(`Found ${userIds.length} unique users and ${companyIds.length} unique companies`);

          // Fetch user info for all user IDs
          if (userIds.length > 0) {
            console.log('Fetching user emails for search strings...');
            const { data: users, error: usersError } = await supabase
              .from('company_users')
              .select('user_id, email')
              .in('user_id', userIds);

            if (usersError) {
              console.error('Error fetching users:', usersError);
              // Don't return, just log the error and continue
            } else if (users && users.length > 0) {
              // Create a mapping of user IDs to emails
              const userEmailsMap: Record<string, string> = {};
              
              users.forEach(user => {
                if (user && user.user_id && user.email) {
                  // Safely access email with optional chaining
                  const email = user.email || '';
                  userEmailsMap[user.user_id] = email;
                  // Also add the lowercase version for case-insensitive matching
                  userEmailsMap[user.user_id.toLowerCase()] = email;
                }
              });
              
              console.log(`Mapped ${Object.keys(userEmailsMap).length / 2} users to their emails`);
              setUserEmails(userEmailsMap);
            }
          }

          // Fetch company info for all company IDs
          if (companyIds.length > 0) {
            console.log('Fetching company names for search strings...');
            const { data: companies, error: companiesError } = await supabase
              .from('companies')
              .select('id, name')
              .in('id', companyIds);

            if (companiesError) {
              console.error('Error fetching companies:', companiesError);
              // Don't return, just log the error and continue
            } else if (companies && companies.length > 0) {
              // Create a mapping of company IDs to names
              const companyNamesMap: Record<string, string> = {};
              
              companies.forEach(company => {
                if (company && company.id && company.name) {
                  companyNamesMap[company.id] = company.name;
                }
              });
              
              console.log(`Mapped ${Object.keys(companyNamesMap).length} companies to their names`);
              setCompanyNames(companyNamesMap);
            }
          }
        }

        // Update last fetched time
        setLastFetched(new Date());
      } catch (error: any) {
        console.error('Error in fetchAllSearchStrings:', error);
        setError(`Unexpected error loading search strings: ${error.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [checkDatabaseConnection, connectionErrorCount, toast]
  );

  return {
    fetchAllSearchStrings,
    lastFetched,
    connectionErrorCount
  };
};
