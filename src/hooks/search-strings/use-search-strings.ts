
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type SearchStringType = 'recruiting' | 'lead_generation';
export type SearchStringSource = 'text' | 'website' | 'pdf';
export type SearchStringStatus = 'new' | 'processing' | 'completed';

export interface SearchString {
  id: string;
  company_id: string;
  user_id: string;
  type: SearchStringType;
  input_text?: string;
  input_url?: string;
  input_pdf_path?: string;
  input_source: SearchStringSource;
  generated_string?: string;
  status: SearchStringStatus;
  is_processed: boolean;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  processed_by?: string;
}

interface UseSearchStringsProps {
  companyId?: string;
}

export const useSearchStrings = ({ companyId }: UseSearchStringsProps = {}) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch search strings
  const { data: searchStrings, isLoading, error, refetch } = useQuery({
    queryKey: ['searchStrings', companyId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('search_strings')
          .select('*')
          .order('created_at', { ascending: false });
          
        // Filter by company if provided
        if (companyId) {
          query = query.eq('company_id', companyId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return data as SearchString[];
      } catch (error: any) {
        console.error('Error fetching search strings:', error);
        toast({
          title: 'Error',
          description: `Failed to load search strings: ${error.message}`,
          variant: 'destructive',
        });
        return [];
      }
    },
    enabled: !!companyId || companyId === undefined, // Run if companyId is provided or explicitly undefined (admin view)
  });

  // Create a new search string
  const createSearchString = async (
    type: SearchStringType,
    inputSource: SearchStringSource,
    inputText?: string,
    inputUrl?: string,
    file?: File
  ) => {
    try {
      // Create initial record
      const { data: newSearchString, error: createError } = await supabase
        .from('search_strings')
        .insert({
          company_id: companyId,
          type,
          input_source: inputSource,
          input_text: inputText,
          input_url: inputUrl,
          status: inputSource === 'pdf' ? 'new' : 'processing',
        })
        .select()
        .single();
      
      if (createError) throw createError;
      
      if (inputSource === 'pdf' && file) {
        // Upload PDF file
        const filePath = `${newSearchString.id}/${file.name}`;
        
        // Check if storage bucket exists, create if it doesn't
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.find(b => b.name === 'search_strings_files');
        
        if (!bucketExists) {
          await supabase.storage.createBucket('search_strings_files', {
            public: false
          });
        }
        
        // Upload the file
        const { error: uploadError } = await supabase
          .storage
          .from('search_strings_files')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        // Update record with file path
        await supabase
          .from('search_strings')
          .update({
            input_pdf_path: filePath,
          })
          .eq('id', newSearchString.id);
          
        // Process PDF
        const { error: processPdfError } = await supabase.functions.invoke('process-pdf', {
          body: {
            pdf_path: filePath,
            search_string_id: newSearchString.id
          }
        });
        
        if (processPdfError) throw processPdfError;
      }
      
      // Generate search string (if not PDF, which needs a separate processing step)
      if (inputSource !== 'pdf') {
        const { error: generateError } = await supabase.functions.invoke('generate-search-string', {
          body: {
            type,
            input_text: inputText,
            input_url: inputUrl,
            input_source: inputSource,
            company_id: companyId,
            search_string_id: newSearchString.id
          }
        });
        
        if (generateError) throw generateError;
      }
      
      // Refresh the list
      refetch();
      
      return newSearchString;
    } catch (error: any) {
      console.error('Error creating search string:', error);
      toast({
        title: 'Error',
        description: `Failed to create search string: ${error.message}`,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Mark a search string as processed
  const markAsProcessed = async (id: string) => {
    try {
      const { error } = await supabase
        .from('search_strings')
        .update({
          is_processed: true,
          processed_at: new Date().toISOString(),
        })
        .eq('id', id);
        
      if (error) throw error;
      
      // Refresh the list
      refetch();
      
      toast({
        title: 'Success',
        description: 'Search string marked as processed',
      });
    } catch (error: any) {
      console.error('Error marking search string as processed:', error);
      toast({
        title: 'Error',
        description: `Failed to update search string: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  // Delete a search string
  const deleteSearchString = async (id: string) => {
    try {
      const { error } = await supabase
        .from('search_strings')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Refresh the list
      refetch();
      
      toast({
        title: 'Success',
        description: 'Search string deleted',
      });
    } catch (error: any) {
      console.error('Error deleting search string:', error);
      toast({
        title: 'Error',
        description: `Failed to delete search string: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  // Toggle search string feature for a company
  const toggleSearchStringFeature = async (companyId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          enable_search_strings: enabled,
        })
        .eq('id', companyId);
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `Search string feature ${enabled ? 'enabled' : 'disabled'} for company`,
      });
      
      return true;
    } catch (error: any) {
      console.error('Error toggling search string feature:', error);
      toast({
        title: 'Error',
        description: `Failed to update company settings: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    searchStrings,
    isLoading,
    error,
    createSearchString,
    markAsProcessed,
    deleteSearchString,
    toggleSearchStringFeature,
    selectedFile,
    setSelectedFile,
    refetch,
  };
};
