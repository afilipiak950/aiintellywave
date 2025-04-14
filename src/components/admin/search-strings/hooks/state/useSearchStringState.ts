
import { useState } from 'react';
import { SearchString } from '@/hooks/search-strings/search-string-types';

export interface SearchStringState {
  searchStrings: SearchString[];
  isLoading: boolean;
  isRefreshing: boolean;
  companyNames: Record<string, string>;
  userEmails: Record<string, string>;
  selectedSearchString: SearchString | null;
  isDetailOpen: boolean;
  error: string | null;
}

export interface SearchStringSetters {
  setSearchStrings: React.Dispatch<React.SetStateAction<SearchString[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedSearchString: React.Dispatch<React.SetStateAction<SearchString | null>>;
  setIsDetailOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCompanyNames: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setIsRefreshing: React.Dispatch<React.SetStateAction<boolean>>;
  setUserEmails: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useSearchStringState = () => {
  const [searchStrings, setSearchStrings] = useState<SearchString[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSearchString, setSelectedSearchString] = useState<SearchString | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [companyNames, setCompanyNames] = useState<Record<string, string>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  return {
    state: {
      searchStrings,
      isLoading,
      isRefreshing,
      companyNames,
      userEmails,
      selectedSearchString,
      isDetailOpen,
      error
    },
    setters: {
      setSearchStrings,
      setIsLoading,
      setSelectedSearchString,
      setIsDetailOpen,
      setCompanyNames,
      setIsRefreshing,
      setUserEmails,
      setError
    }
  };
};
