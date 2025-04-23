
import { supabase } from '@/integrations/supabase/client';
import { SearchStringType, SearchStringSource, SearchStringStatus } from '../search-string-types';
import { useSearchStringProcessing } from './use-search-string-processing';
import { toast } from '@/hooks/use-toast';

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
      });
      
      // Try direct insertion first
      let searchString;
      let insertError;
      
      try {
        const response = await supabase
          .from('search_strings')
          .insert({
            user_id: user.id,
            company_id: user.company_id,
            type,
            input_source: inputSource,
            input_text: inputSource === 'text' ? inputText : undefined,
            input_url: inputSource === 'website' ? inputUrl : undefined,
            status: 'new' as SearchStringStatus,
            is_processed: false,
            progress: 0
          })
          .select()
          .single();
          
        searchString = response.data;
        insertError = response.error;
      } catch (directError) {
        console.error('Error with direct insertion:', directError);
        insertError = directError;
      }
      
      // If direct insertion fails, try using the edge function
      if (insertError || !searchString) {
        console.log('Direct insertion failed, trying edge function...');
        
        try {
          const { data, error } = await supabase.functions.invoke('create-search-string', {
            body: {
              user_id: user.id,
              company_id: user.company_id,
              type,
              input_source: inputSource,
              input_text: inputSource === 'text' ? inputText : undefined,
              input_url: inputSource === 'website' ? inputUrl : undefined
            }
          });
          
          if (error) {
            console.error('Edge function error:', error);
            throw error;
          }
          
          if (data && data.searchString) {
            console.log('Successfully created search string via edge function:', data.searchString);
            searchString = data.searchString;
          } else {
            throw new Error('No search string returned from edge function');
          }
        } catch (edgeFunctionError) {
          console.error('Edge function approach failed:', edgeFunctionError);
          throw edgeFunctionError;
        }
      }
      
      if (!searchString) {
        throw new Error('Failed to create search string through any method');
      }
      
      console.log('Search string created successfully:', {
        id: searchString.id,
        status: searchString.status,
        type: searchString.type,
        source: searchString.input_source,
        userId: searchString.user_id,
        companyId: searchString.company_id
      });
      
      // Process the search string based on its source
      try {
        await processSearchStringBySource(
          searchString,
          inputSource,
          type,
          inputText,
          inputUrl,
          pdfFile
        );
      } catch (processingError) {
        console.error('Error processing search string:', processingError);
        // We don't throw here as the search string was created, just the processing failed
        toast({
          title: "Warning",
          description: "Search string was created but processing failed. You can retry processing later.",
          variant: "warning"
        });
      }
      
      // Refresh the search strings list
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
