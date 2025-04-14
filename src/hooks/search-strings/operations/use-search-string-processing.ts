
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
      // First, update the search string to processing status without using progress field
      const { error: updateError } = await supabase
        .from('search_strings')
        .update({ 
          status: 'processing' as SearchStringStatus,
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
            input_pdf_path: filePath
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
      } else if (inputSource === 'website' && inputUrl) {
        try {
          // Enhance website scraping with timeout handling and better error reporting
          console.log('Scraping website:', inputUrl);
          
          // First call the website-scraper function to get the raw content
          const { data: scrapedData, error: scrapingError } = await supabase.functions
            .invoke('website-scraper', { 
              body: { 
                url: inputUrl 
              }
            });
          
          if (scrapingError || !scrapedData?.success) {
            console.error('Error scraping website:', scrapingError || (scrapedData?.error || 'Unknown error'));
            throw new Error(scrapingError || (scrapedData?.error || 'Error scraping website content'));
          }
          
          console.log('Successfully scraped website, extracted text length:', scrapedData.text?.length);
          
          // Now call generate-search-string with the extracted content
          const { error: functionError } = await supabase.functions
            .invoke('generate-search-string', { 
              body: { 
                search_string_id: searchString.id,
                type,
                input_source: inputSource,
                input_url: inputUrl,
                input_text: scrapedData.text, // Pass the scraped text directly
                user_id: searchString.user_id
              }
            });
          
          if (functionError) {
            console.error('Error calling generate-search-string function:', functionError);
            throw functionError;
          }
        } catch (functionErr) {
          console.error('Error in website scraping process:', functionErr);
          
          // Update the status to failed
          await supabase
            .from('search_strings')
            .update({ 
              status: 'failed' as SearchStringStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', searchString.id);
            
          throw functionErr;
        }
      } else if (inputSource === 'text' && inputText) {
        try {
          // Call the generate-search-string function directly for text input
          console.log('Calling generate-search-string function with text input');
          const { error: functionError } = await supabase.functions
            .invoke('generate-search-string', { 
              body: { 
                search_string_id: searchString.id,
                type,
                input_text: inputText,
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
          
          // Update the status to failed
          await supabase
            .from('search_strings')
            .update({ 
              status: 'failed' as SearchStringStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', searchString.id);
            
          // Fallback to client-side generation if the function fails
          console.log('Using fallback client-side generation');
          try {
            const generatedString = await generatePreview(type, inputSource, inputText, inputUrl, pdfFile);
            
            await supabase
              .from('search_strings')
              .update({ 
                generated_string: generatedString,
                status: 'completed' as SearchStringStatus,
                updated_at: new Date().toISOString()
              })
              .eq('id', searchString.id);
          } catch (fallbackError) {
            console.error('Fallback generation failed:', fallbackError);
            throw fallbackError;
          }
        }
      } else {
        // Invalid combination of input source and data
        throw new Error('Invalid input source or missing required data');
      }
    } catch (error) {
      // Update the status to failed if any error occurs
      console.error('Error processing search string:', error);
      
      await supabase
        .from('search_strings')
        .update({ 
          status: 'failed' as SearchStringStatus,
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
