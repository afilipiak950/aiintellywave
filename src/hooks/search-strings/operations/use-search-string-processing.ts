
import { SearchStringType, SearchStringSource } from '../search-string-types';
import { useTextProcessor } from './use-text-processor';
import { usePdfProcessor } from './use-pdf-processor';
import { useWebsiteProcessor } from './use-website-processor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useSearchStringProcessing = () => {
  const { processTextSearchString } = useTextProcessor();
  const { processPdfSearchString } = usePdfProcessor();
  const { processWebsiteSearchString } = useWebsiteProcessor();

  const processSearchStringBySource = async (
    searchString: any,
    inputSource: SearchStringSource,
    type: SearchStringType,
    inputText?: string,
    inputUrl?: string,
    pdfFile?: File | null
  ) => {
    try {
      console.log('Processing search string:', searchString.id, 'type:', type, 'source:', inputSource);
      
      if (inputSource === 'text' && inputText) {
        return await processTextSearchString(searchString.id, type, inputText);
      } else if (inputSource === 'website' && inputUrl) {
        return await processWebsiteSearchString(searchString.id, type, inputUrl);
      } else if (inputSource === 'pdf' && pdfFile) {
        return await processPdfSearchString(searchString.id, type, pdfFile);
      } else {
        const errorMessage = `Invalid input source or missing data for ${inputSource}`;
        console.error(errorMessage);
        
        await supabase
          .from('search_strings')
          .update({ 
            status: 'failed',
            error: errorMessage
          })
          .eq('id', searchString.id);
        
        return false;
      }
    } catch (error) {
      console.error('Error processing search string:', error);
      
      // Update search string with error
      await supabase
        .from('search_strings')
        .update({ 
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error during processing',
          progress: 100
        })
        .eq('id', searchString.id);
      
      return false;
    }
  };

  return {
    processSearchStringBySource
  };
};
