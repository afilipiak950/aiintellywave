
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/job-parsing';
import { SearchParams } from '../state/useJobSearchState';
import { toast } from '@/hooks/use-toast';

export const useJobSearchOperations = (companyId: string | null, userId: string | null) => {
  // Function to search for jobs based on search parameters
  const searchJobs = async (searchParams: SearchParams): Promise<Job[]> => {
    try {
      // Enhanced logging for debugging
      console.log('Searching jobs with params:', searchParams);
      console.log('User context:', { userId, companyId });
      
      // Set default values to ensure search works even without authentication
      const effectiveUserId = userId || 'anonymous';
      const effectiveCompanyId = companyId || 'guest-search';
      
      // Ensure maxResults is set to 50 and force a new search
      const enhancedParams = {
        ...searchParams,
        maxResults: 50, // Always set to 50 jobs
        forceNewSearch: true, // Always force a new search for fresh results
        includeRealLinks: true // Explicitly request real job links
      };
      
      // Add a timeout for the Edge Function call - but we won't use signal directly
      // since FunctionInvokeOptions doesn't support it
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
      
      try {
        // Call the Google Jobs scraper Edge Function with optional userId and companyId
        // We'll capture the abort event separately instead of passing signal directly
        const abortPromise = new Promise<never>((_, reject) => {
          controller.signal.addEventListener('abort', () => {
            reject(new Error('Die Anfrage hat zu lange gedauert. Bitte versuchen Sie es später erneut.'));
          });
        });
        
        const fetchPromise = supabase.functions.invoke('google-jobs-scraper', {
          body: {
            searchParams: enhancedParams,
            userId: effectiveUserId,
            companyId: effectiveCompanyId,
            forceNewSearch: true,
            enhanceLinks: true
          }
        });
        
        // Race between the actual fetch and the abort promise
        const result = await Promise.race([fetchPromise, abortPromise]);
        clearTimeout(timeoutId);
        
        const { data, error } = result;
        
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
          toast({
            title: 'Keine Ergebnisse',
            description: data.message || 'Keine Jobangebote gefunden',
            variant: 'default'
          });
          return [];
        }
        
        console.log('Job search results:', data.data.results);
        console.log(`Received ${data.data.results.length} job listings`);
        
        const results = Array.isArray(data.data.results) ? data.data.results : [];
        
        // Validate results and ensure proper formatting
        return results.slice(0, 50).map(job => ({
          title: job.title || 'Unbekannter Jobtitel',
          company: job.company || 'Unbekanntes Unternehmen',
          location: job.location || 'Remote/Flexibel',
          description: job.description || 'Keine Beschreibung verfügbar.',
          url: ensureValidUrl(job.url || job.directApplyLink || '') || createFallbackUrl(job.title, job.company),
          datePosted: job.datePosted || null,
          salary: job.salary || null,
          employmentType: job.employmentType || null,
          source: job.source || 'Google Jobs',
          directApplyLink: ensureValidUrl(job.directApplyLink || job.url || '')
        }));
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // Check if this was a timeout error
        if (fetchError.name === 'AbortError') {
          console.error('Edge function request timed out after 30 seconds');
          throw new Error('Die Anfrage hat zu lange gedauert. Bitte versuchen Sie es später erneut.');
        }
        
        // Provide more detailed error information for network errors
        if (fetchError.message.includes('Failed to fetch') || 
            fetchError.message.includes('Failed to send a request')) {
          console.error('Network error calling edge function:', fetchError);
          throw new Error('Edge Function nicht erreichbar. Bitte überprüfen Sie Ihre Internetverbindung oder kontaktieren Sie den Support.');
        }
        
        throw fetchError;
      }
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
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
  const createFallbackUrl = (title: string, company: string): string => {
    const query = encodeURIComponent(`${title} ${company} job`);
    return `https://www.google.com/search?q=${query}`;
  };

  // Function to get stored job results from session storage
  const getStoredJobResults = () => {
    if (typeof window === 'undefined') {
      return { results: null, params: null };
    }
    
    try {
      const storedResults = sessionStorage.getItem('jobSearchResults');
      const storedParams = sessionStorage.getItem('jobSearchParams');
      
      if (storedResults) {
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

  return {
    searchJobs,
    getStoredJobResults
  };
};
