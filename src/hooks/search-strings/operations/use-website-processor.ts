
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useWebsiteProcessor = () => {
  const processWebsiteSearchString = async (searchStringId: string, type: string, url: string) => {
    try {
      console.log('Processing website search string:', searchStringId);
      
      // Update search string to processing status
      await supabase
        .from('search_strings')
        .update({ 
          status: 'processing',
          progress: 10,
          error: null  // Clear any previous errors
        })
        .eq('id', searchStringId);
      
      // Invoke the Edge Function to process the website
      const { data, error: functionError } = await supabase.functions.invoke('website-crawler', {
        body: { 
          url,
          type,
          search_string_id: searchStringId
        }
      });
      
      if (functionError) {
        console.error('Edge function error:', functionError);
        throw new Error(`Edge Function error: ${functionError.message || 'Unknown error'}`);
      }
      
      if (data && !data.success) {
        console.error('Edge function returned an error:', data.error);
        throw new Error(`Edge Function returned an error: ${data.error || 'Unknown error'}`);
      }
      
      // Update progress to indicate processing has started
      await supabase
        .from('search_strings')
        .update({ progress: 20 })
        .eq('id', searchStringId);
      
      // For now, we'll return success since the Edge Function will handle the rest
      return true;
    } catch (error) {
      console.error('Error processing website search string:', error);
      
      // Update the search string with error information
      await supabase
        .from('search_strings')
        .update({ 
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error processing website search string',
          progress: 100
        })
        .eq('id', searchStringId);
      
      return false;
    }
  };

  const retryWebsiteSearchString = async (searchStringId: string) => {
    try {
      // First, get the current search string details
      const { data: searchString, error: fetchError } = await supabase
        .from('search_strings')
        .select('*')
        .eq('id', searchStringId)
        .single();
      
      if (fetchError) throw fetchError;
      
      if (!searchString.input_url) {
        throw new Error('Cannot retry: No URL found for this search string');
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
      return await processWebsiteSearchString(
        searchStringId, 
        searchString.type, 
        searchString.input_url
      );
    } catch (error) {
      console.error('Error retrying website search string:', error);
      toast({
        title: 'Retry failed',
        description: error instanceof Error ? error.message : 'Unknown error retrying search string',
        variant: 'destructive',
      });
      
      // Make sure to update the status to failed if the retry fails
      await supabase
        .from('search_strings')
        .update({ 
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error retrying search string',
          progress: 100
        })
        .eq('id', searchStringId);
      
      return false;
    }
  };

  return {
    processWebsiteSearchString,
    retryWebsiteSearchString
  };
};
