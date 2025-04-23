
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
    error, // Make sure error is captured from state
    setError, // Make sure setError is captured from state
    selectedFile,
    setSelectedFile,
    previewString,
    setPreviewString
  } = useSearchStringState();

  const { fetchSearchStrings } = useSearchStringFetching({ 
    user, 
    setSearchStrings, 
    setIsLoading,
    setError // Pass setError to fetching
  });

  useEffect(() => {
    if (user) {
      fetchSearchStrings();
    }
  }, [user, fetchSearchStrings]);

  return {
    searchStrings,
    isLoading,
    error, // Properly return the error object
    selectedFile,
    setSelectedFile,
    previewString,
    setPreviewString,
    fetchSearchStrings,
    user
  };
};
