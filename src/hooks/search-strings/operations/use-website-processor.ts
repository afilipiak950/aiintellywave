
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
          progress: 10
        })
        .eq('id', searchStringId);
      
      // Invoke the Edge Function to process the website
      const { error: functionError } = await supabase.functions.invoke('website-crawler', {
        body: { 
          url,
          type,
          search_string_id: searchStringId
        }
      });
      
      if (functionError) throw functionError;
      
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

  return {
    processWebsiteSearchString
  };
};
