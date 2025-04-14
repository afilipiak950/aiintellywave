
import { useEffect } from 'react';
import { SearchString } from '@/hooks/search-strings/search-string-types';
import { useSearchStringState } from './state/useSearchStringState';
import { useSearchStringFetching } from './data/useSearchStringFetching';
import { useUserOperations } from './operations/useUserOperations';
import { useSearchStringOperations } from './operations/useSearchStringOperations';

export interface UseSearchStringAdminReturn {
  searchStrings: SearchString[];
  isLoading: boolean;
  isRefreshing: boolean;
  companyNames: Record<string, string>;
  userEmails: Record<string, string>;
  selectedSearchString: SearchString | null;
  isDetailOpen: boolean;
  fetchAllSearchStrings: () => Promise<void>;
  markAsProcessed: (id: string, e: React.MouseEvent) => Promise<void>;
  handleCreateProject: (searchString: SearchString, e: React.MouseEvent) => void;
  handleViewDetails: (searchString: SearchString) => void;
  setIsDetailOpen: (isOpen: boolean) => void;
  checkSpecificUser: (email?: string) => Promise<void>;
  debugUser: (email: string) => Promise<any>;
  error: string | null;
}

export const useSearchStringAdmin = (): UseSearchStringAdminReturn => {
  const { state, setters } = useSearchStringState();
  const { fetchAllSearchStrings: fetchStringData } = useSearchStringFetching();
  const { checkSpecificUser, debugUser } = useUserOperations();
  const { markAsProcessed: markProcessed, handleCreateProject } = useSearchStringOperations();

  // Initial fetch
  useEffect(() => {
    fetchAllSearchStrings();
  }, []);

  // Function to fetch all search strings
  const fetchAllSearchStrings = async () => {
    await fetchStringData(
      setters.setSearchStrings,
      setters.setUserEmails,
      setters.setCompanyNames,
      setters.setIsLoading,
      setters.setIsRefreshing,
      setters.setError
    );
  };

  // Function to check a specific user's search strings by email
  const handleCheckSpecificUser = async (email: string = 's.naeb@flh-mediadigital.de') => {
    await checkSpecificUser(
      email,
      setters.setSearchStrings,
      setters.setUserEmails,
      setters.setCompanyNames,
      setters.setIsRefreshing,
      setters.setError
    );
  };

  // Handle marking a search string as processed
  const handleMarkAsProcessed = async (id: string, e: React.MouseEvent) => {
    await markProcessed(id, e, state.searchStrings, setters.setSearchStrings);
  };

  // View search string details
  const handleViewDetails = (searchString: SearchString) => {
    setters.setSelectedSearchString(searchString);
    setters.setIsDetailOpen(true);
  };

  // Debug user function that returns data instead of setting state
  const handleDebugUser = async (email: string) => {
    return await debugUser(email);
  };

  return {
    ...state,
    fetchAllSearchStrings,
    markAsProcessed: handleMarkAsProcessed,
    handleCreateProject,
    handleViewDetails,
    setIsDetailOpen: setters.setIsDetailOpen,
    checkSpecificUser: handleCheckSpecificUser,
    debugUser: handleDebugUser
  };
};
