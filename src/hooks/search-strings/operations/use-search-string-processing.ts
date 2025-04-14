
import { supabase } from '@/integrations/supabase/client';
import { SearchStringType, SearchStringSource, SearchStringStatus } from '../search-string-types';
import { useSearchStringPreview } from './use-search-string-preview';
import { useToast } from '@/hooks/use-toast';

export const useSearchStringProcessing = () => {
  const { generatePreview } = useSearchStringPreview();
  const { toast } = useToast();

  // Helper function to update search string status with progress
  const updateSearchStringStatus = async (
    id: string, 
    status: SearchStringStatus, 
    progress?: number | null,
    error?: string
  ) => {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (progress !== undefined) {
        updateData.progress = progress;
      }
      
      if (error) {
        updateData.error = error;
      }
      
      const { error: updateError } = await supabase
        .from('search_strings')
        .update(updateData)
        .eq('id', id);
      
      if (updateError) {
        console.error('Error updating search string status:', updateError);
        throw updateError;
      }
      
      return true;
    } catch (err) {
      console.error('Failed to update search string status:', err);
      return false;
    }
  };

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
        const filePath = `search-strings/${searchString.user_id}/${searchString.id}/${pdfFile.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(filePath, pdfFile);
        
        if (uploadError) {
          console.error('Error uploading PDF:', uploadError);
          await updateSearchStringStatus(searchString.id, 'failed', null, `PDF upload failed: ${uploadError.message}`);
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
          await updateSearchStringStatus(searchString.id, 'failed', null, `Update error: ${updatePdfError.message}`);
          throw updatePdfError;
        }
        
        try {
          // Update progress to show we're sending the PDF
          await updateSearchStringStatus(searchString.id, 'processing', 20);
          
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
            await updateSearchStringStatus(searchString.id, 'failed', null, `PDF processing failed: ${functionError.message}`);
            throw functionError;
          }
          
          // Update progress to show we've sent it for processing
          await updateSearchStringStatus(searchString.id, 'processing', 40);
        } catch (functionErr: any) {
          console.error('Error calling process-pdf function:', functionErr);
          await updateSearchStringStatus(searchString.id, 'failed', null, `PDF processing error: ${functionErr.message}`);
          throw functionErr;
        }
      } else if (inputSource === 'website' && inputUrl) {
        try {
          // Update progress to show we're starting to scrape
          await updateSearchStringStatus(searchString.id, 'processing', 10);
          
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
            await updateSearchStringStatus(
              searchString.id, 
              'failed', 
              null, 
              `Website scraping failed: ${scrapingError?.message || scrapedData?.error || 'Failed to extract content from website'}`
            );
            throw new Error(scrapingError?.message || (scrapedData?.error || 'Error scraping website content'));
          }
          
          console.log('Successfully scraped website, extracted text length:', scrapedData.text?.length);
          
          // Update progress to show we've completed scraping
          await updateSearchStringStatus(searchString.id, 'processing', 40);
          
          if (!scrapedData.text || scrapedData.text.length < 50) {
            await updateSearchStringStatus(
              searchString.id, 
              'failed', 
              null, 
              'Insufficient content extracted from website. Please try a different URL with more content.'
            );
            return;
          }
          
          // Update progress to show we're generating the search string
          await updateSearchStringStatus(searchString.id, 'processing', 60);
          
          // Now call generate-search-string with the extracted content
          const { data: generatedData, error: functionError } = await supabase.functions
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
              'No search string was generated. The website may not contain enough relevant information.'
            );
          } else {
            // If successful, update with the generated string
            const { error: updateError } = await supabase
              .from('search_strings')
              .update({ 
                generated_string: generatedData.generated_string,
                status: 'completed' as SearchStringStatus,
                progress: 100,
                updated_at: new Date().toISOString(),
                error: null
              })
              .eq('id', searchString.id);
            
            if (updateError) {
              console.error('Error updating search string with generated content:', updateError);
              await updateSearchStringStatus(searchString.id, 'failed', null, `Update error: ${updateError.message}`);
            }
          }
        } catch (functionErr: any) {
          console.error('Error in website scraping process:', functionErr);
          
          // Fallback to client-side generation if the function fails
          console.log('Using fallback client-side generation');
          try {
            const generatedString = await generatePreview(type, inputSource, inputText, inputUrl, pdfFile);
            
            await supabase
              .from('search_strings')
              .update({ 
                generated_string: generatedString,
                status: 'completed' as SearchStringStatus,
                progress: 100,
                updated_at: new Date().toISOString(),
                error: null
              })
              .eq('id', searchString.id);
              
            toast({
              title: "Generated with fallback method",
              description: "The server-side process failed, but we generated a basic search string for you.",
            });
          } catch (fallbackError: any) {
            console.error('Fallback generation failed:', fallbackError);
            await updateSearchStringStatus(searchString.id, 'failed', null, `All generation methods failed: ${fallbackError.message}`);
            throw fallbackError;
          }
        }
      } else if (inputSource === 'text' && inputText) {
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
                input_source: inputSource,
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
          } else {
            // If successful, update with the generated string
            const { error: updateError } = await supabase
              .from('search_strings')
              .update({ 
                generated_string: generatedData.generated_string,
                status: 'completed' as SearchStringStatus,
                progress: 100,
                updated_at: new Date().toISOString(),
                error: null
              })
              .eq('id', searchString.id);
            
            if (updateError) {
              console.error('Error updating search string with generated content:', updateError);
              await updateSearchStringStatus(searchString.id, 'failed', null, `Update error: ${updateError.message}`);
            }
          }
        } catch (functionErr: any) {
          console.error('Error calling generate-search-string function:', functionErr);
          
          // Fallback to client-side generation if the function fails
          console.log('Using fallback client-side generation');
          try {
            const generatedString = await generatePreview(type, inputSource, inputText, inputUrl, pdfFile);
            
            await supabase
              .from('search_strings')
              .update({ 
                generated_string: generatedString,
                status: 'completed' as SearchStringStatus,
                progress: 100,
                updated_at: new Date().toISOString(),
                error: null
              })
              .eq('id', searchString.id);
              
            toast({
              title: "Generated with fallback method",
              description: "The server-side process failed, but we generated a basic search string for you.",
            });
          } catch (fallbackError: any) {
            console.error('Fallback generation failed:', fallbackError);
            await updateSearchStringStatus(searchString.id, 'failed', null, `All generation methods failed: ${fallbackError.message}`);
            throw fallbackError;
          }
        }
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

  const cancelSearchString = async (id: string) => {
    try {
      const { error } = await supabase
        .from('search_strings')
        .update({ 
          status: 'canceled' as SearchStringStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error canceling search string:', error);
      return false;
    }
  };

  return {
    processSearchStringBySource,
    cancelSearchString
  };
};
