
import { supabase } from '@/integrations/supabase/client';
import { Job, JobSearchHistory } from '@/types/job-parsing';
import { SearchParams } from '../state/useJobSearchState';
import { useSearchOperations } from './useSearchOperations';
import { useSaveOperations } from './useSaveOperations';
import { useHistoryOperations } from './useHistoryOperations';
import { useAiSuggestionOperations } from './useAiSuggestionOperations';
import { useClayWorkbookOperations } from './useClayWorkbookOperations';

export const useJobSearchApi = (companyId: string | null, userId: string | null) => {
  // Core operations
  const searchOps = useSearchOperations(companyId, userId);
  const saveOps = useSaveOperations(companyId, userId);
  const historyOps = useHistoryOperations(companyId, userId);
  const aiOps = useAiSuggestionOperations(companyId, userId);
  const clayOps = useClayWorkbookOperations(companyId, userId);

  // Export all operations
  return {
    searchJobs: searchOps.searchJobs,
    getStoredJobResults: searchOps.getStoredJobResults,
    saveSearch: saveOps.saveSearch,
    loadSearchHistory: historyOps.loadSearchHistory,
    deleteSearch: historyOps.deleteSearch,
    generateAiContactSuggestion: aiOps.generateAiContactSuggestion,
    createClayWorkbook: clayOps.createClayWorkbook
  };
};
