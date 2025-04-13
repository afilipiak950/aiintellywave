import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth';
import { v4 as uuidv4 } from 'uuid';

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
      
      if (!companyId) {
        console.log('No company ID provided, skipping fetch');
        setSearchStrings([]);
        setIsLoading(false);
        return;
      }
      
      if (!user) {
        console.log('No authenticated user, skipping fetch');
        setSearchStrings([]);
        setIsLoading(false);
        return;
      }
      
      // Validate that companyId is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(companyId)) {
        console.error('Invalid company ID format:', companyId);
        setSearchStrings([]);
        toast({
          title: 'Invalid company ID format',
          description: 'The company ID is not in a valid format.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      
      let query = supabase
        .from('search_strings')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Filter by company_id if it exists and is valid UUID
      query = query.eq('company_id', companyId);
      
      // Additional filter by user_id for RLS
      query = query.eq('user_id', user.id);
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching search strings:', error);
        setSearchStrings([]);
        toast({
          title: 'Failed to load search strings',
          description: error.message || 'Please try again later',
          variant: 'destructive',
        });
      } else {
        console.log('Fetched search strings:', data.length);
        setSearchStrings(data as SearchString[]);
      }
    } catch (error) {
      console.error('Error in fetchSearchStrings:', error);
      setSearchStrings([]);
      toast({
        title: 'Failed to load search strings',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [companyId, toast, user]);

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
        // For website, we'll implement a more comprehensive preview
        try {
          // Extract domain for basic preview (the real crawling will happen in the edge function)
          const domain = new URL(inputUrl).hostname.replace('www.', '');
          
          if (type === 'recruiting') {
            prompt = `Analyzing job posting at ${domain}... The search string will be generated based on all job requirements, skills, location, and experience details from the website.`;
          } else {
            prompt = `Analyzing business at ${domain}... The search string will be generated based on company information, services, and industry details from the website.`;
          }
        } catch (error) {
          console.error('Invalid URL format:', error);
          prompt = `Invalid URL format. Please enter a valid URL.`;
        }
      } else if (inputSource === 'pdf' && pdfFile) {
        // Use the filename for PDF input
        prompt = `Analyzing PDF: ${pdfFile.name}... The search string will be generated based on all content extracted from the document.`;
      }
      
      return prompt;
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

      // Validate company ID
      if (!companyId) {
        throw new Error('No company ID provided');
      }
      
      // Make sure companyId is a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(companyId)) {
        console.error('Company ID is not a valid UUID, using a new one');
        const validCompanyId = uuidv4();
        console.log('Generated valid company ID:', validCompanyId);
        
        // Initial search string record with valid UUID
        const { data: searchString, error: insertError } = await supabase
          .from('search_strings')
          .insert({
            company_id: validCompanyId,
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
        
        if (insertError) {
          console.error('Error inserting search string:', insertError);
          
          // Check for RLS error
          if (insertError.message.includes('row-level security') || 
              insertError.message.includes('new row violates row-level security policy')) {
            throw new Error('Permission denied: You do not have access to create search strings');
          }
          
          throw insertError;
        }
        
        // Process based on input source
        await processSearchStringBySource(
          searchString,
          inputSource,
          type,
          inputText,
          inputUrl,
          pdfFile
        );
        
        // Refetch search strings
        await fetchSearchStrings();
        
        return true;
      }
      
      console.log('Creating search string with company ID:', companyId);
      
      // Initial search string record with valid company ID
      const { data: searchString, error: insertError } = await supabase
        .from('search_strings')
        .insert({
          company_id: companyId,
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
      
      if (insertError) {
        console.error('Error inserting search string:', insertError);
        
        // Check for RLS error
        if (insertError.message.includes('row-level security') || 
            insertError.message.includes('new row violates row-level security policy')) {
          throw new Error('Permission denied: You do not have access to create search strings');
        }
        
        throw insertError;
      }
      
      console.log('Search string created:', searchString);
      
      // Process based on input source
      await processSearchStringBySource(
        searchString,
        inputSource,
        type,
        inputText,
        inputUrl,
        pdfFile
      );
      
      // Refetch search strings
      await fetchSearchStrings();
      
      return true;
    } catch (error: any) {
      console.error('Error creating search string:', error);
      throw error;
    }
  };

  // Helper function to process search string based on input source
  const processSearchStringBySource = async (
    searchString: any,
    inputSource: SearchStringSource,
    type: SearchStringType,
    inputText?: string,
    inputUrl?: string,
    pdfFile?: File | null
  ) => {
    // If PDF, upload the file
    if (inputSource === 'pdf' && pdfFile) {
      const filePath = `search-strings/${searchString.company_id}/${searchString.id}/${pdfFile.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, pdfFile);
      
      if (uploadError) {
        console.error('Error uploading PDF:', uploadError);
        throw uploadError;
      }
      
      // Update search string with PDF path
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
      
      // Call the Edge Function to process PDF
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
      // Update to processing status
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
      
      // Call generate-search-string for website or text input
      try {
        await supabase.functions
          .invoke('generate-search-string', { 
            body: { 
              search_string_id: searchString.id,
              type,
              input_text: inputText,
              input_url: inputUrl,
              input_source: inputSource,
              company_id: searchString.company_id,
              user_id: user?.id
            }
          });
      } catch (functionErr) {
        console.error('Error calling generate-search-string function:', functionErr);
        
        // Generate fallback string if function call fails
        const generatedString = await generatePreview(type, inputSource, inputText, inputUrl, pdfFile);
        
        // Update with fallback string
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
    if (companyId && user) {
      fetchSearchStrings();
    }
  }, [companyId, fetchSearchStrings, user]);

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
