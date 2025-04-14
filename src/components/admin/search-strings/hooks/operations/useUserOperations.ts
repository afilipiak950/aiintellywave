
import { useState } from 'react';
import { SearchString } from '@/hooks/search-strings/search-string-types';
import { checkSpecificUser } from './user/userSearchOperations';
import { debugUser as debugUserOperation } from './user/userDebugOperations';

export const useUserOperations = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Wrapper function for checking specific user
  const handleCheckSpecificUser = async (
    email: string = 's.naeb@flh-mediadigital.de',
    setSearchStrings: (strings: SearchString[]) => void,
    setUserEmails: React.Dispatch<React.SetStateAction<Record<string, string>>>,
    setCompanyNames: React.Dispatch<React.SetStateAction<Record<string, string>>>,
    setIsRefreshing: (isRefreshing: boolean) => void,
    setError: (error: string | null) => void
  ) => {
    await checkSpecificUser(
      email,
      setSearchStrings,
      setUserEmails,
      setCompanyNames,
      setIsRefreshing,
      setError
    );
  };
  
  // Wrapper function for debugging user
  const handleDebugUser = async (email: string) => {
    return await debugUserOperation(email);
  };
  
  return {
    isRefreshing,
    checkSpecificUser: handleCheckSpecificUser,
    debugUser: handleDebugUser
  };
};
