
import { useSearchStringPreview } from './operations/use-search-string-preview';
import { useSearchStringCreation } from './operations/use-search-string-creation';
import { useSearchStringManagement } from './operations/use-search-string-management';
import { SearchStringType, SearchStringSource } from './search-string-types';

interface UseSearchStringOperationsProps {
  user: any;
  fetchSearchStrings: () => Promise<void>;
}

export const useSearchStringOperations = ({ user, fetchSearchStrings }: UseSearchStringOperationsProps) => {
  const { generatePreview } = useSearchStringPreview();
  const { createSearchString: createStringWithUser } = useSearchStringCreation({ fetchSearchStrings });
  const { 
    deleteSearchString, 
    updateSearchString, 
    markAsProcessed, 
    toggleSearchStringFeature 
  } = useSearchStringManagement({ fetchSearchStrings });

  // Wrapper function that injects the user
  const createSearchString = async (
    type: SearchStringType,
    inputSource: SearchStringSource,
    inputText?: string,
    inputUrl?: string,
    pdfFile?: File | null
  ) => {
    // Add debugging about the user before passing to createStringWithUser
    console.log('Search string creation - User check:', {
      userId: user?.id || 'No user ID',
      userPresent: !!user,
      userEmail: user?.email || 'No email',
      userCompanyId: user?.company_id || 'No company ID'
    });
    
    return createStringWithUser(user, type, inputSource, inputText, inputUrl, pdfFile);
  };

  // Wrapper function that injects the user
  const markStringAsProcessed = async (id: string) => {
    return markAsProcessed(id, user);
  };

  return {
    createSearchString,
    deleteSearchString,
    updateSearchString,
    markAsProcessed: markStringAsProcessed,
    toggleSearchStringFeature,
    generatePreview,
  };
};
