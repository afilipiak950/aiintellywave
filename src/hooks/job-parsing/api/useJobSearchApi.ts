
import { supabase } from '@/integrations/supabase/client';
import { Job, JobSearchHistory } from '@/types/job-parsing';
import { SearchParams } from '../state/useJobSearchState';
import { useJobSearchOperations } from './useJobSearchOperations';
import { useSearchHistoryOperations } from './useSearchHistoryOperations';
import { useAiSuggestionOperations } from './useAiSuggestionOperations';
import { useClayWorkbookOperations } from './useClayWorkbookOperations';

export const useJobSearchApi = (companyId: string | null, userId: string | null) => {
  // Core operations
  const searchOps = useJobSearchOperations(companyId, userId);
  const historyOps = useSearchHistoryOperations(companyId);
  const aiOps = useAiSuggestionOperations(companyId, userId);
  const clayOps = useClayWorkbookOperations(companyId, userId);

  // Export all operations
  return {
    searchJobs: searchOps.searchJobs,
    getStoredJobResults: searchOps.getStoredJobResults,
    saveSearch: historyOps.saveSearch,
    loadSearchHistory: historyOps.loadSearchHistory,
    deleteSearch: historyOps.deleteSearch,
    generateAiContactSuggestion: aiOps.generateAiContactSuggestion,
    createClayWorkbook: clayOps.createClayWorkbook
  };
};
