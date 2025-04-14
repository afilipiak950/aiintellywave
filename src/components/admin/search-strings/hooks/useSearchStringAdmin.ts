
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
      
      // Fetch all search strings without any filters
      console.log('Admin: Fetching all search strings (no filters)');
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
      
      console.log('Admin: Fetched search strings:', data?.length);
      setSearchStrings(data || []);
      
      // Get all unique user IDs
      const userIds = [...new Set(data?.map(item => item.user_id) || [])];
      console.log('Admin: Found user IDs:', userIds);
      
      // Fetch user emails for those IDs (from company_users)
      if (userIds.length > 0) {
        // First try from company_users
        const { data: userData, error: userError } = await supabase
          .from('company_users')
          .select('user_id, email')
          .in('user_id', userIds);
          
        if (!userError && userData) {
          const userEmailMap: Record<string, string> = {};
          userData.forEach(user => {
            userEmailMap[user.user_id] = user.email;
          });
          setUserEmails(userEmailMap);
          console.log('Admin: Fetched user emails from company_users:', Object.keys(userEmailMap).length);
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
    } catch (error) {
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
        setError(`User with email ${email} not found`);
        toast({
          title: 'User not found',
          description: `User with email ${email} was not found in the system`,
          variant: 'destructive',
        });
        return;
      }

      const userId = userData[0].user_id;
      console.log(`Found user ID ${userId} for email ${email}`);
      
      // Now get all search strings for this user
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
      
      // Set the search strings directly so we only see this user's strings
      setSearchStrings(stringData || []);
      
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
      
    } catch (error) {
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
    } catch (error) {
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
