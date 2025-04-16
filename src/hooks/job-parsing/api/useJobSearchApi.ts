
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/job-parsing';
import { SearchParams } from '../state/useJobSearchState';
import { useJobSearchOperations } from './useJobSearchOperations';

export const useJobSearchApi = (companyId: string | null, userId: string | null) => {
  const { searchJobs, getStoredJobResults } = useJobSearchOperations(companyId, userId);

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

  const loadSearchHistory = useCallback(async (userId: string, companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('job_search_history')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading search history:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error loading search history:', error);
      throw error;
    }
  }, []);

  const saveSearch = useCallback(async (userId: string, companyId: string, searchParams: SearchParams, results: Job[]) => {
    try {
      const { data, error } = await supabase
        .from('job_search_history')
        .insert({
          user_id: userId,
          company_id: companyId,
          search_query: searchParams.query,
          search_location: searchParams.location,
          search_experience: searchParams.experience,
          search_industry: searchParams.industry,
          search_results: results,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error saving search:', error);
        throw error;
      }

      return data?.id;
    } catch (error) {
      console.error('Error saving search:', error);
      throw error;
    }
  }, []);

  const deleteSearch = useCallback(async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('job_search_history')
        .delete()
        .eq('id', recordId);

      if (error) {
        console.error('Error deleting search record:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting search record:', error);
      throw error;
    }
  }, []);

  const getUserCompanyId = useCallback(async () => {
    try {
      if (!userId) {
        return null;
      }

      const { data, error } = await supabase
        .from('user_company_associations')
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
