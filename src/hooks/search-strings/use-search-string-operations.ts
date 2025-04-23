
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
  
  // Einfache Funktion zum Erstellen eines Search Strings
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
      // Payload vorbereiten
      const payload = {
        user_id: user.id,
        company_id: user.company_id,
        type,
        input_source: inputSource,
        input_text: inputSource === 'text' ? inputText : null,
        input_url: inputSource === 'website' ? inputUrl : null,
      };
      
      // PDF-Upload (falls vorhanden)
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

      // Über Edge Function einfügen (umgeht RLS-Probleme)
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
      
      // Liste aktualisieren
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
  
  // Einfache Funktion zum Löschen eines Search Strings
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
      
      // Liste aktualisieren
      fetchSearchStrings();
      
    } catch (err: any) {
      toast({
        title: "Fehler",
        description: err.message || "Fehler beim Löschen.",
        variant: "destructive"
      });
    }
  };

  return {
    createSearchString,
    deleteSearchString,
    isSubmitting
  };
};
