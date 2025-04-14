
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const usePdfProcessor = () => {
  const processPdfSearchString = async (searchStringId: string, type: string, pdfFile: File) => {
    try {
      console.log('Processing PDF search string:', searchStringId);
      
      // Update search string to processing status
      await supabase
        .from('search_strings')
        .update({ 
          status: 'processing',
          progress: 10
        })
        .eq('id', searchStringId);
      
      // Upload the PDF to Supabase Storage
      const fileExt = pdfFile.name.split('.').pop();
      const fileName = `${searchStringId}.${fileExt}`;
      const filePath = `search-strings/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('pdf-uploads')
        .upload(filePath, pdfFile);
      
      if (uploadError) throw uploadError;
      
      // Update the path in the database
      await supabase
        .from('search_strings')
        .update({ 
          input_pdf_path: filePath,
          progress: 30
        })
        .eq('id', searchStringId);
      
      // Now invoke the Edge Function to process the PDF
      const { error: functionError } = await supabase.functions.invoke('process-pdf', {
        body: { 
          search_string_id: searchStringId,
          file_path: filePath,
          type
        }
      });
      
      if (functionError) throw functionError;
      
      // Update progress to indicate processing has started
      await supabase
        .from('search_strings')
        .update({ progress: 50 })
        .eq('id', searchStringId);
      
      // For now, we'll return success since the Edge Function will handle the rest
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

  return {
    processPdfSearchString
  };
};
