
import { useEffect } from 'react';
import { useState } from 'react';
import { useSearchStringCore } from './use-search-string-core';
import { useSearchStringOperations } from './use-search-string-operations';
import { SearchStringType, SearchStringSource, SearchString, SearchStringStatus } from './search-string-types';

export type { SearchStringType, SearchStringSource, SearchString, SearchStringStatus } from './search-string-types';

export const useSearchStrings = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewString, setPreviewString] = useState<string>('');
  
  const core = useSearchStringCore();
  const operations = useSearchStringOperations({ 
    user: core.user,
    fetchSearchStrings: core.fetchSearchStrings
  });

  useEffect(() => {
    if (core.user) {
      core.fetchSearchStrings();
    }
  }, [core.user]);

  return {
    searchStrings: core.searchStrings,
    isLoading: core.isLoading,
    selectedFile,
    setSelectedFile,
    previewString,
    setPreviewString,
    refetch: core.fetchSearchStrings,
    ...operations
  };
};
