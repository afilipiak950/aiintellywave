
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
    selectedFile,
    setSelectedFile,
    previewString,
    setPreviewString
  } = useSearchStringState();

  const { fetchSearchStrings } = useSearchStringFetching({ 
    user, 
    setSearchStrings, 
    setIsLoading 
  });

  useEffect(() => {
    if (user) {
      fetchSearchStrings();
    }
  }, [user, fetchSearchStrings]);

  return {
    searchStrings,
    isLoading,
    selectedFile,
    setSelectedFile,
    previewString,
    setPreviewString,
    fetchSearchStrings,
    user
  };
};
