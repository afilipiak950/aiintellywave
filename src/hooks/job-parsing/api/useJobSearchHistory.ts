
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { JobSearchHistory, Job } from '@/types/job-parsing';

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

      // Transform the data to ensure search_results is correctly typed as Job[]
      const typedHistory: JobSearchHistory[] = (data || []).map(item => {
        // Ensure search_results is properly typed as Job[]
        let searchResults: Job[] = [];
        
        if (item.search_results && Array.isArray(item.search_results)) {
          searchResults = item.search_results.map((result: any) => ({
            title: result.title || '',
            company: result.company || '',
            location: result.location || '',
            description: result.description || '',
            url: result.url || '',
            datePosted: result.datePosted || null,
            salary: result.salary || null,
            employmentType: result.employmentType || null,
            source: result.source || 'Google Jobs',
            directApplyLink: result.directApplyLink || null
          }));
        }
        
        return {
          ...item,
          search_results: searchResults
        } as JobSearchHistory;
      });

      setSearchHistory(typedHistory);
    } catch (err) {
      console.error('Error loading search history:', err);
      setSearchHistory([]);
    }
  };

  return { searchHistory, loadSearchHistory };
};
