
import { supabase } from '@/integrations/supabase/client';
import { SearchStringType, SearchStringSource, SearchStringStatus } from '../search-string-types';
import { useSearchStringPreview } from './use-search-string-preview';
import { useToast } from '@/hooks/use-toast';
import { updateSearchStringStatus } from './use-search-string-status';
import { processPdfSearchString } from './use-pdf-processor';
import { processWebsiteSearchString } from './use-website-processor';
import { processTextSearchString } from './use-text-processor';
import { useCancelSearchString } from './use-cancel-search-string';

export const useSearchStringProcessing = () => {
  const { generatePreview } = useSearchStringPreview();
  const { toast } = useToast();
  const { cancelSearchString } = useCancelSearchString();

  const processSearchStringBySource = async (
    searchString: any,
    inputSource: SearchStringSource,
    type: SearchStringType,
    inputText?: string,
    inputUrl?: string,
    pdfFile?: File | null
  ) => {
    try {
      // First, update the search string to processing status with 0 progress
      await updateSearchStringStatus(searchString.id, 'processing', 0);
      
      console.log(`Processing search string: ${searchString.id}, type: ${type}, source: ${inputSource}`);
      
      if (inputSource === 'pdf' && pdfFile) {
        return await processPdfSearchString(searchString, pdfFile);
      } else if (inputSource === 'website' && inputUrl) {
        return await processWebsiteSearchString(searchString, type, inputUrl, generatePreview);
      } else if (inputSource === 'text' && inputText) {
        return await processTextSearchString(searchString, type, inputText, generatePreview);
      } else {
        // Invalid combination of input source and data
        const errorMessage = 'Invalid input source or missing required data';
        await updateSearchStringStatus(searchString.id, 'failed', null, errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      // Update the status to failed if any error occurs
      console.error('Error processing search string:', error);
      
      await updateSearchStringStatus(
        searchString.id, 
        'failed', 
        null, 
        `Processing error: ${error.message || 'Unknown error occurred'}`
      );
      
      throw error;
    }
  };

  return {
    processSearchStringBySource,
    cancelSearchString
  };
};
