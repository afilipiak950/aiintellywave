
import { supabase } from '@/integrations/supabase/client';
import { SearchStringType, SearchStringSource, SearchStringStatus } from '../search-string-types';
import { useSearchStringProcessing } from './use-search-string-processing';
import { toast } from '@/hooks/use-toast';

interface UseSearchStringCreationProps {
  fetchSearchStrings: () => Promise<void>;
}

export const useSearchStringCreation = ({ fetchSearchStrings }: UseSearchStringCreationProps) => {
  const { processSearchStringBySource } = useSearchStringProcessing();

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
      
      // Versuche zuerst direktes Einfügen
      let searchString;
      let insertError;
      
      try {
        const payload = {
          user_id: user.id,
          company_id: user.company_id,
          type,
          input_source: inputSource,
          input_text: inputSource === 'text' ? inputText : null,
          input_url: inputSource === 'website' ? inputUrl : null,
          status: 'new' as SearchStringStatus,
          is_processed: false,
          progress: 0
        };
        
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
      
      // Wenn direktes Einfügen fehlschlägt, versuche die Edge-Funktion
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
        // Wir werfen hier keinen Fehler, da der Suchstring erstellt wurde, nur die Verarbeitung fehlgeschlagen ist
        toast({
          title: "Warnung",
          description: "Suchstring wurde erstellt, aber die Verarbeitung ist fehlgeschlagen. Sie können die Verarbeitung später wiederholen.",
          variant: "destructive"
        });
      }
      
      // Aktualisiere die Suchstring-Liste
      await fetchSearchStrings();
      
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
