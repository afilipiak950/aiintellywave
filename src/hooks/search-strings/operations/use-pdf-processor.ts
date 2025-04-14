
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const usePdfProcessor = () => {
  const processPdfSearchString = async (searchStringId: string, type: string, file: File) => {
    try {
      console.log('Processing PDF search string:', searchStringId);
      
      // First, upload the PDF file to storage
      const filePath = `search_strings/${searchStringId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('search_strings')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL for the file
      const { data: urlData } = supabase.storage
        .from('search_strings')
        .getPublicUrl(filePath);
      
      const fileUrl = urlData.publicUrl;
      
      // Update the search string with the file path
      await supabase
        .from('search_strings')
        .update({ 
          input_pdf_path: filePath,
          status: 'processing',
          progress: 10,
          error: null // Clear any previous errors
        })
        .eq('id', searchStringId);
      
      // Invoke the Edge Function to process the PDF
      const { error: functionError } = await supabase.functions.invoke('process-pdf', {
        body: { 
          pdf_path: filePath,
          search_string_id: searchStringId
        }
      });
      
      if (functionError) throw functionError;
      
      // Update progress to indicate processing has started
      await supabase
        .from('search_strings')
        .update({ progress: 20 })
        .eq('id', searchStringId);
      
      return true;
    } catch (error) {
      console.error('Error processing PDF search string:', error);
      
      // Update the search string with error information
      await supabase
        .from('search_strings')
        .update({ 
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error processing PDF search string',
          progress: 100
        })
        .eq('id', searchStringId);
      
      return false;
    }
  };

  const retryPdfSearchString = async (searchStringId: string) => {
    try {
      // First, get the current search string details
      const { data: searchString, error: fetchError } = await supabase
        .from('search_strings')
        .select('*')
        .eq('id', searchStringId)
        .single();
      
      if (fetchError) throw fetchError;
      
      if (!searchString.input_pdf_path) {
        // Create a more user-friendly error message
        throw new Error('The PDF file for this search string is no longer available. Please create a new search string with your PDF.');
      }
      
      // Update search string to processing status
      await supabase
        .from('search_strings')
        .update({ 
          status: 'processing',
          progress: 10,
          error: null
        })
        .eq('id', searchStringId);
      
      // Invoke the Edge Function to process the PDF
      const { error: functionError } = await supabase.functions.invoke('process-pdf', {
        body: { 
          pdf_path: searchString.input_pdf_path,
          search_string_id: searchStringId
        }
      });
      
      if (functionError) throw functionError;
      
      // Update progress to indicate processing has started
      await supabase
        .from('search_strings')
        .update({ progress: 20 })
        .eq('id', searchStringId);
      
      return true;
    } catch (error) {
      console.error('Error retrying PDF search string:', error);
      
      // Update the search string with error information
      await supabase
        .from('search_strings')
        .update({ 
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error retrying PDF search string',
          progress: 100
        })
        .eq('id', searchStringId);
      
      toast({
        title: 'Retry failed',
        description: error instanceof Error ? error.message : 'Unknown error retrying search string',
        variant: 'destructive',
      });
      
      return false;
    }
  };

  return {
    processPdfSearchString,
    retryPdfSearchString
  };
};
