import { supabase } from '@/integrations/supabase/client';
import { SearchStringType, SearchStringSource, SearchStringStatus } from '../search-string-types';
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
        console.error('User not authenticated for search string creation');
        throw new Error('User not authenticated');
      }

      if (!user.id) {
        console.error('Missing user ID in authenticated user', user);
        throw new Error('User ID is missing');
      }

      console.log('Creating search string with user_id:', user.id);
      console.log('Company ID for search string:', user.company_id);
      console.log('Search string data:', {
        user_id: user.id,
        company_id: user.company_id,
        type,
        input_source: inputSource,
        input_text: inputSource === 'text' ? inputText : undefined,
        input_url: inputSource === 'website' ? inputUrl : undefined,
        status: 'new' as SearchStringStatus, // Explicitly cast to ensure type safety
        is_processed: false
      });
      
      const { data: searchString, error: insertError } = await supabase
        .from('search_strings')
        .insert({
          user_id: user.id,
          company_id: user.company_id,
          type,
          input_source: inputSource,
          input_text: inputSource === 'text' ? inputText : undefined,
          input_url: inputSource === 'website' ? inputUrl : undefined,
          status: 'new' as SearchStringStatus, // Explicitly cast to ensure type safety
          is_processed: false
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error inserting search string:', insertError);
        console.error('Error details:', {
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
          message: insertError.message
        });
        throw insertError;
      }
      
      console.log('Search string created successfully:', {
        id: searchString.id,
        status: searchString.status,
        type: searchString.type,
        source: searchString.input_source,
        userId: searchString.user_id,
        companyId: searchString.company_id
      });
      
      await processSearchStringBySource(
        searchString,
        inputSource,
        type,
        inputText,
        inputUrl,
        pdfFile
      );
      
      await fetchSearchStrings();
      
      return searchString;
    } catch (error: any) {
      console.error('Error creating search string:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack
      });
      throw error;
    }
  };

  return {
    createSearchString
  };
};
