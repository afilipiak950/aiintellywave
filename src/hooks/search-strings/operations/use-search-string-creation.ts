
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
        console.error('User not authenticated for search string creation');
        throw new Error('User not authenticated');
      }

      if (!user.id) {
        console.error('Missing user ID in authenticated user', user);
        throw new Error('User ID is missing');
      }

      console.log('Creating search string with user ID:', user.id);
      
      // Add more detail about the actual insert operation
      const insertData = {
        user_id: user.id,
        company_id: user.company_id,
        type,
        input_source: inputSource,
        input_text: inputSource === 'text' ? inputText : undefined,
        input_url: inputSource === 'website' ? inputUrl : undefined,
        status: 'new',
        is_processed: false
      };
      
      console.log('Attempting to insert search string with data:', {
        ...insertData,
        input_text: inputSource === 'text' ? 'Text provided (not shown in logs)' : undefined
      });
      
      const { data: searchString, error: insertError } = await supabase
        .from('search_strings')
        .insert(insertData)
        .select()
        .single();
      
      if (insertError) {
        console.error('Error inserting search string:', insertError);
        // Add more diagnostic information about the error
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
      // Add more comprehensive error information
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
