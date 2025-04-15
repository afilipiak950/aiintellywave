
import { supabase } from '@/integrations/supabase/client';
import { JobSearchHistory } from '@/types/job-parsing';

export const useSearchHistoryOperations = (companyId: string | null) => {
  
  // Load search history from the database
  const loadSearchHistory = async (userId: string, companyId: string): Promise<JobSearchHistory[]> => {
    try {
      console.info(`Loading job search history for user: ${userId}`);
      
      // If companyId is 'guest-search' or not a valid UUID, return an empty array instead of querying
      if (!companyId || companyId === 'guest-search') {
        console.log('Using guest mode, no search history available');
        return [];
      }
      
      // Make sure companyId is a valid UUID to prevent database errors
      if (!isValidUUID(companyId)) {
        console.log(`Invalid company ID format: ${companyId}, skipping search history`);
        return [];
      }
      
      const { data, error } = await supabase
        .from('job_search_history')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Error loading search history:', error);
        throw error;
      }
      
      // Ensure search_results is properly parsed as an array of Job objects
      const parsedData = data?.map(item => ({
        ...item,
        search_results: Array.isArray(item.search_results) 
          ? item.search_results 
          : (typeof item.search_results === 'string' 
              ? JSON.parse(item.search_results) 
              : [])
      })) || [];
      
      return parsedData;
    } catch (error: any) {
      console.error('Error loading search history:', error);
      return [];
    }
  };
  
  // Helper function to check if a string is a valid UUID
  function isValidUUID(str: string): boolean {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidPattern.test(str);
  }
  
  return {
    loadSearchHistory
  };
};
