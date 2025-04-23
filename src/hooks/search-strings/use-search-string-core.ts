
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { SearchString } from './search-string-types';

export const useSearchStringCore = () => {
  const { user } = useAuth();
  const [searchStrings, setSearchStrings] = useState<SearchString[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Einfache Funktion zum Abrufen der Search Strings
  const fetchSearchStrings = async () => {
    if (!user) {
      console.warn('Kein authentifizierter Benutzer für Search Strings');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Direkte Abfrage über Edge Function (umgeht RLS-Probleme)
      const { data, error: fetchError } = await supabase.functions.invoke('get-user-search-strings', {
        body: { userId: user.id }
      });
      
      if (fetchError) {
        console.error('Fehler beim Abrufen der Search Strings:', fetchError);
        setError(new Error(`Fehler beim Abrufen der Daten: ${fetchError.message}`));
        setSearchStrings([]);
      } else if (data && data.searchStrings) {
        setSearchStrings(data.searchStrings as SearchString[]);
      } else {
        setSearchStrings([]);
      }
    } catch (err: any) {
      console.error('Unerwarteter Fehler:', err);
      setError(err);
      setSearchStrings([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Beim Laden oder Benutzeränderung automatisch Daten holen
  useEffect(() => {
    if (user) {
      fetchSearchStrings();
    }
  }, [user]);

  return {
    searchStrings,
    setSearchStrings,
    isLoading,
    error,
    fetchSearchStrings,
    user
  };
};
