
import { supabase } from '@/integrations/supabase/client';
import { SearchStringType } from '../search-string-types';
import { updateSearchStringStatus } from './use-search-string-status';
import { useToast } from '@/hooks/use-toast';

/**
 * Handle processing of text-source search strings
 */
export const processTextSearchString = async (
  searchString: any,
  type: SearchStringType,
  inputText: string,
  generateFallbackPreview: (type: SearchStringType, inputSource: 'text', inputText?: string, inputUrl?: string, pdfFile?: File | null) => Promise<string>
) => {
  const { toast } = useToast();
  
  try {
    // Update progress to show we're starting
    await updateSearchStringStatus(searchString.id, 'processing', 20);
    
    // Call the generate-search-string function directly for text input
    console.log('Calling generate-search-string function with text input');
    const { data: generatedData, error: functionError } = await supabase.functions
      .invoke('generate-search-string', { 
        body: { 
          search_string_id: searchString.id,
          type,
          input_text: inputText,
          input_source: 'text',
          user_id: searchString.user_id
        }
      });
    
    // Update progress to show we're almost done
    await updateSearchStringStatus(searchString.id, 'processing', 80);
    
    if (functionError) {
      console.error('Error calling generate-search-string function:', functionError);
      await updateSearchStringStatus(searchString.id, 'failed', null, `Generation failed: ${functionError.message}`);
      throw functionError;
    }
    
    // Check if we received a generated string
    if (!generatedData?.generated_string) {
      await updateSearchStringStatus(
        searchString.id, 
        'completed', 
        100, 
        'No search string was generated. The input text may not contain enough relevant information.'
      );
      return true;
    } else {
      // If successful, update with the generated string
      const { error: updateError } = await supabase
        .from('search_strings')
        .update({ 
          generated_string: generatedData.generated_string,
          status: 'completed',
          progress: 100,
          updated_at: new Date().toISOString(),
          error: null
        })
        .eq('id', searchString.id);
      
      if (updateError) {
        console.error('Error updating search string with generated content:', updateError);
        await updateSearchStringStatus(searchString.id, 'failed', null, `Update error: ${updateError.message}`);
        return false;
      }
      return true;
    }
  } catch (functionErr: any) {
    console.error('Error calling generate-search-string function:', functionErr);
    
    // Fallback to client-side generation if the function fails
    console.log('Using fallback client-side generation');
    try {
      const generatedString = await generateFallbackPreview(type, 'text', inputText, undefined, null);
      
      await supabase
        .from('search_strings')
        .update({ 
          generated_string: generatedString,
          status: 'completed',
          progress: 100,
          updated_at: new Date().toISOString(),
          error: null
        })
        .eq('id', searchString.id);
        
      toast({
        title: "Generated with fallback method",
        description: "The server-side process failed, but we generated a basic search string for you.",
      });
      return true;
    } catch (fallbackError: any) {
      console.error('Fallback generation failed:', fallbackError);
      await updateSearchStringStatus(searchString.id, 'failed', null, `All generation methods failed: ${fallbackError.message}`);
      throw fallbackError;
    }
  }
};
