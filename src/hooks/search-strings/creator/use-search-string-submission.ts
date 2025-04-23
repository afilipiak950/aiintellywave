
import { SearchStringType, SearchStringSource } from '../search-string-types';

export const useSearchStringSubmission = ({
  user,
  isAuthenticated,
  setIsSubmitting,
  inputSource,
  inputText,
  inputUrl,
  selectedFile,
  createSearchString,
  setInputText,
  setInputUrl,
  setSelectedFile,
  setPreviewString,
  onError,
  toast,
  type
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      const errorMsg = "Sie müssen angemeldet sein, um Suchstrings zu erstellen";
      console.error(errorMsg);
      toast({
        title: "Authentifizierung erforderlich",
        description: errorMsg,
        variant: "destructive"
      });
      if (onError) onError(errorMsg);
      return;
    }
    
    if (inputSource === 'text' && !inputText?.trim()) {
      const errorMsg = "Bitte geben Sie einen Text ein, um einen Suchstring zu generieren";
      console.error(errorMsg);
      toast({
        title: "Eingabe erforderlich",
        description: errorMsg,
        variant: "destructive"
      });
      if (onError) onError(errorMsg);
      return;
    }
    
    if (inputSource === 'website' && !inputUrl?.trim()) {
      const errorMsg = "Bitte geben Sie eine URL ein, um einen Suchstring zu generieren";
      console.error(errorMsg);
      toast({
        title: "URL erforderlich",
        description: errorMsg,
        variant: "destructive"
      });
      if (onError) onError(errorMsg);
      return;
    }
    
    if (inputSource === 'pdf' && !selectedFile) {
      const errorMsg = "Bitte laden Sie eine PDF-Datei hoch, um einen Suchstring zu generieren";
      console.error(errorMsg);
      toast({
        title: "Datei erforderlich",
        description: errorMsg,
        variant: "destructive"
      });
      if (onError) onError(errorMsg);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (onError) onError(null);
      
      console.log('Erstelle Suchstring mit Benutzerinformationen:', {
        userId: user.id,
        userEmail: user.email || 'Keine E-Mail',
        userRole: user.role || 'Keine Rolle',
        isAdmin: user.is_admin || false,
        isManager: user.is_manager || false,
        isCustomer: user.is_customer || false,
        companyId: user.company_id || 'Keine Firmen-ID'
      });
      
      // Debugging für createSearchString Parameter
      console.log('Suchstring-Parameter:', {
        type,
        inputSource, 
        inputText: inputSource === 'text' ? (inputText?.substring(0, 50) + '...') : undefined,
        inputUrl: inputSource === 'website' ? inputUrl : undefined,
        fileProvided: inputSource === 'pdf' ? !!selectedFile : false,
        fileName: inputSource === 'pdf' && selectedFile ? selectedFile.name : null
      });
      
      // Typecasts hinzugefügt, da TypeScript manchmal diese expliziten Casts benötigt
      const result = await createSearchString(
        user, 
        type as SearchStringType, 
        inputSource as SearchStringSource, 
        inputSource === 'text' ? inputText : undefined,
        inputSource === 'website' ? inputUrl : undefined,
        inputSource === 'pdf' ? selectedFile : null
      );
      
      if (result) {
        console.log('Suchstring erfolgreich erstellt mit Ergebnis:', result);
        
        setInputText('');
        setInputUrl('');
        setSelectedFile(null);
        setPreviewString(null);
        
        toast({
          title: "Erfolg",
          description: "Suchstring wurde erstellt und wird verarbeitet."
        });
      } else {
        console.error('Suchstring-Erstellung gab ein ungültiges Ergebnis zurück');
        if (onError) onError('Suchstring-Erstellung gab ein unerwartetes Ergebnis zurück');
        
        toast({
          title: "Warnung",
          description: "Suchstring wurde möglicherweise nicht richtig erstellt. Bitte überprüfen Sie die Liste unten.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Fehler beim Erstellen des Suchstrings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten';
      
      if (typeof errorMessage === 'string' && errorMessage.includes('Column', 'progress')) {
        const detailedError = "Datenbankschema-Fehler: Die Spalte 'progress' fehlt. Bitte wenden Sie sich an den Administrator.";
        console.error(detailedError, {
          userId: user.id,
          error: errorMessage
        });
        
        if (onError) onError(detailedError);
        toast({
          title: "Datenbankfehler",
          description: "Es gibt ein Problem mit der Datenbankstruktur. Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support.",
          variant: "destructive"
        });
      } else if (errorMessage.includes('row-level security') || errorMessage.includes('permission denied') || errorMessage.includes('infinite recursion')) {
        const detailedError = "Datenbank-Richtlinienfehler: Bitte melden Sie sich ab und wieder an.";
        console.error(detailedError, {
          userId: user.id,
          error: errorMessage
        });
        
        localStorage.setItem('auth_policy_error', 'true');
        
        if (onError) onError(detailedError);
        toast({
          title: "Datenbank-Richtlinienfehler",
          description: "Bitte melden Sie sich ab und wieder an, um dieses Problem zu beheben.",
          variant: "destructive"
        });
      } else {
        if (onError) onError(`Fehler beim Erstellen des Suchstrings: ${errorMessage}`);
        toast({
          title: "Fehler",
          description: `Fehler beim Erstellen des Suchstrings: ${errorMessage}`,
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit
  };
};
