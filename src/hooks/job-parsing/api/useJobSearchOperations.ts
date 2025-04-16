
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
      
      // Store search parameters in sessionStorage to preserve them on unintended refreshes
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('jobSearchParams', JSON.stringify(searchParams));
      }
      
      // Ensure maxResults is set to 100 and force a new search
      const enhancedParams = {
        ...searchParams,
        maxResults: 100, // Request up to 100 results
        forceNewSearch: true, // Always force a new search for fresh results
        includeRealLinks: true // Explicitly request real job links
      };
      
      // Call the Google Jobs scraper Edge Function with optional userId and companyId
      const { data, error } = await supabase.functions.invoke('google-jobs-scraper', {
        body: {
          searchParams: enhancedParams,
          userId: userId || 'anonymous', // Use 'anonymous' as fallback
          companyId: companyId || 'guest-search', // Use 'guest-search' as fallback
          forceNewSearch: true, // Add flag to bypass caching and force a new search
          enhanceLinks: true // Special flag to ensure we focus on getting valid links
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
      
      const results = Array.isArray(data.data.results) ? data.data.results : [];
      
      // Validate results and store them in sessionStorage for recovery after refresh
      const validatedResults = results.map(job => ({
        title: job.title || 'Unbekannter Jobtitel',
        company: job.company || 'Unbekanntes Unternehmen',
        location: job.location || 'Remote/Flexibel',
        description: job.description || 'Keine Beschreibung verfügbar.',
        url: ensureValidUrl(job.url || job.directApplyLink || '') || ensureFallbackUrl(job.title, job.company),
        // Handle date safely - don't pass invalid dates
        datePosted: validateDate(job.datePosted) ? job.datePosted : null,
        salary: job.salary || null,
        employmentType: job.employmentType || null,
        source: job.source || 'Google Jobs',
        directApplyLink: ensureValidUrl(job.directApplyLink || job.url || '')
      }));
      
      // Store results in sessionStorage to recover after accidental refreshes
      if (typeof window !== 'undefined' && validatedResults.length > 0) {
        try {
          sessionStorage.setItem('jobSearchResults', JSON.stringify(validatedResults));
          sessionStorage.setItem('jobSearchTimestamp', Date.now().toString());
        } catch (err) {
          console.warn('Failed to store job results in sessionStorage:', err);
          // Non-fatal error, continue without storage
        }
      }
      
      return validatedResults;
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  };

  // Helper function to restore previous search results if available
  const getStoredJobResults = (): { results: Job[] | null, params: SearchParams | null } => {
    if (typeof window === 'undefined') {
      return { results: null, params: null };
    }
    
    try {
      const storedResults = sessionStorage.getItem('jobSearchResults');
      const storedParams = sessionStorage.getItem('jobSearchParams');
      const timestamp = sessionStorage.getItem('jobSearchTimestamp');
      
      // Only use stored results if they're less than 30 minutes old
      const isRecent = timestamp && (Date.now() - parseInt(timestamp)) < 30 * 60 * 1000;
      
      if (storedResults && isRecent) {
        return { 
          results: JSON.parse(storedResults), 
          params: storedParams ? JSON.parse(storedParams) : null 
        };
      }
    } catch (err) {
      console.warn('Error retrieving stored job results:', err);
    }
    
    return { results: null, params: null };
  };

  // Helper function to ensure URLs are valid
  const ensureValidUrl = (url: string | undefined): string => {
    if (!url) return '';
    
    // If URL doesn't start with http:// or https://, add https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    
    return url;
  };
  
  // Generate a fallback URL to a job search if no URL is provided
  const ensureFallbackUrl = (title: string, company: string): string => {
    const query = encodeURIComponent(`${title} ${company} job`);
    return `https://www.google.com/search?q=${query}`;
  };

  // Validate if a date string is valid
  const validateDate = (dateStr: string | null | undefined): boolean => {
    if (!dateStr) return false;
    
    try {
      const date = new Date(dateStr);
      return !isNaN(date.getTime());
    } catch (e) {
      return false;
    }
  };

  return {
    searchJobs,
    getStoredJobResults
  };
};
