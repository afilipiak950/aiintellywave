
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SearchStringType, SearchStringSource } from './search-string-types';

interface UseSearchStringOperationsProps {
  user: any;
  fetchSearchStrings: () => Promise<void>;
}

export const useSearchStringOperations = ({ user, fetchSearchStrings }: UseSearchStringOperationsProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Function to create a Search String
  const createSearchString = async (
    type: SearchStringType,
    inputSource: SearchStringSource,
    inputText?: string,
    inputUrl?: string,
    pdfFile?: File | null
  ) => {
    if (!user) {
      toast({
        title: "Fehler",
        description: "Sie müssen angemeldet sein, um Search Strings zu erstellen.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare payload
      const payload: any = {
        user_id: user.id,
        company_id: user.company_id,
        type,
        input_source: inputSource,
        input_text: inputSource === 'text' ? inputText : null,
        input_url: inputSource === 'website' ? inputUrl : null,
      };
      
      // PDF upload (if exists)
      let pdfPath = null;
      if (inputSource === 'pdf' && pdfFile) {
        const fileName = `${user.id}/${Date.now()}-${pdfFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('search-string-pdfs')
          .upload(fileName, pdfFile);
          
        if (uploadError) {
          throw new Error(`PDF-Upload fehlgeschlagen: ${uploadError.message}`);
        }
        
        pdfPath = uploadData?.path;
        payload.input_pdf_path = pdfPath;
      }

      // Insert via Edge Function (bypasses RLS issues)
      const { data, error } = await supabase.functions.invoke('create-search-string', {
        body: payload
      });
      
      if (error) {
        throw new Error(`Fehler beim Erstellen des Search Strings: ${error.message}`);
      }
      
      toast({
        title: "Erfolg",
        description: "Search String wurde erstellt und wird verarbeitet.",
      });
      
      // Update list
      fetchSearchStrings();
      
    } catch (err: any) {
      console.error('Fehler beim Erstellen des Search Strings:', err);
      toast({
        title: "Fehler",
        description: err.message || "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to delete a Search String
  const deleteSearchString = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke('delete-search-string', {
        body: { id, userId: user?.id }
      });
      
      if (error) throw new Error(error.message);
      
      toast({
        title: "Erfolg",
        description: "Search String wurde gelöscht.",
      });
      
      // Update list
      fetchSearchStrings();
      
    } catch (err: any) {
      toast({
        title: "Fehler",
        description: err.message || "Fehler beim Löschen.",
        variant: "destructive"
      });
    }
  };

  // Function to generate preview for search strings
  const generatePreview = async (
    type: SearchStringType,
    inputSource: SearchStringSource,
    inputText?: string,
    inputUrl?: string,
    pdfFile?: File | null
  ): Promise<string> => {
    try {
      let previewText = "";
      
      if (inputSource === 'text' && inputText) {
        // Simple preview for text input
        const keywords = inputText
          .split(/\s+/)
          .filter(word => word.length > 3)
          .slice(0, 5)
          .join(' OR ');
        
        previewText = `(${keywords})`;
      } else if (inputSource === 'website' && inputUrl) {
        // Simple preview for website input
        try {
          const domain = new URL(inputUrl).hostname;
          previewText = `site:${domain} ${type === 'recruiting' ? 'job OR career' : 'product OR service'}`;
        } catch (e) {
          previewText = "Ungültige URL";
        }
      } else if (inputSource === 'pdf' && pdfFile) {
        // Simple preview for PDF input
        previewText = `Analyzing PDF: ${pdfFile.name} (${Math.round(pdfFile.size / 1024)} KB)`;
      }
      
      return previewText || "Vorschau wird generiert...";
    } catch (err) {
      console.error("Fehler bei Vorschau-Generierung:", err);
      return "Fehler bei der Vorschau-Generierung";
    }
  };

  // Function to toggle search string feature for a company
  const toggleSearchStringFeature = async (companyId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ enable_search_strings: enabled })
        .eq('id', companyId);
      
      if (error) throw error;
      
      toast({
        title: enabled ? "Funktion aktiviert" : "Funktion deaktiviert",
        description: `Die Search String Funktion wurde für diese Firma ${enabled ? 'aktiviert' : 'deaktiviert'}.`
      });
      
      return true;
    } catch (err: any) {
      console.error("Fehler beim Ändern der Search String Funktion:", err);
      toast({
        title: "Fehler",
        description: err.message || "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    createSearchString,
    deleteSearchString,
    generatePreview,
    toggleSearchStringFeature,
    isSubmitting
  };
};
