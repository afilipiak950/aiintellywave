
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth';
import { SearchString, SearchStringType, SearchStringSource } from './search-string-types';

export const useSearchStringCore = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchStrings, setSearchStrings] = useState<SearchString[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewString, setPreviewString] = useState<string | null>(null);
  const [fetchAttempts, setFetchAttempts] = useState(0);

  const fetchSearchStrings = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (!user) {
        console.log('No authenticated user, skipping fetch');
        setSearchStrings([]);
        setIsLoading(false);
        return;
      }
      
      let query = supabase
        .from('search_strings')
        .select('*')
        .order('created_at', { ascending: false });
      
      query = query.eq('user_id', user.id);
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching search strings:', error);
        setSearchStrings([]);
        toast({
          title: 'Failed to load search strings',
          description: error.message || 'Please try again later',
          variant: 'destructive',
        });
      } else {
        console.log('Fetched search strings:', data.length);
        setSearchStrings(data as SearchString[]);
      }
    } catch (error) {
      console.error('Error in fetchSearchStrings:', error);
      setSearchStrings([]);
      toast({
        title: 'Failed to load search strings',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, user]);

  // Implement polling for search strings with status='processing'
  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchSearchStrings();

    // Setup polling for processing strings
    const pollingInterval = setInterval(() => {
      if (searchStrings && searchStrings.some(s => s.status === 'processing')) {
        console.log('Polling for updates to processing search strings');
        fetchSearchStrings();
        setFetchAttempts(prev => prev + 1);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollingInterval);
  }, [fetchSearchStrings, user, searchStrings]);

  return {
    searchStrings,
    isLoading,
    selectedFile,
    setSelectedFile,
    previewString,
    setPreviewString,
    fetchSearchStrings,
    user,
    fetchAttempts
  };
};
