
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/job-parsing';
import { SearchParams } from '../state/useJobSearchState';
import { useJobSearchOperations } from './useJobSearchOperations';
import { useSearchHistoryOperations } from './useSearchHistoryOperations';

export const useJobSearchApi = (companyId: string | null, userId: string | null) => {
  const { searchJobs, getStoredJobResults } = useJobSearchOperations(companyId, userId);
  const { loadSearchHistory, saveSearch, deleteSearch } = useSearchHistoryOperations(companyId);

  const generateAiContactSuggestion = useCallback(async (jobs: Job[], query: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-contact-suggestion', {
        body: {
          jobs: jobs.slice(0, 5), // Use only top 5 jobs for suggestion
          query,
          userId,
          companyId
        }
      });

      if (error) {
        console.error('Error generating AI suggestion:', error);
        throw new Error(error.message || 'Failed to generate suggestion');
      }

      if (!data || !data.suggestion) {
        throw new Error('Invalid response from AI suggestion service');
      }

      return data.suggestion;
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      throw error;
    }
  }, [companyId, userId]);

  const getUserCompanyId = useCallback(async () => {
    try {
      if (!userId) {
        return null;
      }

      // Use the correct table name as found in the database
      const { data, error } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error getting user company ID:', error);
        return null;
      }

      return data?.company_id || null;
    } catch (error) {
      console.error('Error getting user company ID:', error);
      return null;
    }
  }, [userId]);

  return {
    searchJobs,
    generateAiContactSuggestion,
    loadSearchHistory,
    saveSearch,
    deleteSearch,
    getUserCompanyId,
    getStoredJobResults
  };
};
