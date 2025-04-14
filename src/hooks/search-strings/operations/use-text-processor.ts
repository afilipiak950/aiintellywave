
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useTextProcessor = () => {
  const processTextSearchString = async (searchStringId: string, type: string, text: string) => {
    try {
      console.log('Processing text search string:', searchStringId);
      
      // Update search string to processing status
      await supabase
        .from('search_strings')
        .update({ 
          status: 'processing',
          progress: 10,
          error: null // Clear any previous errors
        })
        .eq('id', searchStringId);
      
      // Invoke the Edge Function to process the text
      const { data, error: functionError } = await supabase.functions.invoke('generate-search-string', {
        body: { 
          search_string_id: searchStringId,
          type,
          input_text: text,
          input_source: 'text'
        }
      });
      
      if (functionError) {
        console.error('Edge function error:', functionError);
        throw new Error(`Edge Function error: ${functionError.message || 'Unknown error'}`);
      }
      
      if (!data || data.error) {
        console.error('Edge function returned an error:', data?.error || 'No data returned');
        throw new Error(data?.error || 'Unknown error during text processing');
      }
      
      // Update progress to indicate processing has started
      await supabase
        .from('search_strings')
        .update({ progress: 50 })
        .eq('id', searchStringId);
      
      return true;
    } catch (error) {
      console.error('Error processing text search string:', error);
      
      // Update the search string with error information
      await supabase
        .from('search_strings')
        .update({ 
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error processing text search string',
          progress: 100
        })
        .eq('id', searchStringId);
      
      return false;
    }
  };

  const retryTextSearchString = async (searchStringId: string) => {
    try {
      // First, get the current search string details
      const { data: searchString, error: fetchError } = await supabase
        .from('search_strings')
        .select('*')
        .eq('id', searchStringId)
        .single();
      
      if (fetchError) throw fetchError;
      
      if (!searchString.input_text) {
        throw new Error('Cannot retry: No text found for this search string');
      }
      
      // Clear previous error and reset status
      await supabase
        .from('search_strings')
        .update({ 
          status: 'processing',
          error: null,
          progress: 5
        })
        .eq('id', searchStringId);
      
      // Process the search string again with the same parameters
      return await processTextSearchString(
        searchStringId, 
        searchString.type, 
        searchString.input_text
      );
    } catch (error) {
      console.error('Error retrying text search string:', error);
      
      // Update the search string with error information
      await supabase
        .from('search_strings')
        .update({ 
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error retrying search string',
          progress: 100
        })
        .eq('id', searchStringId);
      
      toast({
        title: 'Retry failed',
        description: error instanceof Error ? error.message : 'Unknown error retrying search string',
        variant: 'destructive',
      });
      
      return false;
    }
  };

  return {
    processTextSearchString,
    retryTextSearchString
  };
};
