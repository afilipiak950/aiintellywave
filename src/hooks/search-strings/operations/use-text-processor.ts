
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useTextProcessor = () => {
  const processTextSearchString = async (searchStringId: string, type: string, inputText: string) => {
    try {
      console.log('Processing text search string:', searchStringId);
      
      // Update search string to processing status
      await supabase
        .from('search_strings')
        .update({ 
          status: 'processing',
          progress: 10
        })
        .eq('id', searchStringId);
      
      // Generate a search string based on the input text
      let generatedString = '';
      
      if (type === 'recruiting') {
        // For recruiting, create a Boolean search string that includes common resume terms
        generatedString = `${inputText} AND ("resume" OR "CV" OR "curriculum vitae")`;
      } else if (type === 'lead_generation') {
        // For lead generation, create a search string that includes common business terms
        generatedString = `${inputText} AND ("company" OR "business" OR "enterprise")`;
      } else {
        generatedString = inputText;
      }
      
      // Update the search string with the generated content and mark as completed
      const { error } = await supabase
        .from('search_strings')
        .update({ 
          generated_string: generatedString,
          status: 'completed',
          is_processed: true,
          processed_at: new Date().toISOString(),
          progress: 100
        })
        .eq('id', searchStringId);
      
      if (error) throw error;
      
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

  return {
    processTextSearchString
  };
};
