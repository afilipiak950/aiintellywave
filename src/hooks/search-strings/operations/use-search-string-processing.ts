
import { supabase } from '@/integrations/supabase/client';
import { SearchStringType, SearchStringSource } from '../search-string-types';
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
    if (inputSource === 'pdf' && pdfFile) {
      const filePath = `search-strings/${searchString.user_id}/${searchString.id}/${pdfFile.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, pdfFile);
      
      if (uploadError) {
        console.error('Error uploading PDF:', uploadError);
        throw uploadError;
      }
      
      const { error: updateError } = await supabase
        .from('search_strings')
        .update({ 
          input_pdf_path: filePath, 
          status: 'processing' 
        })
        .eq('id', searchString.id);
      
      if (updateError) {
        console.error('Error updating search string with PDF path:', updateError);
        throw updateError;
      }
      
      try {
        const { error: functionError } = await supabase.functions
          .invoke('process-pdf', { 
            body: { 
              search_string_id: searchString.id,
              pdf_path: filePath
            }
          });
        
        if (functionError) {
          console.error('Error calling process-pdf function:', functionError);
        }
      } catch (functionErr) {
        console.error('Error calling process-pdf function:', functionErr);
      }
    } else {
      const { error: updateError } = await supabase
        .from('search_strings')
        .update({ 
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', searchString.id);
      
      if (updateError) {
        console.error('Error updating search string status:', updateError);
        throw updateError;
      }
      
      try {
        await supabase.functions
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
      } catch (functionErr) {
        console.error('Error calling generate-search-string function:', functionErr);
        
        const generatedString = await generatePreview(type, inputSource, inputText, inputUrl, pdfFile);
        
        await supabase
          .from('search_strings')
          .update({ 
            generated_string: generatedString,
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', searchString.id);
      }
    }
  };

  return {
    processSearchStringBySource
  };
};
