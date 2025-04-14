
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
          text,
          type,
          search_string_id: searchStringId
        }
      });
      
      if (functionError) throw functionError;
      
      // Update the search string with the generated string
      await supabase
        .from('search_strings')
        .update({ 
          generated_string: data.generatedString,
          status: 'completed',
          progress: 100,
          processed_at: new Date().toISOString(),
          is_processed: true
        })
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
      
      // Process the search string again with the same parameters
      return await processTextSearchString(
        searchStringId, 
        searchString.type, 
        searchString.input_text
      );
    } catch (error) {
      console.error('Error retrying text search string:', error);
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
