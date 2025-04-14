
import { useState } from 'react';
import { SearchString } from '../search-string-types';

export const useSearchStringState = () => {
  const [searchStrings, setSearchStrings] = useState<SearchString[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewString, setPreviewString] = useState<string | null>(null);

  return {
    searchStrings,
    setSearchStrings,
    isLoading,
    setIsLoading,
    selectedFile,
    setSelectedFile,
    previewString,
    setPreviewString
  };
};
