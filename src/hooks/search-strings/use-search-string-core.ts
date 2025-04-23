
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
      fetchSearchStrings().catch(err => {
        console.warn('Error fetching search strings:', err);
        // Leere Liste setzen, damit UI nicht blockiert wird
        setSearchStrings([]);
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
