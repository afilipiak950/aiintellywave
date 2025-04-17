
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/job-parsing';
import { toast } from '@/hooks/use-toast';

export interface SearchParams {
  query: string;
  location: string;
  experience: string;
  industry: string;
  maxResults: number;
}

export const initialSearchParams: SearchParams = {
  query: '',
  location: '',
  experience: 'any',
  industry: '',
  maxResults: 50
};

export const useJobSearchState = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>(initialSearchParams);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Load search data from localStorage on mount
  useEffect(() => {
    try {
      const savedSearchData = localStorage.getItem('jobSearchData');
      if (savedSearchData) {
        const { searchParams: savedParams, jobs: savedJobs } = JSON.parse(savedSearchData);
        if (savedParams) setSearchParams(savedParams);
        if (savedJobs && Array.isArray(savedJobs)) setJobs(savedJobs);
      }
    } catch (err) {
      console.error('Error loading saved search data:', err);
    }
  }, []);

  // Save search data to localStorage when it changes
  useEffect(() => {
    if (jobs.length > 0) {
      localStorage.setItem('jobSearchData', JSON.stringify({ searchParams, jobs }));
    }
  }, [searchParams, jobs]);

  const handleSearch = useCallback(async () => {
    if (!searchParams.query) {
      setError('Bitte geben Sie einen Suchbegriff ein');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Searching for jobs with params:', searchParams);
      
      // Direct call to the Supabase Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('google-jobs-scraper', {
        body: {
          searchParams: {
            ...searchParams,
            maxResults: 50,
            forceNewSearch: true
          },
          userId: 'anonymous',
          companyId: 'guest-search',
          enhanceLinks: true
        }
      });
      
      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message || 'Fehler bei der API-Anfrage');
      }
      
      console.log('API response:', data);
      
      if (!data || !data.success) {
        throw new Error(data?.error || 'Fehler bei der API-Anfrage');
      }
      
      if (data.data && Array.isArray(data.data.results)) {
        setJobs(data.data.results);
        
        // Clear error state if successful
        setError(null);
        
        // Save to localStorage
        localStorage.setItem('jobSearchData', JSON.stringify({ 
          searchParams, 
          jobs: data.data.results || [] 
        }));
      } else {
        console.error('Invalid response format:', data);
        throw new Error('Ungültiges Antwortformat vom Server');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'API error: 404');
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  return {
    searchParams,
    setSearchParams,
    jobs,
    setJobs,
    isLoading,
    error,
    retryCount,
    handleSearch,
  };
};
