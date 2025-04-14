
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SearchString } from '@/hooks/search-strings/search-string-types';

export const useSearchStringFetching = () => {
  const { toast } = useToast();

  // Function to fetch all search strings
  const fetchAllSearchStrings = async (
    setSearchStrings: (strings: SearchString[]) => void,
    setUserEmails: (emails: Record<string, string>) => void,
    setCompanyNames: (names: Record<string, string>) => void,
    setIsLoading: (isLoading: boolean) => void,
    setIsRefreshing: (isRefreshing: boolean) => void,
    setError: (error: string | null) => void
  ) => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      // BUGFIX: Remove any filters that may be preventing records from being returned
      console.log('Admin: Fetching all search strings with no filtering');
      const { data, error } = await supabase
        .from('search_strings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching all search strings:', error);
        setError(`Failed to load search strings: ${error.message}`);
        toast({
          title: 'Failed to load search strings',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      console.log('Admin: Fetched search strings:', data?.length, data);
      
      if (!data || data.length === 0) {
        // Try a direct query to see if there are any search strings at all
        const { count, error: countError } = await supabase
          .from('search_strings')
          .select('*', { count: 'exact', head: true });
          
        if (countError) {
          console.error('Error checking search string count:', countError);
        } else {
          console.log(`Admin: Total search string count in database: ${count}`);
          if (count === 0) {
            setError('There are no search strings in the database.');
          } else {
            setError(`There are ${count} search strings in the database, but none were returned by the query. This may indicate an RLS policy issue.`);
          }
        }
      }
      
      setSearchStrings(data || []);
      
      // Get all unique user IDs
      const userIds = [...new Set(data?.map(item => item.user_id) || [])];
      console.log('Admin: Found user IDs:', userIds);
      
      // Fetch user emails for those IDs (from company_users)
      if (userIds.length > 0) {
        console.log('Admin: Fetching user emails for IDs:', userIds);
        // First try from company_users
        const { data: userData, error: userError } = await supabase
          .from('company_users')
          .select('user_id, email')
          .in('user_id', userIds);
          
        if (!userError && userData) {
          const userEmailMap: Record<string, string> = {};
          userData.forEach(user => {
            if (user.user_id && user.email) {
              userEmailMap[user.user_id] = user.email;
              
              // Also add lowercase version for case-insensitive matching
              userEmailMap[user.user_id.toLowerCase()] = user.email;
            }
          });
          setUserEmails(userEmailMap);
          console.log('Admin: Fetched user emails from company_users:', Object.keys(userEmailMap).length);
          
          // Check if we got all the emails
          const missingUserIds = userIds.filter(id => !userEmailMap[id]);
          if (missingUserIds.length > 0) {
            console.log('Admin: Missing emails for user IDs:', missingUserIds);
            
            // Try case-insensitive checks
            const caseInsensitiveMissingIds = missingUserIds.filter(id => 
              !Object.keys(userEmailMap).some(key => key.toLowerCase() === id.toLowerCase())
            );
            
            if (caseInsensitiveMissingIds.length > 0) {
              console.log('Admin: Missing emails after case-insensitive check:', caseInsensitiveMissingIds);
            } else {
              console.log('Admin: All missing IDs were found after case-insensitive check');
            }
            
            // Try to get them from auth.users as a fallback
            try {
              // This would require admin privileges which might not be available
              // Just log the issue for now
              console.log('Admin: Could not find email for some user IDs. This may require checking auth.users table.');
            } catch (error) {
              console.error('Error fetching missing user emails:', error);
            }
          }
        } else {
          console.error('Error fetching user emails from company_users:', userError);
          setError(`Error fetching user emails: ${userError?.message}`);
        }
      }

      // Fetch company information
      if (data && data.length > 0) {
        // Extract company IDs for all search strings that have them
        const companyIds = [...new Set(
          data.filter(item => item.company_id)
            .map(item => item.company_id)
        )];
        
        if (companyIds.length > 0) {
          console.log('Admin: Fetching company names for company IDs:', companyIds);
          
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('id, name')
            .in('id', companyIds);
          
          if (!companyError && companyData) {
            const companyMap: Record<string, string> = {};
            companyData.forEach(company => {
              companyMap[company.id] = company.name;
            });
            setCompanyNames(companyMap);
            console.log('Admin: Fetched company names:', Object.keys(companyMap).length);
          } else {
            console.error('Error fetching company names:', companyError);
            setError(`Error fetching company names: ${companyError?.message}`);
          }
        }
      }
    } catch (error: any) {
      console.error('Error in fetchAllSearchStrings:', error);
      setError(`Unexpected error loading search strings: ${error.message || 'Unknown error'}`);
      toast({
        title: 'Error loading search strings',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  return { fetchAllSearchStrings };
};
