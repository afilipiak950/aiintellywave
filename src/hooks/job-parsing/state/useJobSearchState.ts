
import { useState } from 'react';
import { z } from 'zod';
import { useJobSearchOperations } from '../api/useJobSearchOperations';
import { Job } from '@/types/job-parsing';
import { useAuth } from '@/context/auth';

// Define the schema for search parameters
export const searchParamsSchema = z.object({
  query: z.string().min(1, "Search term is required"),
  location: z.string().optional(),
  experience: z.enum(['any', 'entry_level', 'mid_level', 'senior_level']).default('any'),
  industry: z.string().optional(),
  maxResults: z.number().min(1).max(100).default(50)
});

// Export the type for use in components
export type SearchParams = z.infer<typeof searchParamsSchema>;

// Initial search parameters
export const initialSearchParams: SearchParams = {
  query: '',
  location: '',
  experience: 'any',
  industry: '',
  maxResults: 50
};

export const useJobSearchState = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState<SearchParams>(initialSearchParams);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Get operations for searching jobs
  const { searchJobs } = useJobSearchOperations(user?.companyId || null, user?.id || null);

  const handleSearch = async () => {
    // Validate search parameters
    try {
      searchParamsSchema.parse(searchParams);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        setError(validationError.errors[0]?.message || 'Invalid search parameters');
        return;
      }
    }

    if (!searchParams.query.trim()) {
      setError('Suchbegriff ist erforderlich');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting job search with params:', searchParams);
      const results = await searchJobs(searchParams);
      console.log('Search results:', results);
      setJobs(results);
    } catch (err) {
      console.error('Error searching jobs:', err);
      setError(err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten');
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchParams,
    setSearchParams,
    jobs,
    isLoading,
    error,
    retryCount,
    handleSearch
  };
};
