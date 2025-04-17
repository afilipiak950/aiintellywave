
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { JobSearchHistory } from '@/types/job-parsing';

export const useJobSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<JobSearchHistory[]>([]);

  const loadSearchHistory = async (userId: string, companyId: string | null) => {
    try {
      const { data, error } = await supabase
        .from('job_search_history')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSearchHistory(data || []);
    } catch (err) {
      console.error('Error loading search history:', err);
      setSearchHistory([]);
    }
  };

  return { searchHistory, loadSearchHistory };
};
