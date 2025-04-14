
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SearchString } from '@/hooks/search-strings/search-string-types';

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

        // Fetch search strings
        const { data: searchStrings, error: searchStringsError } = await supabase
          .from('search_strings')
          .select('*')
          .order('created_at', { ascending: false });

        if (searchStringsError) {
          console.error('Error fetching search strings:', searchStringsError);
          setError(`Failed to load search strings: ${searchStringsError.message}`);
          return;
        }

        // Set search strings
        setSearchStrings(searchStrings || []);

        // If we have search strings, collect all unique user IDs and company IDs
        if (searchStrings && searchStrings.length > 0) {
          const userIds = [...new Set(searchStrings.map(item => item.user_id))].filter(Boolean);
          const companyIds = [...new Set(searchStrings.map(item => item.company_id))].filter(Boolean);

          // Fetch user info for all user IDs
          if (userIds.length > 0) {
            const { data: users, error: usersError } = await supabase
              .from('company_users')
              .select('user_id, email')
              .in('user_id', userIds);

            if (usersError) {
              console.error('Error fetching users:', usersError);
              // Don't return, just log the error and continue
            } else if (users) {
              // Create a mapping of user IDs to emails
              const userEmailsMap: Record<string, string> = {};
              
              users.forEach(user => {
                if (user && user.user_id && user.email) {
                  userEmailsMap[user.user_id] = user.email;
                  // Also add the lowercase version for case-insensitive matching
                  userEmailsMap[user.user_id.toLowerCase()] = user.email;
                }
              });
              
              setUserEmails(userEmailsMap);
            }
          }

          // Fetch company info for all company IDs
          if (companyIds.length > 0) {
            const { data: companies, error: companiesError } = await supabase
              .from('companies')
              .select('id, name')
              .in('id', companyIds);

            if (companiesError) {
              console.error('Error fetching companies:', companiesError);
              // Don't return, just log the error and continue
            } else if (companies) {
              // Create a mapping of company IDs to names
              const companyNamesMap: Record<string, string> = {};
              
              companies.forEach(company => {
                if (company && company.id && company.name) {
                  companyNamesMap[company.id] = company.name;
                }
              });
              
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
    []
  );

  return {
    fetchAllSearchStrings,
    lastFetched
  };
};
