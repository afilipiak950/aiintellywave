
import { supabase } from '@/integrations/supabase/client';
import { SearchStringType } from '../search-string-types';
import { updateSearchStringStatus } from './use-search-string-status';
import { useToast } from '@/hooks/use-toast';

/**
 * Handle processing of website-source search strings
 */
export const processWebsiteSearchString = async (
  searchString: any,
  type: SearchStringType,
  inputUrl: string,
  generateFallbackPreview: (type: SearchStringType, inputSource: 'website', inputText?: string, inputUrl?: string, pdfFile?: File | null) => Promise<string>
) => {
  const { toast } = useToast();
  
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
      return false;
    }
    
    // Update progress to show we're generating the search string
    await updateSearchStringStatus(searchString.id, 'processing', 60);
    
    // Now call generate-search-string with the extracted content
    const { data: generatedData, error: functionError } = await supabase.functions
      .invoke('generate-search-string', { 
        body: { 
          search_string_id: searchString.id,
          type,
          input_source: 'website',
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
    console.error('Error in website scraping process:', functionErr);
    
    // Fallback to client-side generation if the function fails
    console.log('Using fallback client-side generation');
    try {
      const generatedString = await generateFallbackPreview(type, 'website', undefined, inputUrl, null);
      
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
