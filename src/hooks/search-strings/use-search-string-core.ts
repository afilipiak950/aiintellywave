
import { useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { useSearchStringState } from './core/use-search-string-state';
import { useSearchStringFetching } from './core/use-search-string-fetching';

export const useSearchStringCore = () => {
  const { user } = useAuth();
  const {
    searchStrings,
    setSearchStrings,
    isLoading,
    setIsLoading,
    error,
    setError,
    selectedFile,
    setSelectedFile,
    previewString,
    setPreviewString
  } = useSearchStringState();

  const { fetchSearchStrings } = useSearchStringFetching({ 
    user, 
    setSearchStrings, 
    setIsLoading,
    setError
  });

  useEffect(() => {
    if (user) {
      // Versuchen, Search Strings zu laden, aber Fehler nicht an Benutzer weitergeben
      fetchSearchStrings().catch(err => {
        console.warn('Error in fetchSearchStrings useEffect:', err);
        // Leere Liste setzen, damit UI nicht blockiert wird
        setSearchStrings([]);
        
        // Nur bestimmte Fehler an die Benutzeroberfläche weitergeben
        if (err?.message?.includes('infinite recursion') || err?.message?.includes('policy')) {
          setError(new Error('Datenbankzugriffsproblem. Versuchen Sie, auf "Datenbank-Zugriff reparieren" zu klicken.'));
        }
      });
    }
  }, [user, fetchSearchStrings]);

  return {
    searchStrings,
    isLoading,
    error,
    selectedFile,
    setSelectedFile,
    previewString,
    setPreviewString,
    fetchSearchStrings,
    user
  };
};
