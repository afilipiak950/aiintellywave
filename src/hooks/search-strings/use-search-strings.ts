
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth';

export type SearchStringType = 'recruiting' | 'lead_generation';
export type SearchStringSource = 'text' | 'website' | 'pdf';
export type SearchStringStatus = 'new' | 'processing' | 'completed' | 'failed';

export interface SearchString {
  id: string;
  company_id: string;
  user_id: string;
  type: SearchStringType;
  input_text?: string;
  input_url?: string;
  input_pdf_path?: string;
  input_source: SearchStringSource;
  generated_string?: string;
  status: SearchStringStatus;
  is_processed: boolean;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  processed_by?: string;
}

interface UseSearchStringsProps {
  companyId?: string;
}

export const useSearchStrings = (props?: UseSearchStringsProps) => {
  const { companyId } = props || {};
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchStrings, setSearchStrings] = useState<SearchString[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewString, setPreviewString] = useState<string | null>(null);

  // Fetch search strings
  const fetchSearchStrings = useCallback(async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('search_strings')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Only filter by company_id if it exists
      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setSearchStrings(data as SearchString[]);
    } catch (error) {
      console.error('Error fetching search strings:', error);
      toast({
        title: 'Failed to load search strings',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [companyId, toast]);

  // Generate a preview of the search string
  const generatePreview = async (
    type: SearchStringType,
    inputSource: SearchStringSource,
    inputText?: string,
    inputUrl?: string,
    pdfFile?: File | null
  ): Promise<string> => {
    try {
      // In a real implementation, this would call the OpenAI API
      // For now, we'll return a mock preview
      
      let prompt = '';
      
      if (inputSource === 'text' && inputText) {
        // Extract key terms from input text
        const keywords = inputText.split(/\s+/).filter(word => word.length > 3).slice(0, 5);
        prompt = `(${keywords.join(' OR ')}) AND "${type === 'recruiting' ? 'resume' : 'business'}"`;
      } else if (inputSource === 'website' && inputUrl) {
        // Use the domain for website input
        const domain = new URL(inputUrl).hostname.replace('www.', '');
        prompt = `site:linkedin.com "${domain}" AND ${type === 'recruiting' ? '"hiring" OR "job"' : '"business" OR "service"'}`;
      } else if (inputSource === 'pdf' && pdfFile) {
        // Use the filename for PDF input
        prompt = `filetype:pdf "${pdfFile.name.split('.')[0]}" AND ${type === 'recruiting' ? '"resume" OR "CV"' : '"proposal" OR "offer"'}`;
      }
      
      // In a real implementation, we would process this through OpenAI
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(prompt);
        }, 1000);
      });
    } catch (error) {
      console.error('Error generating preview:', error);
      throw new Error('Failed to generate preview');
    }
  };

  // Create a new search string
  const createSearchString = async (
    type: SearchStringType,
    inputSource: SearchStringSource,
    inputText?: string,
    inputUrl?: string,
    pdfFile?: File | null
  ) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if we have a companyId, if not use a fallback
      const effectiveCompanyId = companyId || 'demo-company-id';
      
      // Initial search string record
      const { data: searchString, error: insertError } = await supabase
        .from('search_strings')
        .insert({
          company_id: effectiveCompanyId,
          user_id: user.id,
          type,
          input_source: inputSource,
          input_text: inputSource === 'text' ? inputText : undefined,
          input_url: inputSource === 'website' ? inputUrl : undefined,
          status: 'new',
          is_processed: false
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // If PDF, upload the file
      if (inputSource === 'pdf' && pdfFile) {
        const filePath = `search-strings/${effectiveCompanyId}/${searchString.id}/${pdfFile.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(filePath, pdfFile);
        
        if (uploadError) throw uploadError;
        
        // Update search string with PDF path
        const { error: updateError } = await supabase
          .from('search_strings')
          .update({ 
            input_pdf_path: filePath, 
            status: 'processing' 
          })
          .eq('id', searchString.id);
        
        if (updateError) throw updateError;
        
        // Call the Edge Function to process PDF
        try {
          const { error: functionError } = await supabase.functions
            .invoke('process-pdf', { 
              body: { 
                search_string_id: searchString.id,
                pdf_path: filePath
              }
            });
          
          if (functionError) throw functionError;
        } catch (functionErr) {
          console.error('Error calling process-pdf function:', functionErr);
          // Continue execution - the function might still process the PDF
        }
      } else {
        // For text or website inputs
        // Update the search string with the final generated string (in a real app, this would come from OpenAI)
        const generatedString = await generatePreview(type, inputSource, inputText, inputUrl, pdfFile);
        
        const { error: updateError } = await supabase
          .from('search_strings')
          .update({ 
            generated_string: generatedString,
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', searchString.id);
        
        if (updateError) throw updateError;
      }
      
      // Call generate-search-string for website or text input
      if (inputSource !== 'pdf') {
        try {
          await supabase.functions
            .invoke('generate-search-string', { 
              body: { 
                search_string_id: searchString.id,
                type,
                input_text: inputText,
                input_url: inputUrl,
                input_source: inputSource,
                company_id: effectiveCompanyId,
                user_id: user.id
              }
            });
        } catch (functionErr) {
          console.error('Error calling generate-search-string function:', functionErr);
          // Continue execution - we already have a generated string as fallback
        }
      }
      
      // Refetch search strings to update the UI
      await fetchSearchStrings();
      
      return true;
    } catch (error: any) {
      console.error('Error creating search string:', error);
      toast({
        title: 'Failed to create search string',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Delete a search string
  const deleteSearchString = async (id: string) => {
    try {
      const { error } = await supabase
        .from('search_strings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setSearchStrings(prev => prev ? prev.filter(item => item.id !== id) : null);
      
      toast({
        title: 'Search string deleted',
        description: 'The search string has been successfully deleted',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting search string:', error);
      toast({
        title: 'Failed to delete search string',
        description: 'Please try again later',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Update a search string 
  const updateSearchString = async (id: string, generatedString: string) => {
    try {
      const { error } = await supabase
        .from('search_strings')
        .update({ 
          generated_string: generatedString,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setSearchStrings(prev => prev ? prev.map(item => 
        item.id === id ? { ...item, generated_string: generatedString, updated_at: new Date().toISOString() } : item
      ) : null);
      
      toast({
        title: 'Search string updated',
        description: 'The search string has been successfully updated',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating search string:', error);
      toast({
        title: 'Failed to update search string',
        description: 'Please try again later',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Mark search string as processed (for admins)
  const markAsProcessed = async (id: string) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('search_strings')
        .update({ 
          is_processed: true, 
          processed_at: new Date().toISOString(),
          processed_by: user.id
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setSearchStrings(prev => prev ? prev.map(item => 
        item.id === id ? { ...item, is_processed: true, processed_at: new Date().toISOString(), processed_by: user.id } : item
      ) : null);
      
      toast({
        title: 'Search string marked as processed',
        description: 'The search string has been marked as processed',
      });
      
      return true;
    } catch (error) {
      console.error('Error marking search string as processed:', error);
      toast({
        title: 'Failed to update search string',
        description: 'Please try again later',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Toggle search string feature for a company
  const toggleSearchStringFeature = async (companyId: string, enable: boolean) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ enable_search_strings: enable })
        .eq('id', companyId);
      
      if (error) throw error;
      
      toast({
        title: enable ? 'Feature enabled' : 'Feature disabled',
        description: `Search string feature has been ${enable ? 'enabled' : 'disabled'} for this company`,
      });
      
      return true;
    } catch (error) {
      console.error('Error toggling search string feature:', error);
      toast({
        title: 'Failed to update company settings',
        description: 'Please try again later',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSearchStrings();
  }, [companyId, fetchSearchStrings]);

  // Return methods and state
  return {
    searchStrings,
    isLoading,
    createSearchString,
    deleteSearchString,
    updateSearchString,
    markAsProcessed,
    toggleSearchStringFeature,
    selectedFile,
    setSelectedFile,
    previewString,
    setPreviewString,
    generatePreview,
    refetch: fetchSearchStrings,
  };
};
