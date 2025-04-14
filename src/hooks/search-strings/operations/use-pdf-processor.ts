
import { supabase } from '@/integrations/supabase/client';
import { SearchStringType } from '../search-string-types';
import { updateSearchStringStatus } from './use-search-string-status';

/**
 * Handle processing of PDF-source search strings
 */
export const processPdfSearchString = async (
  searchString: any,
  pdfFile: File | null
) => {
  if (!pdfFile) {
    return await updateSearchStringStatus(
      searchString.id, 
      'failed', 
      null, 
      'PDF file is required but was not provided'
    );
  }

  // Update to processing status
  await updateSearchStringStatus(searchString.id, 'processing', 0);
  
  const filePath = `search-strings/${searchString.user_id}/${searchString.id}/${pdfFile.name}`;
  
  const { error: uploadError } = await supabase.storage
    .from('uploads')
    .upload(filePath, pdfFile);
  
  if (uploadError) {
    console.error('Error uploading PDF:', uploadError);
    await updateSearchStringStatus(
      searchString.id, 
      'failed', 
      null, 
      `PDF upload failed: ${uploadError.message}`
    );
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
    await updateSearchStringStatus(
      searchString.id, 
      'failed', 
      null, 
      `Update error: ${updatePdfError.message}`
    );
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
      await updateSearchStringStatus(
        searchString.id, 
        'failed', 
        null, 
        `PDF processing failed: ${functionError.message}`
      );
      throw functionError;
    }
    
    // Update progress to show we've sent it for processing
    await updateSearchStringStatus(searchString.id, 'processing', 40);
    return true;
  } catch (functionErr: any) {
    console.error('Error calling process-pdf function:', functionErr);
    await updateSearchStringStatus(
      searchString.id, 
      'failed', 
      null, 
      `PDF processing error: ${functionErr.message}`
    );
    throw functionErr;
  }
};
