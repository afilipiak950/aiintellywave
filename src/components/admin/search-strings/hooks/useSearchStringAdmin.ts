
import { useState, useEffect } from 'react';
import { SearchString } from '@/hooks/search-strings/search-string-types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UseSearchStringAdminReturn {
  searchStrings: SearchString[];
  isLoading: boolean;
  isRefreshing: boolean;
  companyNames: Record<string, string>;
  userEmails: Record<string, string>;
  selectedSearchString: SearchString | null;
  isDetailOpen: boolean;
  fetchAllSearchStrings: () => Promise<void>;
  markAsProcessed: (id: string, e: React.MouseEvent) => Promise<void>;
  handleCreateProject: (searchString: SearchString, e: React.MouseEvent) => void;
  handleViewDetails: (searchString: SearchString) => void;
  setIsDetailOpen: (isOpen: boolean) => void;
  checkSpecificUser: (email?: string) => Promise<void>;
  error: string | null;
}

export const useSearchStringAdmin = (): UseSearchStringAdminReturn => {
  const { toast } = useToast();
  const [searchStrings, setSearchStrings] = useState<SearchString[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSearchString, setSelectedSearchString] = useState<SearchString | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [companyNames, setCompanyNames] = useState<Record<string, string>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Function to fetch all search strings
  const fetchAllSearchStrings = async () => {
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
            }
          });
          setUserEmails(userEmailMap);
          console.log('Admin: Fetched user emails from company_users:', Object.keys(userEmailMap).length);
          
          // Check if we got all the emails
          const missingUserIds = userIds.filter(id => !userEmailMap[id]);
          if (missingUserIds.length > 0) {
            console.log('Admin: Missing emails for user IDs:', missingUserIds);
            
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

  // Function to check a specific user's search strings by email
  const checkSpecificUser = async (email: string = 's.naeb@flh-mediadigital.de') => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      // First get the user ID from their email
      console.log(`Admin: Checking search strings for user with email: ${email}`);
      const { data: userData, error: userError } = await supabase
        .from('company_users')
        .select('user_id, email, company_id, role')
        .eq('email', email)
        .limit(1);
      
      if (userError) {
        console.error('Error finding user by email:', userError);
        setError(`Failed to find user with email ${email}: ${userError.message}`);
        return;
      }
      
      if (!userData || userData.length === 0) {
        console.error(`User with email ${email} not found`);
        setError(`User with email ${email} not found in company_users table. The user might exist in auth.users but not have a company_users entry.`);
        toast({
          title: 'User not found',
          description: `User with email ${email} was not found in company_users table`,
          variant: 'destructive',
        });
        
        // Even though we didn't find the user, let's try a direct search in the search_strings table
        // by checking for search strings with a similar email pattern
        console.log(`Attempting direct search in search_strings for email pattern: ${email}`);
        const { data: directSearchData, error: directSearchError } = await supabase
          .from('search_strings')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!directSearchError && directSearchData && directSearchData.length > 0) {
          console.log(`Found ${directSearchData.length} search strings in total`);
          
          // Display all search strings instead
          setSearchStrings(directSearchData || []);
          toast({
            title: 'Showing all search strings',
            description: `Could not find user with email ${email}, showing all ${directSearchData.length} search strings instead`,
            variant: 'default',
          });
        }
        
        return;
      }

      const userId = userData[0].user_id;
      console.log(`Found user ID ${userId} for email ${email}`);
      
      // Now get all search strings for this user
      console.log(`Fetching search strings for user ID: ${userId}`);
      const { data: stringData, error: stringError } = await supabase
        .from('search_strings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (stringError) {
        console.error('Error fetching user search strings:', stringError);
        setError(`Failed to load search strings for user: ${stringError.message}`);
        return;
      }
      
      console.log(`Found ${stringData?.length || 0} search strings for user ID ${userId}`);
      
      if (stringData && stringData.length === 0) {
        // If no strings found with exact user ID, try a case-insensitive comparison
        // This is because sometimes user IDs might be stored with different casing
        console.log(`No exact matches found. Fetching all search strings to check case-insensitive...`);
        const { data: allStrings, error: allStringsError } = await supabase
          .from('search_strings')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (!allStringsError && allStrings) {
          // Filter client-side for case-insensitive user_id match
          const caseInsensitiveMatches = allStrings.filter(
            s => s.user_id && s.user_id.toLowerCase() === userId.toLowerCase()
          );
          
          if (caseInsensitiveMatches.length > 0) {
            console.log(`Found ${caseInsensitiveMatches.length} search strings with case-insensitive user ID match`);
            setSearchStrings(caseInsensitiveMatches);
            
            toast({
              title: 'Search strings found',
              description: `Found ${caseInsensitiveMatches.length} search strings with case-insensitive user ID match`,
              variant: 'default'
            });
          } else {
            setSearchStrings([]);
            setError(`No search strings found for user ID "${userId}" (${email}). This could indicate that the search strings were created with a different user account.`);
          }
        }
      } else {
        // Set the search strings directly so we only see this user's strings
        setSearchStrings(stringData || []);
      }
      
      // Add the email to our userEmails mapping
      setUserEmails(prev => ({
        ...prev,
        [userId]: email
      }));
      
      // Show success message
      toast({
        title: 'User search strings loaded',
        description: `Found ${stringData?.length || 0} search strings for ${email}`,
        variant: stringData?.length ? 'default' : 'destructive'
      });
      
      // Also fetch company details if needed
      if (userData[0].company_id) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('id, name')
          .eq('id', userData[0].company_id)
          .limit(1);
          
        if (companyData && companyData.length > 0) {
          setCompanyNames(prev => ({
            ...prev,
            [companyData[0].id]: companyData[0].name
          }));
        }
      }
      
    } catch (error: any) {
      console.error('Error in checkSpecificUser:', error);
      setError(`Unexpected error checking user: ${error.message || 'Unknown error'}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAllSearchStrings();
  }, []);

  // Mark a search string as processed
  const markAsProcessed = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('search_strings')
        .update({ 
          is_processed: true, 
          processed_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error marking search string as processed:', error);
        toast({
          title: 'Failed to update',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      // Update the local state
      setSearchStrings(prev => 
        prev.map(item => 
          item.id === id ? { ...item, is_processed: true, processed_at: new Date().toISOString() } : item
        )
      );
      
      toast({
        title: 'Marked as processed',
        description: 'Search string has been marked as processed',
      });
    } catch (error: any) {
      console.error('Error in markAsProcessed:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // View search string details
  const handleViewDetails = (searchString: SearchString) => {
    setSelectedSearchString(searchString);
    setIsDetailOpen(true);
  };

  // Create a new project from a search string
  const handleCreateProject = (searchString: SearchString, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/admin/projects/new?search_string_id=${searchString.id}`;
  };

  return {
    searchStrings,
    isLoading,
    isRefreshing,
    companyNames,
    userEmails,
    selectedSearchString,
    isDetailOpen,
    fetchAllSearchStrings,
    markAsProcessed,
    handleCreateProject,
    handleViewDetails,
    setIsDetailOpen,
    error,
    checkSpecificUser
  };
};
