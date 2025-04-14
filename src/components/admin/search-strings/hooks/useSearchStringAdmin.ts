
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
          const userEmailMap: Record<string, string> = {};
          userData.forEach(user => {
            userEmailMap[user.user_id] = user.email;
          });
          setUserEmails(userEmailMap);
          console.log('Admin: Fetched user emails from company_users:', Object.keys(userEmailMap).length);
        } else {
          console.error('Error fetching user emails from company_users:', userError);
        }
        
        // Check which user IDs still don't have emails
        const missingUserIds = userIds.filter(id => !userEmailMap[id]);
        
        // If there are still missing emails, try to get them directly from the database
        // Since direct access to auth.users might be restricted, we'll use a different approach
        if (missingUserIds.length > 0) {
          try {
            // Fetch directly from the database using a custom function or query
            // This is a fallback and may require backend support
            console.log('Admin: Some user emails not found in company_users, trying alternative methods');
            
            // Example: You might need to create a separate serverless function or API endpoint to get this data
            // For now, we'll just log the missing user IDs
            console.log('Missing user IDs:', missingUserIds);
          } catch (authError) {
            console.error('Error fetching additional user emails:', authError);
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
