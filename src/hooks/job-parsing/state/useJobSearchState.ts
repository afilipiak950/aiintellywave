
import { useState, useCallback, useEffect } from 'react';
import { Job } from '@/types/job-parsing';

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
      // Simulate API call - replace with your actual API call
      const response = await fetch('/api/mock-job-search', {
        method: 'POST',
        body: JSON.stringify(searchParams),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setJobs(data.jobs || []);
      
      // Clear error state if successful
      setError(null);
      
      // Save to localStorage
      localStorage.setItem('jobSearchData', JSON.stringify({ 
        searchParams, 
        jobs: data.jobs || [] 
      }));
      
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
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
