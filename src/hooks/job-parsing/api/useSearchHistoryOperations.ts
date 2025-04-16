
import { supabase } from '@/integrations/supabase/client';
import { JobSearchHistory } from '@/types/job-parsing';
import { SearchParams } from '../state/useJobSearchState';

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
  
  // Save search to history
  const saveSearch = async (
    userId: string, 
    companyId: string, 
    searchParams: SearchParams, 
    results: any[]
  ): Promise<string | null> => {
    try {
      if (!userId || !companyId || !isValidUUID(companyId)) {
        console.warn('Cannot save search - invalid user or company ID');
        return null;
      }
      
      // Convert the job results to JSON compatible format
      const jsonResults = results.map(job => ({
        ...job,
        // Make sure any non-JSON compatible fields are stringified
        datePosted: job.datePosted ? job.datePosted.toString() : null
      }));
      
      const searchRecord = {
        user_id: userId,
        company_id: companyId,
        search_query: searchParams.query,
        search_location: searchParams.location || null,
        search_experience: searchParams.experience || null,
        search_industry: searchParams.industry || null,
        search_results: jsonResults,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('job_search_history')
        .insert(searchRecord)
        .select('id')
        .single();
      
      if (error) {
        console.error('Error saving search:', error);
        throw error;
      }
      
      return data?.id || null;
    } catch (error: any) {
      console.error('Error saving search:', error);
      return null;
    }
  };
  
  // Delete a saved search
  const deleteSearch = async (recordId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('job_search_history')
        .delete()
        .eq('id', recordId);
      
      if (error) {
        console.error('Error deleting search:', error);
        throw error;
      }
      
      return true;
    } catch (error: any) {
      console.error('Error deleting search:', error);
      return false;
    }
  };
  
  // Helper function to check if a string is a valid UUID
  function isValidUUID(str: string): boolean {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidPattern.test(str);
  }
  
  return {
    loadSearchHistory,
    saveSearch,
    deleteSearch
  };
};
