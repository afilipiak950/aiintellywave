
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/job-parsing';
import { SearchParams } from '../state/useJobSearchState';

export const useJobSearchOperations = (companyId: string | null, userId: string | null) => {
  // Function to search for jobs based on search parameters
  const searchJobs = async (searchParams: SearchParams): Promise<Job[]> => {
    try {
      // Remove strict requirement for userId and companyId
      console.log('Searching jobs with params:', searchParams);
      console.log('User context:', { userId, companyId });
      
      // Call the Google Jobs scraper Edge Function
      const { data, error } = await supabase.functions.invoke('google-jobs-scraper', {
        body: {
          searchParams: {
            ...searchParams,
            maxResults: 50 // Request up to 50 results (one per company)
          },
          userId: userId || 'anonymous',
          companyId: companyId || 'guest-search'
        }
      });
      
      if (error) {
        console.error('Error calling Google Jobs scraper:', error);
        throw new Error(error.message || 'Failed to search jobs');
      }
      
      if (!data || !data.success) {
        console.error('API returned error:', data?.error || 'Unknown error');
        throw new Error(data?.error || 'Failed to search jobs');
      }
      
      if (!data.data || !data.data.results) {
        console.error('API returned invalid data format:', data);
        throw new Error('Invalid response format from API');
      }
      
      if (data.data.results.length === 0 && data.message) {
        // No results found but API call was successful
        console.log('No job results found:', data.message);
        return [];
      }
      
      console.log('Job search results:', data.data.results);
      console.log(`Received ${data.data.results.length} unique company job listings`);
      
      return data.data.results;
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  };

  return {
    searchJobs
  };
};
