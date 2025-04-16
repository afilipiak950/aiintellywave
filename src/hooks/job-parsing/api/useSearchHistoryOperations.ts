
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
  
  // Save search to history - improved with better error handling and validation
  const saveSearch = async (
    userId: string, 
    companyId: string, 
    searchParams: SearchParams, 
    results: any[]
  ): Promise<string | null> => {
    try {
      // Validate input parameters
      if (!userId || !userId.trim()) {
        console.error('Invalid user ID provided');
        throw new Error('Ungültiger Benutzer');
      }
      
      // Special check to handle guest-search mode
      if (companyId === 'guest-search') {
        console.error('Cannot save search in guest mode');
        throw new Error('Speichern im Gast-Modus nicht möglich');
      }
      
      // Additional validation for company ID format
      if (!companyId || !companyId.trim()) {
        console.error('Empty company ID provided');
        throw new Error('Ungültige Firmen-ID');
      }
      
      if (!isValidUUID(companyId)) {
        console.error('Invalid company ID format:', companyId);
        throw new Error('Ungültiges Firmen-ID Format');
      }
      
      if (!Array.isArray(results) || results.length === 0) {
        console.error('No results to save');
        throw new Error('Keine Ergebnisse zum Speichern vorhanden');
      }
      
      // Validate search parameters
      if (!searchParams.query || !searchParams.query.trim()) {
        console.error('Missing required search query');
        throw new Error('Suchbegriff ist erforderlich');
      }
      
      console.log('Saving search with params:', searchParams);
      console.log('User ID:', userId);
      console.log('Company ID:', companyId);
      console.log('Saving total of', results.length, 'job results');
      
      // Convert the job results to a format compatible with Supabase
      // We need to ensure all properties are JSON-serializable
      const jsonResults = results.map(job => {
        // Create a clean job object for storage
        return {
          title: job.title || '',
          company: job.company || '',
          location: job.location || '',
          description: job.description || '',
          url: job.url || '',
          datePosted: job.datePosted ? String(job.datePosted) : null,
          salary: job.salary || null,
          employmentType: job.employmentType || null,
          source: job.source || 'Google Jobs',
          directApplyLink: job.directApplyLink || ''
        };
      });
      
      // Create a search record with proper JSON data
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
      
      // Insert record into database
      const { data, error } = await supabase
        .from('job_search_history')
        .insert(searchRecord)
        .select('id')
        .single();
      
      if (error) {
        console.error('Error saving search:', error);
        throw new Error('Fehler beim Speichern der Suche: ' + error.message);
      }
      
      return data?.id || null;
    } catch (error: any) {
      console.error('Error saving search:', error);
      throw new Error(error.message || 'Fehler beim Speichern der Suche');
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
