
import { supabase } from '@/integrations/supabase/client';
import { SearchStringType, SearchStringSource } from '../search-string-types';
import { useSearchStringProcessing } from './use-search-string-processing';

interface UseSearchStringCreationProps {
  fetchSearchStrings: () => Promise<void>;
}

export const useSearchStringCreation = ({ fetchSearchStrings }: UseSearchStringCreationProps) => {
  const { processSearchStringBySource } = useSearchStringProcessing();

  const createSearchString = async (
    user: any,
    type: SearchStringType,
    inputSource: SearchStringSource,
    inputText?: string,
    inputUrl?: string,
    pdfFile?: File | null
  ) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!user.id) {
        console.error('Missing user ID in authenticated user', user);
        throw new Error('User ID is missing');
      }

      console.log('Creating search string with user ID:', user.id);
      
      const { data: searchString, error: insertError } = await supabase
        .from('search_strings')
        .insert({
          user_id: user.id,
          company_id: user.company_id,
          type,
          input_source: inputSource,
          input_text: inputSource === 'text' ? inputText : undefined,
          input_url: inputSource === 'website' ? inputUrl : undefined,
          status: 'new',
          is_processed: false
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error inserting search string:', insertError);
        throw insertError;
      }
      
      console.log('Search string created:', searchString);
      
      await processSearchStringBySource(
        searchString,
        inputSource,
        type,
        inputText,
        inputUrl,
        pdfFile
      );
      
      await fetchSearchStrings();
      
      return true;
    } catch (error: any) {
      console.error('Error creating search string:', error);
      throw error;
    }
  };

  return {
    createSearchString
  };
};
