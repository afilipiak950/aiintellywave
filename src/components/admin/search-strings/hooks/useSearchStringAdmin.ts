
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

  // Function to fetch all search strings
  const fetchAllSearchStrings = async () => {
    try {
      setIsRefreshing(true);
      
      // Fetch all search strings without any filters
      const { data, error } = await supabase
        .from('search_strings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching all search strings:', error);
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
      
      // Fetch user emails for those IDs (from auth.users and company_users)
      if (userIds.length > 0) {
        // First try from company_users
        const { data: userData, error: userError } = await supabase
          .from('company_users')
          .select('user_id, email')
          .in('user_id', userIds);
          
        if (!userError && userData) {
          const emailMap: Record<string, string> = {};
          userData.forEach(user => {
            emailMap[user.user_id] = user.email;
          });
          setUserEmails(emailMap);
          console.log('Admin: Fetched user emails from company_users:', Object.keys(emailMap).length);
        } else {
          console.error('Error fetching user emails from company_users:', userError);
        }
        
        // Check which user IDs still don't have emails
        const missingUserIds = userIds.filter(id => !emailMap[id]);
        
        // If there are still missing emails, try to get them from auth.users
        if (missingUserIds.length > 0) {
          // This requires admin privileges to access auth.users
          const { data: authUsers, error: authError } = await supabase
            .rpc('get_user_emails', { user_ids: missingUserIds });
          
          if (!authError && authUsers) {
            const updatedEmailMap = { ...emailMap };
            authUsers.forEach(user => {
              updatedEmailMap[user.id] = user.email;
            });
            setUserEmails(updatedEmailMap);
            console.log('Admin: Updated with auth.users emails:', Object.keys(updatedEmailMap).length);
          } else {
            console.error('Error fetching emails from auth.users:', authError);
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchAllSearchStrings:', error);
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

  // Load company names when search strings change
  useEffect(() => {
    const loadCompanyNames = async () => {
      if (!searchStrings || searchStrings.length === 0) return;
      
      // Filter out search strings without company_id
      const stringWithCompanyIds = searchStrings.filter(item => item.company_id);
      if (stringWithCompanyIds.length === 0) return;
      
      const uniqueCompanyIds = [...new Set(stringWithCompanyIds.map(item => item.company_id))];
      
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .in('id', uniqueCompanyIds);
      
      if (error) {
        console.error('Error fetching company names:', error);
        return;
      }
      
      if (data) {
        const companyMap: Record<string, string> = {};
        data.forEach(company => {
          companyMap[company.id] = company.name;
        });
        setCompanyNames(companyMap);
      }
    };
    
    loadCompanyNames();
  }, [searchStrings]);

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
    setIsDetailOpen
  };
};
