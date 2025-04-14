
import { supabase } from '@/integrations/supabase/client';

export const useSearchHistoryOperations = (companyId: string | null) => {
  // Function to load search history
  const loadSearchHistory = async (userId: string): Promise<any[]> => {
    try {
      if (!companyId) {
        console.log('No company ID available for loading search history');
        return [];
      }
      
      console.log('Loading job search history for user:', userId);
      
      const { data, error } = await supabase
        .from('job_search_history')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error loading search history:', error);
        return [];
      }
      
      // Convert search_results from JSON to Job objects
      return data.map(record => ({
        ...record,
        search_results: record.search_results || [],
        ai_contact_suggestion: record.ai_contact_suggestion || null
      }));
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
    }
  };

  return {
    loadSearchHistory
  };
};
