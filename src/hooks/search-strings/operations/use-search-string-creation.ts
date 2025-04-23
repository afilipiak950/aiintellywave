
import { supabase } from '@/integrations/supabase/client';
import { SearchStringType, SearchStringSource, SearchStringStatus, SearchStringDBStatus } from '../search-string-types';
import { useSearchStringProcessing } from './use-search-string-processing';
import { useToast } from '@/hooks/use-toast';

interface UseSearchStringCreationProps {
  fetchSearchStrings: () => Promise<void>;
}

export const useSearchStringCreation = ({ fetchSearchStrings }: UseSearchStringCreationProps) => {
  const { processSearchStringBySource } = useSearchStringProcessing();
  const { toast } = useToast();

  const createSearchString = async (
    user: any,
    type: SearchStringType,
    inputSource: SearchStringSource,
    inputText?: string,
    inputUrl?: string,
    pdfFile?: File | null
  ) => {
    try {
      if (!user) {
        console.error('Benutzer nicht authentifiziert für Suchstring-Erstellung');
        throw new Error('Benutzer nicht authentifiziert');
      }

      if (!user.id) {
        console.error('Fehlende Benutzer-ID im authentifizierten Benutzer', user);
        throw new Error('Benutzer-ID fehlt');
      }
      
      // Validate input based on inputSource
      if (inputSource === 'text' && !inputText?.trim()) {
        throw new Error('Texteingabe ist erforderlich');
      }
      
      if (inputSource === 'website' && !inputUrl?.trim()) {
        throw new Error('URL-Eingabe ist erforderlich');
      }
      
      if (inputSource === 'pdf' && !pdfFile) {
        throw new Error('PDF-Datei ist erforderlich');
      }

      console.log('Erstelle Suchstring mit user_id:', user.id);
      console.log('Firmen-ID für Suchstring:', user.company_id);
      console.log('Suchstring-Daten:', {
        user_id: user.id,
        company_id: user.company_id,
        type,
        input_source: inputSource,
        input_text: inputSource === 'text' ? inputText : undefined,
        input_url: inputSource === 'website' ? inputUrl : undefined,
      });
      
      // Prepare the payload
      const payload: any = {
        user_id: user.id,
        company_id: user.company_id,
        type,
        input_source: inputSource,
        input_text: inputSource === 'text' ? inputText : null,
        input_url: inputSource === 'website' ? inputUrl : null,
        status: 'new' as SearchStringDBStatus,
        is_processed: false,
        progress: 0
      };
      
      // Try direct Supabase API first
      let searchString;
      let insertError;
      
      try {
        console.log('Versuche direktes Einfügen mit Payload:', payload);
        
        const response = await supabase
          .from('search_strings')
          .insert(payload)
          .select()
          .single();
          
        searchString = response.data;
        insertError = response.error;
        
        if (insertError) {
          console.error('Fehler beim direkten Einfügen:', insertError);
        } else if (searchString) {
          console.log('Suchstring erfolgreich direkt erstellt:', searchString);
        }
      } catch (directError) {
        console.error('Fehler beim direkten Einfügen:', directError);
        insertError = directError;
      }
      
      // If direct insert fails, try the Edge Function
      if (insertError || !searchString) {
        console.log('Direktes Einfügen fehlgeschlagen, versuche Edge-Funktion...');
        
        try {
          const { data, error } = await supabase.functions.invoke('create-search-string', {
            body: {
              user_id: user.id,
              company_id: user.company_id,
              type,
              input_source: inputSource,
              input_text: inputSource === 'text' ? inputText : undefined,
              input_url: inputSource === 'website' ? inputUrl : undefined
            }
          });
          
          if (error) {
            console.error('Edge-Funktion Fehler:', error);
            throw error;
          }
          
          if (data && data.searchString) {
            console.log('Suchstring erfolgreich über Edge-Funktion erstellt:', data.searchString);
            searchString = data.searchString;
          } else {
            throw new Error('Kein Suchstring von Edge-Funktion zurückgegeben');
          }
        } catch (edgeFunctionError) {
          console.error('Edge-Funktion Ansatz fehlgeschlagen:', edgeFunctionError);
          throw edgeFunctionError;
        }
      }
      
      if (!searchString) {
        throw new Error('Suchstring konnte über keine Methode erstellt werden');
      }
      
      console.log('Suchstring erfolgreich erstellt:', {
        id: searchString.id,
        status: searchString.status,
        type: searchString.type,
        source: searchString.input_source,
        userId: searchString.user_id,
        companyId: searchString.company_id
      });
      
      // Verarbeite den Suchstring basierend auf seiner Quelle
      try {
        await processSearchStringBySource(
          searchString,
          inputSource,
          type,
          inputText,
          inputUrl,
          pdfFile
        );
      } catch (processingError) {
        console.error('Fehler bei der Verarbeitung des Suchstrings:', processingError);
        toast({
          title: "Warnung",
          description: "Suchstring wurde erstellt, aber die Verarbeitung ist fehlgeschlagen. Sie können die Verarbeitung später wiederholen.",
          variant: "destructive"
        });
      }
      
      // Aktualisiere die Suchstring-Liste
      try {
        await fetchSearchStrings();
      } catch (fetchError) {
        console.error('Fehler beim Aktualisieren der Suchstring-Liste:', fetchError);
      }
      
      return searchString;
    } catch (error: any) {
      console.error('Fehler beim Erstellen des Suchstrings:', error);
      console.error('Fehlerdetails:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        stack: error.stack
      });
      throw error;
    }
  };

  return {
    createSearchString
  };
};
