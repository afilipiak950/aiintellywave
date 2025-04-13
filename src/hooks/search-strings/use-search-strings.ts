
import { useEffect } from 'react';
import { useSearchStringCore } from './use-search-string-core';
import { useSearchStringOperations } from './use-search-string-operations';
import { SearchStringType, SearchStringSource, SearchString } from './search-string-types';

export type { SearchStringType, SearchStringSource, SearchString } from './search-string-types';

interface UseSearchStringsProps {
  companyId?: string;
}

export const useSearchStrings = (props?: UseSearchStringsProps) => {
  const core = useSearchStringCore(props);
  const operations = useSearchStringOperations({ 
    user: core.user,
    fetchSearchStrings: core.fetchSearchStrings
  });

  useEffect(() => {
    if (props?.companyId && core.user) {
      core.fetchSearchStrings();
    }
  }, [props?.companyId, core.user]);

  return {
    searchStrings: core.searchStrings,
    isLoading: core.isLoading,
    selectedFile: core.selectedFile,
    setSelectedFile: core.setSelectedFile,
    previewString: core.previewString,
    setPreviewString: core.setPreviewString,
    refetch: core.fetchSearchStrings,
    ...operations
  };
};
