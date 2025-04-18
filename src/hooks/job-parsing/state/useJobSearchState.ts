
import { useState, useCallback } from 'react';
import { Job } from '@/types/job-parsing';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

  const handleSearch = useCallback(async () => {
    if (!searchParams.query) {
      toast({
        title: 'Suchbegriff fehlt',
        description: 'Bitte geben Sie einen Suchbegriff ein.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setJobs([]);

    try {
      console.log('Searching for jobs with params:', searchParams);
      
      // Invoke the Edge Function for job search
      const { data, error } = await supabase.functions.invoke('get-job-results', {
        body: { 
          query: searchParams.query,
          location: searchParams.location,
          experience: searchParams.experience,
          industry: searchParams.industry,
          maxResults: searchParams.maxResults
        }
      });

      if (error) {
        console.error('Job search error:', error);
        setError(`Fehler bei der Jobsuche: ${error.message}`);
        setRetryCount(prev => prev + 1);
        return;
      }

      // Check if we have results
      if (!data || !data.jobs || !Array.isArray(data.jobs)) {
        console.error('Invalid response format:', data);
        setError('Ungültiges Antwortformat vom Server');
        return;
      }

      console.log(`Got ${data.jobs.length} job results`);
      setJobs(data.jobs);
      
      // Show toast for successful search
      if (data.jobs.length === 0) {
        toast({
          title: 'Keine Ergebnisse gefunden',
          description: `Es wurden keine Jobangebote für "${searchParams.query}" gefunden.`,
          variant: 'default'
        });
      } else {
        toast({
          title: 'Suche abgeschlossen',
          description: `${data.jobs.length} Jobangebote gefunden.`,
          variant: 'default'
        });
      }
    } catch (err) {
      console.error('Job search failed:', err);
      setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  // Helfer-Funktion für Mock-Daten bei Entwicklung
  const useMockData = useCallback(() => {
    const mockJobs: Job[] = [
      {
        id: '1',
        title: 'Software Engineer',
        company: 'Tech GmbH',
        location: 'Berlin, Deutschland',
        description: 'Wir suchen einen erfahrenen Software Engineer mit Kenntnissen in React, TypeScript und Node.js...',
        url: 'https://example.com/job1',
        datePosted: '2023-05-15',
        salary: '60.000 € - 80.000 €',
        employmentType: 'Vollzeit',
        source: 'Google Jobs'
      },
      {
        id: '2',
        title: 'Frontend Developer',
        company: 'Digital Solutions AG',
        location: 'München, Deutschland',
        description: 'Als Frontend Developer gestalten Sie moderne Benutzeroberflächen und arbeiten eng mit unserem Design-Team zusammen...',
        url: 'https://example.com/job2',
        datePosted: '2023-05-10',
        employmentType: 'Vollzeit',
        source: 'Google Jobs'
      }
    ];
    
    setJobs(mockJobs);
    setIsLoading(false);
    setError(null);
    
    toast({
      title: 'Mock-Daten geladen',
      description: 'Im Entwicklungsmodus werden Beispieldaten angezeigt.',
      variant: 'default'
    });
  }, []);

  return {
    searchParams,
    setSearchParams,
    jobs,
    setJobs,
    isLoading,
    error,
    retryCount,
    handleSearch,
    useMockData
  };
};
