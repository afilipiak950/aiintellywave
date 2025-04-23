
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import SearchStringCreator from '@/components/customer/search-strings/SearchStringCreator';
import SearchStringsList from '@/components/customer/search-strings/SearchStringsList';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SearchStringsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isFixingRLS, setIsFixingRLS] = useState(false);
  
  // Gespeicherte Fehler beim Start prüfen und löschen
  useEffect(() => {
    const storedError = localStorage.getItem('searchStrings_error');
    if (storedError) {
      setError(storedError);
    }
  }, []);
  
  // Einfacherer Fix-Button für RLS-Probleme
  const handleFixRLS = async () => {
    setIsFixingRLS(true);
    try {
      // RLS-bezogene Fehler aus dem LocalStorage entfernen
      localStorage.removeItem('auth_policy_error');
      localStorage.removeItem('searchStrings_error');
      localStorage.removeItem('searchStrings_error_details');
      
      // Edge-Funktion aufrufen, um RLS zu überprüfen
      await supabase.functions.invoke('check-rls', {});
      
      // Erfolgsmeldung anzeigen
      toast({
        title: "Erfolg",
        description: "Datenbank-Zugriff wurde überprüft und aktualisiert.",
      });
      
      setError(null);
      
      // Seite neu laden, um Änderungen zu übernehmen
      window.location.reload();
    } catch (err: any) {
      console.error('Failed to fix RLS issues:', err);
      toast({
        title: "Fehler",
        description: "Reparatur fehlgeschlagen. Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
    } finally {
      setIsFixingRLS(false);
    }
  };

  // Wenn kein User angemeldet ist, Anmeldeaufforderung anzeigen
  if (!user) {
    return (
      <div className="container py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Anmeldung erforderlich</AlertTitle>
          <AlertDescription>
            Bitte melden Sie sich an, um diese Seite zu nutzen.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Search Strings</h1>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <div>{error}</div>
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleFixRLS}
                disabled={isFixingRLS}
              >
                {isFixingRLS ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Repariere...
                  </>
                ) : (
                  'Datenbank-Zugriff reparieren'
                )}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <SearchStringCreator onError={setError} />
        </Card>
        <Card className="p-6">
          <SearchStringsList onError={setError} />
        </Card>
      </div>
    </div>
  );
};

export default SearchStringsPage;
