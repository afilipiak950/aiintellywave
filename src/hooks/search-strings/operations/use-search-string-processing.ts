
import { supabase } from '@/integrations/supabase/client';
import { SearchStringType, SearchStringSource, SearchStringStatus } from '../search-string-types';
import { useSearchStringPreview } from './use-search-string-preview';

export const useSearchStringProcessing = () => {
  const { generatePreview } = useSearchStringPreview();

  const processSearchStringBySource = async (
    searchString: any,
    inputSource: SearchStringSource,
    type: SearchStringType,
    inputText?: string,
    inputUrl?: string,
    pdfFile?: File | null
  ) => {
    try {
      // First, update the search string to processing status
      const { error: updateError } = await supabase
        .from('search_strings')
        .update({ 
          status: 'processing' as SearchStringStatus,
          progress: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', searchString.id);
      
      if (updateError) {
        console.error('Error updating search string status:', updateError);
        throw updateError;
      }

      if (inputSource === 'pdf' && pdfFile) {
        const filePath = `search-strings/${searchString.user_id}/${searchString.id}/${pdfFile.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(filePath, pdfFile);
        
        if (uploadError) {
          console.error('Error uploading PDF:', uploadError);
          throw uploadError;
        }
        
        const { error: updatePdfError } = await supabase
          .from('search_strings')
          .update({ 
            input_pdf_path: filePath, 
            progress: 20
          })
          .eq('id', searchString.id);
        
        if (updatePdfError) {
          console.error('Error updating search string with PDF path:', updatePdfError);
          throw updatePdfError;
        }
        
        try {
          // Use the PDF processing edge function
          console.log('Calling process-pdf function with path:', filePath);
          const { error: functionError } = await supabase.functions
            .invoke('process-pdf', { 
              body: { 
                search_string_id: searchString.id,
                pdf_path: filePath
              }
            });
          
          if (functionError) {
            console.error('Error calling process-pdf function:', functionError);
            throw functionError;
          }
        } catch (functionErr) {
          console.error('Error calling process-pdf function:', functionErr);
          throw functionErr;
        }
      } else {
        try {
          // Call the generate-search-string function directly
          console.log('Calling generate-search-string function');
          const { error: functionError } = await supabase.functions
            .invoke('generate-search-string', { 
              body: { 
                search_string_id: searchString.id,
                type,
                input_text: inputText,
                input_url: inputUrl,
                input_source: inputSource,
                user_id: searchString.user_id
              }
            });
          
          if (functionError) {
            console.error('Error calling generate-search-string function:', functionError);
            throw functionError;
          }
        } catch (functionErr) {
          console.error('Error calling generate-search-string function:', functionErr);
          
          // Fallback to client-side generation if the function fails
          console.log('Using fallback client-side generation');
          const generatedString = await generatePreview(type, inputSource, inputText, inputUrl, pdfFile);
          
          await supabase
            .from('search_strings')
            .update({ 
              generated_string: generatedString,
              status: 'completed' as SearchStringStatus,
              progress: 100,
              updated_at: new Date().toISOString()
            })
            .eq('id', searchString.id);
        }
      }
    } catch (error) {
      // Update the status to failed if any error occurs
      console.error('Error processing search string:', error);
      
      await supabase
        .from('search_strings')
        .update({ 
          status: 'failed' as SearchStringStatus,
          progress: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', searchString.id);
        
      throw error;
    }
  };

  return {
    processSearchStringBySource
  };
};
