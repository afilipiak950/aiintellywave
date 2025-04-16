
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/job-parsing';
import { SearchParams } from '../state/useJobSearchState';

export const useJobSearchOperations = (companyId: string | null, userId: string | null) => {
  // Function to search for jobs based on search parameters
  const searchJobs = async (searchParams: SearchParams): Promise<Job[]> => {
    try {
      // Enhanced logging for debugging
      console.log('Searching jobs with params:', searchParams);
      console.log('User context:', { userId, companyId });
      
      // Ensure maxResults is set to 100
      const enhancedParams = {
        ...searchParams,
        maxResults: 100 // Request up to 100 results
      };
      
      // Call the Google Jobs scraper Edge Function with optional userId and companyId
      const { data, error } = await supabase.functions.invoke('google-jobs-scraper', {
        body: {
          searchParams: enhancedParams,
          userId: userId || 'anonymous', // Use 'anonymous' as fallback
          companyId: companyId || 'guest-search', // Use 'guest-search' as fallback
          forceNewSearch: true // Add flag to bypass caching and force a new search
        }
      });
      
      if (error) {
        console.error('Error calling Google Jobs scraper:', error);
        throw new Error(error.message || 'Failed to search jobs');
      }
      
      console.log('Google Jobs API response:', data);
      
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
      console.log(`Received ${data.data.results.length} job listings`);
      
      // Ensure we're returning an array of jobs with proper validation
      const results = Array.isArray(data.data.results) ? data.data.results : [];
      
      // Make sure each job object has the required fields
      const validatedResults = results.map(job => ({
        title: job.title || 'Unbekannter Jobtitel',
        company: job.company || 'Unbekanntes Unternehmen',
        location: job.location || 'Remote/Flexibel',
        description: job.description || 'Keine Beschreibung verfügbar.',
        url: job.url || '#',
        datePosted: job.datePosted || null,
        salary: job.salary || null,
        employmentType: job.employmentType || null,
        source: job.source || 'Google Jobs'
      }));
      
      return validatedResults;
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  };

  return {
    searchJobs
  };
};
