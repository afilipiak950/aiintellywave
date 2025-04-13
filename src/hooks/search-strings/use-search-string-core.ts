
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth';
import { v4 as uuidv4 } from 'uuid';
import { SearchString, SearchStringType, SearchStringSource } from './search-string-types';

interface UseSearchStringCoreProps {
  companyId?: string;
}

export const useSearchStringCore = (props?: UseSearchStringCoreProps) => {
  const { companyId } = props || {};
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchStrings, setSearchStrings] = useState<SearchString[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewString, setPreviewString] = useState<string | null>(null);

  const fetchSearchStrings = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (!companyId) {
        console.log('No company ID provided, skipping fetch');
        setSearchStrings([]);
        setIsLoading(false);
        return;
      }
      
      if (!user) {
        console.log('No authenticated user, skipping fetch');
        setSearchStrings([]);
        setIsLoading(false);
        return;
      }
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(companyId)) {
        console.error('Invalid company ID format:', companyId);
        setSearchStrings([]);
        toast({
          title: 'Invalid company ID format',
          description: 'The company ID is not in a valid format.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      
      let query = supabase
        .from('search_strings')
        .select('*')
        .order('created_at', { ascending: false });
      
      query = query.eq('company_id', companyId);
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
  }, [companyId, toast, user]);

  return {
    searchStrings,
    isLoading,
    selectedFile,
    setSelectedFile,
    previewString,
    setPreviewString,
    fetchSearchStrings,
    user
  };
};
