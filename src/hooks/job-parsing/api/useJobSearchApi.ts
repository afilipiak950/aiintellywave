
import { supabase } from '@/integrations/supabase/client';
import { Job, JobOfferRecord } from '@/types/job-parsing';
import { SearchParams } from '../state/useJobSearchState';
import { useCompanyIdResolver } from './useCompanyIdResolver';
import { useJobSearchOperations } from './useJobSearchOperations';
import { useSearchHistoryOperations } from './useSearchHistoryOperations';
import { useAiSuggestionOperations } from './useAiSuggestionOperations';

export const useJobSearchApi = (companyId: string | null, userId: string | null) => {
  // Use the extracted hooks
  const { getUserCompanyId } = useCompanyIdResolver();
  const { searchJobs } = useJobSearchOperations(companyId, userId);
  const { loadSearchHistory, saveSearch, deleteSearch } = useSearchHistoryOperations(companyId);
  const { generateAiContactSuggestion } = useAiSuggestionOperations(companyId, userId);

  return {
    getUserCompanyId,
    searchJobs,
    generateAiContactSuggestion,
    loadSearchHistory,
    saveSearch,
    deleteSearch
  };
};
