
import { useState } from 'react';
import { z } from 'zod';

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
  const [searchParams, setSearchParams] = useState<SearchParams>(initialSearchParams);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Placeholder for actual search logic
      // You'll need to implement the actual search mechanism
      const searchResults: any[] = [];
      setJobs(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
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
