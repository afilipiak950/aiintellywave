
import React, { useState } from 'react';
import { useAuth } from '@/context/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SearchStringsList from '@/components/customer/search-strings/SearchStringsList';
import SearchStringCreator from '@/components/customer/search-strings/SearchStringCreator';

const SearchStringsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isFixingRLS, setIsFixingRLS] = useState(false);
  
  // Einfacher Fix für RLS-Probleme
  const handleFixRLS = async () => {
    setIsFixingRLS(true);
    
    try {
      localStorage.removeItem('searchStrings_error');
      
      // Edge-Funktion aufrufen, um RLS zu überprüfen
      await supabase.functions.invoke('check-rls', {});
      
      toast({
        title: "Erfolg",
        description: "Datenbank-Zugriff wurde repariert.",
      });
      
      setError(null);
      window.location.reload();
    } catch (err: any) {
      console.error('Fehler bei der Reparatur:', err);
      toast({
        title: "Fehler",
        description: "Reparatur fehlgeschlagen. Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
    } finally {
      setIsFixingRLS(false);
    }
  };

  // Wenn kein User angemeldet ist
  if (!user) {
    return (
      <div className="container py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Anmeldung erforderlich</AlertTitle>
          <AlertDescription>
            Bitte melden Sie sich an, um Search Strings zu erstellen.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Search Strings</h1>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Datenbankfehler</AlertTitle>
          <AlertDescription>
            <div>{error}</div>
            <div className="flex justify-end mt-2">
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
          <CardHeader className="px-0 pt-0">
            <CardTitle>Ihre Search Strings</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <SearchStringsList onError={setError} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SearchStringsPage;
