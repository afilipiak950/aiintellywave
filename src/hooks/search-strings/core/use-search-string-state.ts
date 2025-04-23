
import { useState } from 'react';
import { SearchString } from '../search-string-types';

export const useSearchStringState = () => {
  const [searchStrings, setSearchStrings] = useState<SearchString[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null); // Add error state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewString, setPreviewString] = useState('');

  return {
    searchStrings,
    setSearchStrings,
    isLoading,
    setIsLoading,
    error, // Export error state
    setError, // Export setError method
    selectedFile,
    setSelectedFile,
    previewString,
    setPreviewString
  };
};
