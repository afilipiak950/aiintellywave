
import { useState, useCallback } from 'react';
import { Job } from '@/types/job-parsing';
import { useJobSearchOperations } from '../api/useJobSearchOperations';
import { useAuth } from '@/context/auth';
import { toast } from '@/hooks/use-toast';

export interface SearchParams {
  query: string;
  location: string;
  experience: string;
  industry: string;
  maxResults?: number;
  forceNewSearch?: boolean;
  includeRealLinks?: boolean;
}

export const useJobSearchState = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    location: '',
    experience: 'any',
    industry: '',
    maxResults: 50
  });
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Use the job search operations
  const { searchJobs, getStoredJobResults } = useJobSearchOperations(
    user?.companyId || null,
    user?.id || null
  );
  
  // Initialize from stored results if available
  useState(() => {
    const { results, params } = getStoredJobResults();
    if (results && params) {
      setJobs(results);
      setSearchParams(params);
    }
  });
  
  // Handle search
  const handleSearch = useCallback(async () => {
    if (!searchParams.query.trim()) {
      setError('Bitte geben Sie einen Suchbegriff ein');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Searching for jobs with query: ${searchParams.query}`);
      
      // Set a timeout to handle hanging requests
      const searchPromise = searchJobs(searchParams);
      const timeoutPromise = new Promise<Job[]>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Die Suche hat zu lange gedauert. Bitte versuchen Sie es später erneut.'));
        }, 40000); // 40 seconds timeout
      });
      
      // Race between the actual search and the timeout
      const results = await Promise.race([searchPromise, timeoutPromise]);
      
      // Store results in session storage for persistence
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('jobSearchResults', JSON.stringify(results));
        sessionStorage.setItem('jobSearchParams', JSON.stringify(searchParams));
      }
      
      setJobs(results);
      setRetryCount(0);
      
      if (results.length === 0) {
        toast({
          title: 'Keine Jobangebote gefunden',
          description: 'Versuchen Sie es mit anderen Suchbegriffen.',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Jobangebote gefunden',
          description: `${results.length} Jobangebote wurden gefunden.`,
          variant: 'default'
        });
      }
    } catch (err) {
      console.error('Job search error:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten';
      
      setError(errorMessage);
      setRetryCount(prev => prev + 1);
      
      // Custom error messages for specific error types
      if (errorMessage.includes('Failed to send a request') || 
          errorMessage.includes('Failed to fetch')) {
        setError('Fehler bei der Jobsuche: Edge Function nicht erreichbar. Bitte versuchen Sie es später erneut.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, searchJobs]);
  
  return {
    searchParams,
    setSearchParams,
    jobs,
    setJobs,
    isLoading,
    error,
    retryCount,
    handleSearch
  };
};
