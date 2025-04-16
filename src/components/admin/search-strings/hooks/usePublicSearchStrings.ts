
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SearchStringPublic {
  id: string;
  user_id: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
  input_text?: string;
  input_url?: string;
  input_pdf_path?: string;
  generated_string?: string;
  type: string;
  input_source: string;
  status: string;
  is_processed: boolean;
  error?: string;
  progress?: number;
  processed_at?: string;
  processed_by?: string;
}

export interface FetchParams {
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export const usePublicSearchStrings = () => {
  const [searchStrings, setSearchStrings] = useState<SearchStringPublic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const { toast } = useToast();

  const fetchSearchStrings = useCallback(async (params: FetchParams = {}) => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      const { sortField = 'created_at', sortDirection = 'desc', limit = 1000, offset = 0 } = params;
      
      console.log("Fetching search strings from public API with params:", params);
      
      const { data, error: functionError } = await supabase.functions.invoke('public-search-strings', {
        method: 'GET',
        query: {
          sortField,
          sortDirection,
          limit: limit.toString(),
          offset: offset.toString()
        }
      });
      
      if (functionError) {
        console.error('Error calling public-search-strings function:', functionError);
        setError(`Failed to fetch search strings: ${functionError.message || 'Unknown error'}`);
        toast({
          title: "Error",
          description: `Failed to fetch search strings: ${functionError.message || 'Unknown error'}`,
          variant: "destructive"
        });
        return;
      }
      
      if (!data || data.error) {
        console.error('Error in public-search-strings response:', data?.error);
        setError(`Failed to fetch search strings: ${data?.error || 'No data returned'}`);
        toast({
          title: "Error",
          description: `Failed to fetch search strings: ${data?.error || 'No data returned'}`,
          variant: "destructive"
        });
        return;
      }
      
      console.log(`Successfully fetched ${data.data?.length || 0} search strings. Total count: ${data.totalCount || 'unknown'}`);
      
      setSearchStrings(data.data || []);
      setTotalCount(data.totalCount || 0);
      
      // Show success toast on initial load only (not during refreshing)
      if (isLoading) {
        toast({
          title: "Success",
          description: `Loaded ${data.data?.length} search strings from database`,
        });
      }
    } catch (err: any) {
      console.error('Unexpected error in fetchSearchStrings:', err);
      setError(`An unexpected error occurred: ${err.message || 'Unknown error'}`);
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${err.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast, isLoading]);

  // Initial fetch
  useEffect(() => {
    fetchSearchStrings();
  }, [fetchSearchStrings]);

  return {
    searchStrings,
    isLoading,
    isRefreshing,
    error,
    totalCount,
    refresh: fetchSearchStrings,
  };
};
